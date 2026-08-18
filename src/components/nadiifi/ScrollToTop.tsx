import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Resets scroll position on every route change. */
export function ScrollRestoration() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);

  return null;
}

/** Floating "back to top" button, appears after scrolling down. */
export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-16 right-4 z-50 h-9 w-9 rounded-full border-border/70 bg-background/90 shadow-md backdrop-blur transition-opacity hover:bg-muted"
    >
      <ArrowUp className="h-4 w-4" />
    </Button>
  );
}
