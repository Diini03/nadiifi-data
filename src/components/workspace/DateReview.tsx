import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { parseDateSmart, detectDayFirst, dateFormatOf } from "@/lib/cleanlab/dates";
import { isNullish } from "@/lib/cleanlab/infer";
import type { Dataset, Operation } from "@/lib/cleanlab/types";
export function DateReview({dataset, onApply}:{dataset:Dataset; onApply:(op:Operation)=>void}) {
 const [orders,setOrders]=useState<Record<string,boolean>>({});
 const cols=dataset.columns.filter(c=>c.type==='date'||/date|timestamp/i.test(c.name)||dataset.rows.filter(r=>dateFormatOf(r[c.name])).length>dataset.rows.length*0.6);
 return <div className="space-y-4">{cols.map(c=>{
 const vals=dataset.rows.map(r=>r[c.name]); const dayFirst=orders[c.name]??detectDayFirst(vals);
 const changes=vals.map((v,i)=>({v,i,to:parseDateSmart(v,dayFirst)})).filter(r=>!isNullish(r.v)&&r.v!==r.to);
 if(!changes.length)return null;
 const invalid=changes.filter(r=>r.to===null).length;
 return <section key={c.name} className="border-t border-border pt-4"><div className="flex flex-wrap items-center gap-3"><h3 className="font-semibold">Review dates: {c.name}</h3><Select value={dayFirst?'day':'month'} onValueChange={v=>setOrders(o=>({...o,[c.name]:v==='day'}))}><SelectTrigger className="w-48" aria-label={`Date order for ${c.name}`}><SelectValue/></SelectTrigger><SelectContent><SelectItem value="day">Day / month / year</SelectItem><SelectItem value="month">Month / day / year</SelectItem></SelectContent></Select><Button size="sm" disabled={changes.every(r=>r.to===null)} onClick={()=>onApply({kind:'parse_date',column:c.name,dayFirst})}>Review date changes</Button></div>
 <p className="my-2 text-sm text-muted-foreground">Ambiguous dates follow your chosen order. {invalid} invalid values stay unchanged and excluded from time charts.</p>
 <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr><th>Row</th><th>Original</th><th>Proposed</th></tr></thead><tbody>{changes.slice(0,12).map(r=><tr key={r.i} className="border-t border-border"><td className="p-2">{r.i+1}</td><td className="p-2 font-mono">{String(r.v)}</td><td className="p-2 font-mono">{r.to??'Unparseable — keep original'}</td></tr>)}</tbody></table></div></section>;
 })}</div>;
}