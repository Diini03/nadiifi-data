import { Link } from "react-router-dom";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

const FOOTER_LINKS = [
  {
    title: "Product",
    links: [
      { to: "/", label: "Clean a file" },
      { to: "/how-it-works", label: "How it works" },
      { to: "/pricing", label: "Pricing" },
      { to: "/workspace", label: "My workspace" },
    ],
  },
  {
    title: "Learn",
    links: [
      { to: "/resources", label: "Resources" },
      { to: "/about", label: "About" },
      { to: "/how-it-works", label: "Workflow" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "mailto:hello@nadiifi.com", label: "Contact" },
      { to: "/about", label: "Our story" },
      { to: "/pricing", label: "Plans" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/", label: "Privacy" },
      { to: "/", label: "Terms" },
    ],
  },
];

const SOCIALS = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Mail, href: "mailto:hello@nadiifi.com", label: "Email" },
];

function FooterLink({ link }: { link: { to?: string; href?: string; label: string } }) {
  const className =
    "text-[13px] text-muted-foreground transition-colors duration-200 hover:text-foreground";
  if (link.href) {
    return (
      <a href={link.href} className={className}>
        {link.label}
      </a>
    );
  }
  return (
    <Link to={link.to!} className={className}>
      {link.label}
    </Link>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-muted/30">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2fr]">
          {/* Brand + newsletter */}
          <div className="space-y-5">
            <Logo size={28} withWordmark />
            <p className="max-w-xs text-[14px] leading-relaxed text-muted-foreground">
              Clean data. See clearly. Profiling, cleaning and charting that runs entirely in your
              browser.
            </p>
            <form
              className="flex max-w-sm flex-col gap-2 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <Input
                type="email"
                placeholder="Get product updates"
                className="h-10 flex-1 rounded-lg bg-background text-[13px]"
                aria-label="Email for updates"
              />
              <Button
                type="submit"
                size="sm"
                className="h-10 rounded-lg bg-foreground px-4 text-[13px] font-semibold text-background hover:bg-foreground/90"
              >
                Subscribe
              </Button>
            </form>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {FOOTER_LINKS.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-foreground">
                  {group.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <FooterLink link={link} />
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/70 bg-background/40">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 py-5 sm:flex-row">
          <span className="text-[12px] text-muted-foreground">
            © {new Date().getFullYear()} Nadiifi. Clean data. See clearly.
          </span>

          <div className="flex items-center gap-1">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <social.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

