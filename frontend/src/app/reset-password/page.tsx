"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { resetPassword } from "@/lib/api";
import { Mail, Eye, EyeOff } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const leftVariant = {
    hidden: { x: -60, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  };
  const rightVariant = {
    hidden: { x: 60, opacity: 0 },
    visible: { x: 0, opacity: 1 }
    };
  const fadeUp = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password mismatch",
        description: "New password and confirm password do not match.",
      });
      return;
    }

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
        description: error.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto p-4 ">
        <PageHeader title="A+ Attendance " />
      </div>
      {/* CONTENT */}
      <div className="flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <Card className="bg-card border border-border shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-foreground">
                Reset Password
              </CardTitle>
              <CardDescription className="text-center">
                Enter your username and new password
              </CardDescription>
            </CardHeader>

<CardContent>
  <motion.form
    onSubmit={handleSubmit}
    initial="hidden"
    animate="visible"
    transition={{ staggerChildren: 0.2 }}
    className="space-y-6"
  >
    {/* LEFT SIDE */}
    <motion.div
      variants={leftVariant}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-4"
    >
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
            className="pr-10"
          />
          <Mail
            size={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
        </div>
      </div>
    </motion.div>

    {/* RIGHT SIDE */}
    <motion.div
      variants={rightVariant}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-4"
    >
      {/* New Password */}
      <div>
        <Label>New Password</Label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="pr-16"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <Label>Confirm Password</Label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="pr-16"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
    </motion.div>

    {/* BUTTON */}
    <motion.div
      variants={fadeUp}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Button
        type="submit"
        disabled={loading}
        className="w-full"
      >
        {loading ? "Resetting..." : "Reset Password"}
      </Button>
    </motion.div>
  </motion.form>
</CardContent>

          </Card>
        </motion.div>
      </div>
    </div>
  );
}
