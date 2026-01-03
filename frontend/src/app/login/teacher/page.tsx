"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import * as api from "@/lib/api";
import{Mail, Eye, EyeOff} from "lucide-react";
import { LoadingButton } from "@/components/ui/loading-button";
export default function TeacherLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    try {
      setLoading(true);
      const data = await api.loginUser(email, password);

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("role", data.role);

      // ✅ 2 seconds loading before redirect
      setTimeout(() => {
        router.push("/teacher");
      }, 2000);
    } catch {
      alert("Invalid credentials");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-300 via-teal-100 to-cyan-200">
      
      {/* Animated Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-96 p-6 rounded-xl  shadow-xl space-y-4 border-2"
      >
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-semibold text-center text-emerald-500/90 tracking-wide"
        >
          Teacher Login
        </motion.h2>
<form onSubmit={handleLogin}>

  {/* Email */}
  <div className="relative">
    <input
      type="email"
      required
      placeholder="Email"
      className="w-full border rounded-md p-2 
        focus:ring-1 outline-none focus:ring-green-300 transition-colors
        hover:border-emerald-500 border-emerald-200"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />

    <Mail
      size={18}
      className="absolute right-3 top-1/2 -translate-y-1/2 
        text-emerald-400"
    />
  </div>

  {/* Password */}
  <div className="relative mt-4">
    <input
      type={showPassword ? "text" : "password"}
      required
      placeholder="Password"
      className="w-full border rounded-md p-2 
        focus:ring-1 outline-none focus:ring-green-300 transition-colors
        hover:border-emerald-500 border-emerald-200"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />

    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 
        text-emerald-400 hover:text-emerald-500 transition"
    >
      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>

  {/* Reset password */}
  <div className="text-right mt-2">
    <button
      type="button"
      onClick={() => router.push("/reset-password")}
      className="text-sm text-green-500 font-serif hover:underline"
    >
      Forgot password?
    </button>
  </div>

  {/* Animated Login Button */}
  <motion.button
    type="submit"          // 🔥 IMPORTANT
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.96 }}
    disabled={loading}
    className="w-full bg-emerald-300 text-white hover:text-emerald-500 
      font-semibold p-2 rounded-md mt-2 tracking-widest"
  >
    {loading ? (
      <span className="flex items-center justify-center gap-2">
        <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        Logging in...
      </span>
    ) : (
      "L O G I N"
    )}
  </motion.button>

</form>
      </motion.div>
    </div>
  );
}
