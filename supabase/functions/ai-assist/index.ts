import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const Body = z.object({
  mode: z.enum(["summary", "suggest", "explain"]),
  digest: z.unknown(),
  issue: z.string().max(2000).optional(),
});

const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extra },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Invalid request" }, 400);
    const { mode, digest, issue } = parsed.data;
    const digestStr = JSON.stringify(digest);
    if (digestStr.length > 60_000) return json({ error: "Dataset profile too large" }, 400);

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI is not configured" }, 500);

    const system =
      mode === "summary"
        ? "You are a senior data analyst. Given a compact JSON profile of a dataset (column names, types and statistics only), write a plain-English briefing. Format exactly: a 2-3 sentence overview paragraph, then a line 'Key findings:' followed by 3-4 lines starting with '- ', then a line 'Next steps:' followed by 2-3 lines starting with '- '. Keep it under 200 words. Only state facts supported by the profile. No markdown headings or bold."
        : mode === "suggest"
        ? "You are a data-cleaning expert. Given a dataset profile with detected issues, output an ordered, actionable list (max 6 items) of cleaning operations, each with a one-line justification. Numbered list. No preamble."
        : "You are a data quality expert. Explain the given data issue in 2-3 short sentences and suggest one concrete fix. Plain text.";

    const user = mode === "explain" ? `Issue: ${issue ?? ""}\nContext:\n${digestStr}` : digestStr;

    const runId = req.headers.get("X-Lovable-AIG-Run-ID");
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      signal: req.signal,
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
        ...(runId ? { "X-Lovable-AIG-Run-ID": runId } : {}),
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        instructions: system,
        input: user,
        stream: true,
        store: false,
        reasoning: { effort: "low", summary: "auto" },
        include: ["reasoning.encrypted_content"],
      }),
    });

    const aigHeaders: Record<string, string> = {};
    resp.headers.forEach((v, k) => {
      if (k.toLowerCase().startsWith("x-lovable-aig-")) aigHeaders[k] = v;
    });

    if (!resp.ok || !resp.body) {
      const errText = await resp.text().catch(() => "");
      console.error("AI gateway error:", resp.status, errText);
      let message = "AI request failed";
      try {
        const j = JSON.parse(errText);
        message = j?.message ?? j?.error?.message ?? message;
      } catch { /* ignore */ }
      if (resp.status === 429) message = "Too many AI requests right now. Please try again shortly.";
      if (resp.status === 402) message = message || "AI credits exhausted.";
      const status = [400, 401, 402, 403, 404, 429].includes(resp.status) ? resp.status : 502;
      return json({ error: message }, status, aigHeaders);
    }

    // Consume the SSE stream server-side and return the final text.
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let text = "";
    let failed: string | null = null;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let idx;
      while ((idx = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, idx).trim();
        buf = buf.slice(idx + 1);
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const ev = JSON.parse(data);
          if (ev.type === "response.output_text.delta") text += ev.delta ?? "";
          else if (ev.type === "response.failed" || ev.type === "error")
            failed = ev?.response?.error?.message ?? ev?.message ?? "AI request failed";
        } catch { /* partial */ }
      }
    }

    if (failed) return json({ error: failed }, 502, aigHeaders);
    if (!text.trim()) return json({ error: "The AI returned no answer for this dataset." }, 502, aigHeaders);
    return json({ text: text.trim() }, 200, aigHeaders);
  } catch (e) {
    if (req.signal.aborted) return new Response(null, { status: 499, headers: corsHeaders });
    console.error("ai-assist error:", e);
    return json({ error: "AI request failed" }, 500);
  }
});
