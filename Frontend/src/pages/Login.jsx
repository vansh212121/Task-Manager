import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Calendar,
  Target,
  Zap,
} from "lucide-react";
import { useLoginMutation } from "@/features/api/authApi";
import { handleError } from "@/lib/handleError";
import { toast } from "sonner";
import { motion } from "framer-motion";

const Login = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();

  const handleLoginChange = (e) => {
    setLoginData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const loginSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(loginData).unwrap();
      toast.success("Login Successful", { description: "Redirecting..." });
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      handleError(error, "Login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[hsl(var(--soft-pale))] via-white to-[hsl(var(--light-neutral)/0.3)] relative overflow-hidden">
      {/* Background Blobs (fade in gently) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        className="absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[hsl(var(--rosy-accent)/0.08)] rounded-full blur-2xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[hsl(var(--primary)/0.08)] rounded-full blur-2xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[hsl(var(--accent)/0.05)] rounded-full blur-2xl" />
      </motion.div>

      {/* Floating Icons (staggered for visual depth) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="absolute top-20 left-20"
      >
        <Calendar className="w-8 h-8 text-[hsl(var(--primary)/0.5)]" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="absolute bottom-20 right-20"
      >
        <Target className="w-8 h-8 text-[hsl(var(--accent)/0.5)]" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute top-1/3 right-1/4"
      >
        <Zap className="w-6 h-6 text-[hsl(var(--rosy-accent)/0.5)]" />
      </motion.div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        style={{ willChange: "transform, opacity" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/40 shadow-lg p-8 transition-transform duration-300 hover:-translate-y-1">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center shadow-md">
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

          {/* Form */}
          <form onSubmit={loginSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-semibold">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                required
                value={loginData.email}
                onChange={handleLoginChange}
                disabled={isLoginLoading}
                className="h-14 px-4 text-lg rounded-2xl border-2 transition-all duration-200 focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Password */}
            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-semibold">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  className="h-14 px-4 pr-12 text-lg rounded-2xl border-2 transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--muted)/0.4)] transition-all duration-150"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked)}
                  className="w-5 h-5 rounded-lg data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-medium cursor-pointer text-foreground/90 hover:text-foreground transition-colors"
                >
                  Remember me
                </Label>
              </div>

              <button
                type="button"
                className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors px-3 py-2 rounded-xl hover:bg-[hsl(var(--primary)/0.1)]"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-14 text-lg font-semibold rounded-2xl bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] hover:shadow-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform duration-300"
              disabled={isLoginLoading}
            >
              {isLoginLoading ? (
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

            {/* Sign Up */}
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
      </motion.div>
    </div>
  );
};

export default Login;
