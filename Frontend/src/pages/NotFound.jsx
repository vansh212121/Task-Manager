import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Compass, Home, ArrowLeft, Ghost } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 page-transition bg-gradient-to-br from-[hsl(var(--soft-pale))] via-white to-[hsl(var(--light-neutral)/0.3)] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-60 -right-60 w-96 h-96 bg-[hsl(var(--rosy-accent)/0.1)] rounded-full blur-3xl"></div>
        <div className="absolute -bottom-60 -left-60 w-96 h-96 bg-[hsl(var(--primary)/0.1)] rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[hsl(var(--accent)/0.05)] rounded-full blur-3xl"></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute top-20 left-20 animate-float">
        <Compass className="w-10 h-10 text-[hsl(var(--primary)/0.4)]" />
      </div>
      <div
        className="absolute bottom-20 right-20 animate-float"
        style={{ animationDelay: "1s" }}
      >
        <Sparkles className="w-8 h-8 text-[hsl(var(--accent)/0.4)]" />
      </div>
      <div
        className="absolute top-1/3 right-1/4 animate-float"
        style={{ animationDelay: "2s" }}
      >
        <Ghost className="w-9 h-9 text-[hsl(var(--rosy-accent)/0.4)]" />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center space-y-8 animate-scale-in">
          {/* Main Content */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/40 shadow-2xl shadow-[hsl(var(--primary)/0.1)] p-12 hover-lift">
            {/* Animated 404 Number */}
            <div className="relative mb-8">
              <div className="text-9xl font-black bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] bg-clip-text text-transparent">
                404
              </div>
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-[hsl(var(--destructive))] rounded-full animate-pulse"></div>
              <div
                className="absolute -bottom-2 -left-2 w-6 h-6 bg-[hsl(var(--accent))] rounded-full animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>
            </div>

            {/* Title & Description */}
            <div className="space-y-4 mb-8">
              <h1 className="text-4xl font-bold text-foreground">
                Lost in Space?
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-md mx-auto">
                Oops! The page you're looking for seems to have drifted off into
                the digital cosmos. Let's get you back on track.
              </p>
              <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-destructive animate-pulse"></span>
                Attempted to access:{" "}
                <code className="bg-muted px-2 py-1 rounded-md text-foreground font-mono">
                  {location.pathname}
                </code>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                asChild
                className="h-12 px-8 rounded-2xl bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] hover:shadow-lg transition-all duration-300 hover-lift group"
              >
                <Link to="/" className="flex items-center gap-3">
                  <Home className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                  Return Home
                </Link>
              </Button>

              <Button
                variant="outline"
                className="h-12 px-8 rounded-2xl border-2 border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] transition-all duration-300 hover-lift group"
                onClick={() => window.history.back()}
              >
                <div className="flex items-center gap-3">
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                  Go Back
                </div>
              </Button>
            </div>
          </div>

          {/* Helpful Tips */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover-lift transition-all duration-300">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
                <Compass className="w-6 h-6 text-[hsl(var(--primary))]" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                Check the URL
              </h3>
              <p className="text-sm text-muted-foreground">
                Make sure the web address is spelled correctly
              </p>
            </div>

            <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover-lift transition-all duration-300">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-[hsl(var(--accent)/0.1)] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[hsl(var(--accent))]" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                Explore Navigation
              </h3>
              <p className="text-sm text-muted-foreground">
                Use the menu to find what you're looking for
              </p>
            </div>

            <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover-lift transition-all duration-300">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-[hsl(var(--rosy-accent)/0.1)] flex items-center justify-center">
                <Ghost className="w-6 h-6 text-[hsl(var(--rosy-accent))]" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Page Moved</h3>
              <p className="text-sm text-muted-foreground">
                The content might have been relocated or removed
              </p>
            </div>
          </div>

          {/* Fun Easter Egg */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground animate-pulse">
              ✨ Don't worry, even astronauts get lost sometimes!
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-10px) rotate(2deg);
          }
          66% {
            transform: translateY(5px) rotate(-2deg);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default NotFound;
