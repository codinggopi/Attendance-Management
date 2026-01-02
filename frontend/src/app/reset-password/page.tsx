"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { resetPassword } from "@/lib/api";
import { Mail, Eye, EyeOff } from "lucide-react";
import { LoadingButton } from "@/components/ui/loading-button";
import { title } from "process";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await resetPassword(username, newPassword);
      toast({
        title: "Password reset successful",
        description: "You can now login with your new password.",
      });
      router.push("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Reset failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center 
      bg-gradient-to-br from-indigo-200 via-sky-200 to-cyan-100 p-4">

      {/* Page animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md "
      >
        {/* Card animation */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <Card className="shadow-2xl border border-muted/30 backdrop-blur-lg bg-background/1000">
            <CardHeader>
              <CardTitle className="text-center text-2xl ">
                Reset Password
              </CardTitle>
              <CardDescription className="text-center">
                Enter your username and new password
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Username */}
                <div>
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <Input
                      id="username"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="pr-10 focus:ring-2 focus:ring-primary border-gray-400"
                    />
                    <Mail
                      size={18}
                      className="absolute right-3 top-1/2 -translate-y-1/2 
                        text-muted-foreground"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="pr-16 focus:ring-1 focus:ring-border border-gray-400"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 
                        text-muted-foreground"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Animated button */}
                <motion.div
  whileHover={!loading ? { scale: 1.02 } : undefined}
  whileTap={!loading ? { scale: 0.96 } : undefined}
>
  <Button
    type="submit"
    disabled={loading}
    className={`w-full flex items-center justify-center gap-2
      ${loading ? "cursor-not-allowed" : ""}
    `}
  >
    {loading ? (
      <>
        <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        Resetting...
      </>
    ) : (
      "Reset Password"
    )}
  </Button>
</motion.div>





              </form>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
