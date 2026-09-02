import { Link } from "react-router-dom";
import { Logo } from "@/components/brand/Logo";

const GROUPS = [
  {
    title: "Product",
    links: [
      { to: "/", label: "Clean a file" },
      { to: "/how-it-works", label: "How it works" },
      { to: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Learn",
    links: [
      { to: "/resources", label: "Resources" },
      { to: "/about", label: "About" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-muted/20 py-10">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 sm:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,1fr))]">
        <div>
          <Logo size={24} withWordmark />
          <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
            Clean data. See clearly. Profiling, cleaning and charting that runs entirely in your
            browser.
          </p>
        </div>
        {GROUPS.map((g) => (
          <nav key={g.title} aria-label={g.title}>
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-foreground">
              {g.title}
            </h2>
            <ul className="mt-3 space-y-2">
              {g.links.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="mx-auto mt-8 flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/70 px-4 pt-5 text-[12px] text-muted-foreground">
        <span>© {new Date().getFullYear()} Nadiifi</span>
        <span className="ml-auto">Clean data. See clearly.</span>
      </div>
    </footer>
  );
}
