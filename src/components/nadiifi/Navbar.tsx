import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Github } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/app/ThemeToggle";
import { useAuth } from "@/lib/auth/AuthProvider";
import { UserMenu } from "@/components/nadiifi/UserMenu";

const LINKS = [
  { href: "#tool", label: "Clean" },
  { href: "#how", label: "How it works" },
  { href: "#detects", label: "Features" },
  { href: "#resources", label: "Resources" },
];

export function Navbar({ onStart }: { onStart: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
        <a href="#top" className="flex items-center" aria-label="Nadiifi home">
          <Logo size={26} withWordmark />
        </a>

        <nav className="mx-auto hidden items-center gap-1 md:flex" aria-label="Main">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
          <a
            href="https://github.com/Diini03/nadiifi-data"
            target="_blank"
            rel="noreferrer"
            className="rounded-md px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            GitHub
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <ThemeToggle />
          {user ? (
            <UserMenu />
          ) : (
            <Button asChild variant="ghost" size="sm" className="hidden h-8 text-[13px] sm:inline-flex">
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
          <Button
            size="sm"
            onClick={onStart}
            className="h-8 rounded-md text-[13px] font-semibold shadow-glow"
          >
            Start cleaning
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8 md:hidden" aria-label="Open menu">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="rounded-b-xl px-4 pb-6 pt-12">
              <nav className="flex flex-col gap-1" aria-label="Mobile">
                {LINKS.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-3 text-[15px] font-medium hover:bg-muted"
                  >
                    {l.label}
                  </a>
                ))}
                <a
                  href="https://github.com/Diini03/nadiifi-data"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-md px-3 py-3 text-[15px] font-medium hover:bg-muted"
                >
                  <Github className="h-4 w-4" /> GitHub
                </a>
                {!user && (
                  <Button asChild variant="outline" className="mt-2 w-full">
                    <Link to="/auth" onClick={() => setOpen(false)}>Sign in</Link>
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
