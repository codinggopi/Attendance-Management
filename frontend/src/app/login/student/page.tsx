"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import * as api from "@/lib/api";
import {Mail, Eye, EyeOff} from "lucide-react";
import { LoadingButton } from "@/components/ui/loading-button";

export default function StudentLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e?.preventDefault()) return;

    try {
      setLoading(true);
      const data = await api.loginUser(email, password);

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("role", data.role);

      // ✅ 2 seconds loading before redirect
      setTimeout(() => {
        router.push("/student");
      }, 2000);
    } catch {
      alert("Invalid credentials");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-200 via-blue-200 to-indigo-200">
      
      {/* Animated card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-96 p-6 rounded-xl backdrop-blur-lg shadow-2xl border"
      >
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-semibold text-blue-600 text-center mb-6 "
        >
          Student Login
        </motion.h2>
        {/* Inputs */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-4">
            {/* Email */}
            <div className="relative">
              <input
                type="email"
                required
                disabled={loading}
                placeholder="Email"
                className="placeholder:text-gray-500 w-full border rounded-md p-2
                focus:ring-1 focus:ring-blue-300 border-blue-500 outline-none hover:shadow-xl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 
                text-blue-500 hover:text-blue-700 transition"
              />
            </div>
            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                disabled={loading}
                className="w-full border rounded-md p-2
                focus:ring-1 focus:ring-blue-300 border-blue-500 outline-none hover:shadow-xl"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 
                text-blue-500 hover:text-blue-700 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Reset password */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => router.push("/reset-password")}
                className="text-sm text-blue-400 hover:underline font-semibold"
              >
                Forgot password ?
              </button>
            </div>

            {/* Login Button */}
            <motion.button
              type="submit"        // 🔥 IMPORTANT
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              disabled={loading}
              className="w-full bg-blue-400 text-white p-2 rounded-md mt-2
              hover:bg-blue-500 font-semibold tracking-widest"
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
          </div>
        </form>

      </motion.div>
    </div>
  );
}