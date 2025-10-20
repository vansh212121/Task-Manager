import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Settings, LogOut, Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { mockUser } from "@/lib/mockData";
import { useLogoutMutation } from "@/features/api/authApi";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectRefreshToken } from "@/features/authSlice";
import { toast } from "sonner";

export const Navbar = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const refreshToken = useSelector(selectRefreshToken);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const handleLogout = () => {
    if (refreshToken) {
      const promise = logout({ refresh_token: refreshToken }).unwrap();

      toast.promise(promise, {
        loading: "Signing out...",
        success: () => {
          navigate("/login");
          return "You have been signed out successfully!";
        },
        error: () => {
          navigate("/login");
          return "Logout failed on the server, but you are now signed out.";
        },
      });
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center shadow-lg hover-lift">
              <CheckCircle2 className="w-7 h-7 text-primary-foreground" />
            </div>
            <Link to="/dashboard">
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] bg-clip-text text-transparent">
                  TaskFlow
                </span>
                <span className="text-xs text-muted-foreground -mt-1">
                  Productivity Suite
                </span>
              </div>
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-pink-400"
                >
                  <Bell className="w-5 h-5 " />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full border-2 border-card"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    3 new
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-60 overflow-y-auto p-1">
                  <div className="p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                    <p className="text-sm font-medium">Task completed</p>
                    <p className="text-xs text-muted-foreground">
                      You completed "Design Review"
                    </p>
                    <span className="text-xs text-muted-foreground">
                      2 hours ago
                    </span>
                  </div>
                  <div className="p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                    <p className="text-sm font-medium">New assignment</p>
                    <p className="text-xs text-muted-foreground">
                      You were assigned "Project Planning"
                    </p>
                    <span className="text-xs text-muted-foreground">
                      1 day ago
                    </span>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none focus-ring rounded-full">
                  <div className="flex items-center gap-3 p-1 rounded-2xl hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="hidden sm:flex flex-col items-end">
                      <span className="text-sm font-medium text-foreground">
                        {currentUser.name}
                      </span>
                    </div>
                    <Avatar className="w-10 h-10 border-2 border-muted hover-lift">
                      <AvatarImage
                        src={mockUser.avatar}
                        alt={currentUser.name}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-primary-foreground font-semibold">
                        {getInitials(currentUser.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage
                          src={mockUser.avatar}
                          alt={currentUser.name}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-primary-foreground font-semibold">
                          {getInitials(currentUser.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium">
                          {currentUser.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {currentUser.email}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate("/dashboard")}
                    className="cursor-pointer py-3"
                  >
                    <CheckCircle2 className="mr-3 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/settings")}
                    className="cursor-pointer py-3"
                  >
                    <Settings className="mr-3 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="cursor-pointer py-3 text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
};
