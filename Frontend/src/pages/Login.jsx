import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { mockApi } from "@/lib/mockData";
import {
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Calendar,
  Target,
  Zap,
} from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const form = e.currentTarget;
      form.classList.add("animate-shake");
      setTimeout(() => form.classList.remove("animate-shake"), 500);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await mockApi.login(email, password, rememberMe);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
        duration: 3000,
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description:
          error instanceof Error ? error.message : "Invalid credentials",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 page-transition bg-gradient-to-br from-[hsl(var(--soft-pale))] via-white to-[hsl(var(--light-neutral)/0.3)] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[hsl(var(--rosy-accent)/0.1)] rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[hsl(var(--primary)/0.1)] rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[hsl(var(--accent)/0.05)] rounded-full blur-3xl"></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute top-20 left-20 animate-float">
        <Calendar className="w-8 h-8 text-[hsl(var(--primary)/0.6)]" />
      </div>
      <div
        className="absolute bottom-20 right-20 animate-float"
        style={{ animationDelay: "1s" }}
      >
        <Target className="w-8 h-8 text-[hsl(var(--accent)/0.6)]" />
      </div>
      <div
        className="absolute top-1/3 right-1/4 animate-float"
        style={{ animationDelay: "2s" }}
      >
        <Zap className="w-6 h-6 text-[hsl(var(--rosy-accent)/0.6)]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/40 shadow-2xl shadow-[hsl(var(--primary)/0.1)] hover-lift p-8 animate-scale-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center shadow-lg hover-lift">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] bg-clip-text text-transparent mb-3">
              Welcome Back
            </h1>
            <p className="text-muted-foreground text-lg">
              Sign in to continue your productivity journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              {/* Email Field */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-semibold">
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email)
                        setErrors({ ...errors, email: undefined });
                    }}
                    className={`h-14 px-4 text-lg focus-ring transition-all duration-300 rounded-2xl border-2 ${
                      errors.email
                        ? "border-destructive shadow-sm"
                        : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)] focus:border-[hsl(var(--primary))]"
                    } bg-white/50 backdrop-blur-sm`}
                    placeholder="your@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive animate-fade-in flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-semibold">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password)
                        setErrors({ ...errors, password: undefined });
                    }}
                    className={`h-14 px-4 pr-12 text-lg focus-ring transition-all duration-300 rounded-2xl border-2 ${
                      errors.password
                        ? "border-destructive shadow-sm"
                        : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)] focus:border-[hsl(var(--primary))]"
                    } bg-white/50 backdrop-blur-sm`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--muted)/0.5)] transition-all duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive animate-fade-in flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                    {errors.password}
                  </p>
                )}
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked)}
                  className="w-5 h-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded-lg"
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-medium cursor-pointer text-foreground hover:text-foreground/80 transition-colors"
                >
                  Remember me
                </Label>
              </div>

              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors px-3 py-2 rounded-xl hover:bg-[hsl(var(--primary)/0.1)]"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-14 text-lg font-semibold hover-lift transition-all duration-300 rounded-2xl bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] hover:shadow-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] group"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  Continue to Dashboard
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              )}
            </Button>

            {/* Sign Up Link */}
            <div className="text-center pt-6">
              <p className="text-foreground/70">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-bold text-primary hover:text-primary/80 transition-colors px-3 py-2 rounded-xl hover:bg-[hsl(var(--primary)/0.1)]"
                >
                  Create one now
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;
