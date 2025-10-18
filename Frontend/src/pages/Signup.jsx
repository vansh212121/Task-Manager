import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { mockApi } from "@/lib/mockData";
import { Eye, EyeOff, Sparkles, ArrowRight, Check, X } from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const hasMinLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return {
      hasMinLength,
      hasNumber,
      hasLetter,
      hasSpecialChar,
      isValid: hasMinLength && hasNumber && hasLetter,
    };
  };

  const passwordValidation = validatePassword(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (!passwordValidation.isValid) {
      newErrors.password = "Password does not meet requirements";
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
      await mockApi.signup(name, email, password);
      toast({
        title: "Account created!",
        description: "Welcome to Task Manager. Let's get started!",
        duration: 3000,
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-6 md:px-10 bg-gradient-to-br from-[hsl(var(--light-neutral))] via-white to-[hsl(var(--soft-pale)/0.5)] relative overflow-hidden page-transition">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-60 -left-60 w-96 h-96 bg-[hsl(var(--accent)/0.1)] rounded-full blur-3xl"></div>
        <div className="absolute -bottom-60 -right-60 w-96 h-96 bg-[hsl(var(--primary)/0.1)] rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-[hsl(var(--rosy-accent)/0.08)] rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-5xl relative z-10">
        <div className="grid md:grid-cols-2 gap-16 md:gap-20 items-center">
          {/* Left Side - Branding */}
          <div className="text-center md:text-left space-y-8 animate-slide-up">
            <div className="space-y-6">
              <div className="flex md:justify-start justify-center">
                <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--primary))] flex items-center justify-center shadow-2xl hover-lift">
                  <Sparkles className="w-14 h-14 text-white" />
                </div>
              </div>
              <h1 className="text-6xl font-extrabold bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--primary))] bg-clip-text text-transparent">
                Join Us
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                Start your journey towards better productivity and organized
                task management.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-5 pt-6">
              {[
                { color: "primary", text: "Smart task organization" },
                { color: "accent", text: "Real-time collaboration" },
                { color: "rosy-accent", text: "Progress tracking" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-5 text-foreground/80"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-[hsl(var(--${item.color})/0.1)] flex items-center justify-center`}
                  >
                    <Check
                      className={`w-6 h-6 text-[hsl(var(--${item.color}))]`}
                    />
                  </div>
                  <span className="font-medium text-lg">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-2xl shadow-[hsl(var(--accent)/0.1)] hover-lift p-10 md:p-12 animate-scale-in">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-foreground">
                Create Account
              </h2>
              <p className="text-muted-foreground mt-3 text-base">
                Fill in your details to get started
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                {/* Name Field */}
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-sm font-semibold">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name)
                        setErrors({ ...errors, name: undefined });
                    }}
                    className={`h-12 px-5 rounded-2xl border-2 transition-all duration-300 ${
                      errors.name
                        ? "border-destructive"
                        : "border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/0.5)] focus:border-[hsl(var(--accent))]"
                    } bg-white/50 backdrop-blur-sm`}
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive flex items-center gap-2 animate-fade-in">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-semibold">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email)
                        setErrors({ ...errors, email: undefined });
                    }}
                    className={`h-12 px-5 rounded-2xl border-2 transition-all duration-300 ${
                      errors.email
                        ? "border-destructive"
                        : "border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/0.5)] focus:border-[hsl(var(--accent))]"
                    } bg-white/50 backdrop-blur-sm`}
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive flex items-center gap-2 animate-fade-in">
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
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password)
                          setErrors({ ...errors, password: undefined });
                      }}
                      className={`h-12 px-4 pr-12 focus-ring transition-all duration-300 rounded-2xl border-2 ${
                        errors.password
                          ? "border-destructive shadow-sm"
                          : "border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/0.5)] focus:border-[hsl(var(--accent))]"
                      } bg-white/50 backdrop-blur-sm`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--muted)/0.5)] transition-all duration-200"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Password Requirements */}
                  {password && (
                    <div className="mt-4 p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-[hsl(var(--border))] space-y-3 animate-fade-in">
                      <p className="text-sm font-semibold text-foreground mb-2">
                        Password Strength:
                      </p>
                      <PasswordRequirement
                        met={passwordValidation.hasMinLength}
                      >
                        At least 8 characters
                      </PasswordRequirement>
                      <PasswordRequirement met={passwordValidation.hasNumber}>
                        Contains a number
                      </PasswordRequirement>
                      <PasswordRequirement met={passwordValidation.hasLetter}>
                        Contains a letter
                      </PasswordRequirement>
                      <PasswordRequirement
                        met={passwordValidation.hasSpecialChar}
                      >
                        Special character (optional)
                      </PasswordRequirement>
                    </div>
                  )}

                  {errors.password && (
                    <p className="text-sm text-destructive animate-fade-in flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--primary))] hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    Create Account
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                )}
              </Button>

              {/* Login Link */}
              <div className="text-center pt-4">
                <p className="text-foreground/70">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-bold text-primary hover:text-primary/80 transition-colors px-3 py-2 rounded-xl hover:bg-[hsl(var(--primary)/0.1)]"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const PasswordRequirement = ({ met, children }) => (
  <div className="flex items-center gap-3 text-sm">
    <div
      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 ${
        met
          ? "bg-green-100 text-green-600 shadow-sm"
          : "bg-[hsl(var(--muted))] text-muted-foreground"
      }`}
    >
      {met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
    </div>
    <span
      className={met ? "text-green-600 font-medium" : "text-muted-foreground"}
    >
      {children}
    </span>
  </div>
);

export default Signup;
