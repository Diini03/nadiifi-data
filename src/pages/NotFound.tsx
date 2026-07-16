import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404: route not found:", location.pathname);
    document.title = "Not found · NadiifiData";
  }, [location.pathname]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-hero px-6">
      <div className="max-w-md text-center">
        <Logo size={40} className="mx-auto" />
        <div className="mt-8 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          Error 404
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The page at{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{location.pathname}</code>{" "}
          doesn't exist or has been moved.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-2 sm:flex-row">
          <Button asChild variant="outline" size="sm" className="h-9 gap-2">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" /> Back to landing
            </Link>
          </Button>
          <Button asChild size="sm" className="h-9 gap-2">
            <Link to="/app/dashboard">
              <Home className="h-4 w-4" /> Go to dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
