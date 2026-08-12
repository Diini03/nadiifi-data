import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Github } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/app/ThemeToggle";

const LINKS = [
  { href: "#product", label: "Product" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#features", label: "Features" },
  { href: "#resources", label: "Resources" },
];

export function TopNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2" aria-label="NadiifiData home">
          <Logo size={24} withWordmark wordmarkClassName="text-[15px]" />
        </Link>

        <nav className="hidden flex-1 items-center gap-1 md:flex" aria-label="Main">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-[13.5px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
          <a
            href="https://github.com/Diini03/nadiifi-data"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-[13.5px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Github className="h-3.5 w-3.5" aria-hidden />
            GitHub
          </a>
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="h-9 text-[13.5px]">
            <Link to="/auth">Sign In</Link>
          </Button>
          <Button asChild size="sm" className="h-9 rounded-lg text-[13.5px] shadow-glow">
            <Link to="/app">Get Started</Link>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="ml-auto min-h-11 min-w-11 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {open && (
        <div className="border-t border-border/70 bg-background md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3" aria-label="Mobile">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
            <a
              href="https://github.com/Diini03/nadiifi-data"
              target="_blank"
              rel="noreferrer"
              className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              GitHub
            </a>
            <div className="mt-2 flex gap-2">
              <Button asChild variant="outline" className="flex-1">
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild className="flex-1">
                <Link to="/app">Get Started</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
