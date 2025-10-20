import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  EyeOff,
  AlertTriangle,
  Check,
  X,
  Loader2,
  Save,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useChangeMyPasswordMutation,
  useDeleteMyAccountMutation,
  useGetMeQuery,
  useUpdateMyAccountMutation,
} from "@/features/api/userApi";
import { toast } from "sonner";
import { handleError } from "@/lib/handleError";

const Settings = () => {
  // Profile
  const { data: currentUser, isLoading: isLoadingUser } = useGetMeQuery();
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Apis
  const [updateMyProfile, { isLoading: isUpdatingProfile }] =
    useUpdateMyAccountMutation();
  const [changeMyPassword, { isLoading: isChangingPassword }] =
    useChangeMyPasswordMutation();
  const [deleteMyAccount, { isLoading: isDeleting }] =
    useDeleteMyAccountMutation();

  // Populate data
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || "",
        email: currentUser.email || "",
      });
    }
  }, [currentUser]);

  // --- Handlers ---
  const handleProfileInputChange = (e) => {
    setProfileData({ ...profileData, [e.target.id]: e.target.value });
  };

  const handlePasswordInputChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.id]: e.target.value });
  };

  // Password
  const [showPasswords, setShowPasswords] = useState(false);

  // Terms
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Delete Account
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const changedData = Object.keys(profileData).reduce((acc, key) => {
      if (profileData[key] !== currentUser[key]) acc[key] = profileData[key];
      return acc;
    }, {});

    if (Object.keys(changedData).length === 0) {
      toast.info("No profile changes to save.");
      return;
    }

    toast.promise(updateMyProfile(changedData).unwrap(), {
      loading: "Updating your profile...",
      success: "Profile updated successfully!",
      error: (err) => handleError(err, "Failed to update profile."),
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("New passwords do not match.");
      return;
    }
    const promise = changeMyPassword({
      current_password: passwordData.current_password,
      new_password: passwordData.new_password,
    }).unwrap();

    toast.promise(promise, {
      loading: "Changing your password...",
      success: () => {
        setPasswordData({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
        return "Password changed successfully! You are being logged out for security.";
      },
      error: (err) => handleError(err, "Failed to change password."),
    });
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteMyAccount().unwrap();
      toast.success("Account deleted successfully!");
      setShowDeleteDialog(false);
    } catch (err) {
      console.error("Deactivation failed:", err);
      toast.error("Failed to deactivate account. Logging out locally.");
      setShowDeleteDialog(false);
    }
  };

  // Password Validation
  const validatePassword = (password) => {
    const hasMinLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    // You might also need hasSpecialChar here if your backend requires it
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return {
      hasMinLength,
      hasNumber,
      hasLetter,
      hasSpecialChar, // Include this if needed
      // Check all required conditions
      isValid: hasMinLength && hasNumber && hasLetter && hasSpecialChar,
    };
  };

  const passwordValidation = validatePassword(passwordData.new_password);

  // --- Loading State ---
  if (isLoadingUser) {
    return (
      <div className="p-8 flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background page-transition">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your account and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="terms">Terms</TabsTrigger>
            <TabsTrigger value="danger">Danger Zone</TabsTrigger>
          </TabsList>

          {/* Profile */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Update Profile</CardTitle>
                <CardDescription>
                  Make changes to your personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={handleProfileInputChange}
                      className="mt-1 focus-ring"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleProfileInputChange}
                      className="mt-1 focus-ring"
                    />
                  </div>

                  <Button type="submit" disabled={isUpdatingProfile}>
                    {isUpdatingProfile ? "Saving..." : "Save changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Password */}
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Update Password</CardTitle>
                <CardDescription>
                  Change your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="current_password">Current password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="current_password"
                        type={showPasswords ? "text" : "password"}
                        placeholder="Enter current password"
                        value={passwordData.current_password}
                        onChange={handlePasswordInputChange}
                        required
                        className="focus-ring"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPasswords ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="new_password">New password</Label>
                    <Input
                      id="new_password"
                      type={showPasswords ? "text" : "password"}
                      value={passwordData.new_password}
                      onChange={handlePasswordInputChange}
                      placeholder="Enter new password"
                      required
                      className="mt-1 focus-ring"
                    />
                    {passwordData.new_password && (
                      <div className="mt-2 space-y-1">
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
                        {/* Add this back if your backend requires it */}
                        <PasswordRequirement
                          met={passwordValidation.hasSpecialChar}
                        >
                          Contains a special character
                        </PasswordRequirement>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="confirm_password">
                      Confirm new password
                    </Label>
                    <Input
                      id="confirm_password"
                      type={showPasswords ? "text" : "password"}
                      value={passwordData.confirm_password}
                      onChange={handlePasswordInputChange}
                      placeholder="Confirm new password"
                      required
                      className="mt-1 focus-ring"
                    />
                  </div>
                  {/* 
                  <Button type="submit" disabled={isUpdatingPassword}>
                    {isUpdatingPassword ? "Updating..." : "Update password"}
                  </Button> */}
                  <Button type="submit" disabled={isChangingPassword}>
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Changing...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Change Password
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Terms */}
          <TabsContent value="terms">
            <Card>
              <CardHeader>
                <CardTitle>Terms & Conditions</CardTitle>
                <CardDescription>Review our terms of service</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto border rounded-lg p-4 mb-4">
                  <div className="prose prose-sm max-w-none text-foreground">
                    <h3 className="text-lg font-semibold mb-2">
                      1. Acceptance of Terms
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      By accessing and using this task management application,
                      you accept and agree to be bound by the terms and
                      provision of this agreement.
                    </p>

                    <h3 className="text-lg font-semibold mb-2">
                      2. Use License
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Permission is granted to temporarily use the application
                      for personal, non-commercial transitory viewing only.
                    </p>

                    <h3 className="text-lg font-semibold mb-2">
                      3. Privacy Policy
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your privacy is important to us. We collect and process
                      your personal information in accordance with applicable
                      data protection laws.
                    </p>

                    <h3 className="text-lg font-semibold mb-2">
                      4. User Responsibilities
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You are responsible for maintaining the confidentiality of
                      your account and password and for restricting access to
                      your computer.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked)}
                  />
                  <Label htmlFor="terms" className="cursor-pointer">
                    I have read and accept the terms and conditions
                  </Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Danger Zone */}
          <TabsContent value="danger">
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-foreground mb-2">
                      Delete Account
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Once you delete your account, there is no going back. All
                      your data will be permanently removed. Please be certain.
                    </p>
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove all of your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Label htmlFor="delete-confirm" className="text-sm">
              Type <span className="font-mono font-bold">DELETE</span> to
              confirm
            </Label>
            <Input
              id="delete-confirm"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="mt-2 focus-ring"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== "DELETE" || isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const PasswordRequirement = ({ met, children }) => (
  <div className="flex items-center gap-2 text-sm">
    {met ? (
      <Check className="w-4 h-4 text-green-600" />
    ) : (
      <X className="w-4 h-4 text-muted-foreground" />
    )}
    <span className={met ? "text-green-600" : "text-muted-foreground"}>
      {children}
    </span>
  </div>
);

export default Settings;
