"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import * as api from "@/lib/api";
import {Mail, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      const data = await api.loginUser(email, password);

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("role", data.role);

      router.push("/admin");
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-700 via-zinc-700 to-slate-700 p-4">
      
      {/* Animated Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-96 p-6 rounded-2xl bg-zinc-600 backdrop-blur-2xl shadow-2xl space-y-4 hover:shadow-lg border-zinc-300 border"
      >
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-semibold text-center text-gray-200"
        >
          Admin Login
        </motion.h2>

{/* Email */}
<div className="relative">
  <input
    type="email"
    placeholder="Email"
    className="placeholder:text-gray-500 w-full border rounded-md p-2 focus:ring-1 focus:ring-zinc-300 border-slate-800 outline-none"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />

  <Mail
    size={18}
    className="absolute right-3 top-1/2 -translate-y-1/2 
    text-gray-500 hover:text-zinc-500 transition"
  />
</div>

        {/* Password + Eye */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full p-2 border rounded-md
              placeholder-gray-500 focus:ring-1 focus:ring-zinc-300 border-slate-800 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 
              text-gray-500 hover:text-zinc-500 transition"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Reset password */}
        <div className="text-right mt-2">
          <button
            type="button"
            onClick={() => router.push("/reset-password")}
            className="text-sm text-gray-200 hover:underline cursor-pointer font-semibold"
          >
            Forgot password?
          </button>
        </div>

        {/* Animated Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          className="w-full bg-gray-400 text-gray-100 font-semibold p-2 rounded-md mt-2 hover:bg-zinc-400 hover:text-gray-100 transition-colors tracking-normal"
          onClick={handleLogin}
        >
          L O G I N
        </motion.button>
      </motion.div>
    </div>
  );
}
