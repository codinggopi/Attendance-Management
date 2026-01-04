"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import * as api from "@/lib/api";
import { Mail, Eye, EyeOff } from "lucide-react";
import { LoadingButton } from "@/components/ui/loading-button";

/* ================= ANIMATION VARIANTS ================= */

const containerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariant = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function AdminLoginPage() {
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

      setTimeout(() => {
        router.push("/admin");
      }, 1200);
    } catch {
      alert("Invalid credentials");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-700 via-zinc-700 to-slate-700 p-4">

      {/* ===== ANIMATED CARD ===== */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-96 p-6 rounded-2xl bg-zinc-600 backdrop-blur-2xl shadow-2xl space-y-4 border border-zinc-300"
      >
        {/* ===== TITLE ===== */}
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-semibold text-center text-gray-200"
        >
          Admin Login
        </motion.h2>

        {/* ===== FORM ===== */}
        <motion.form
          onSubmit={handleLogin}
          variants={containerVariant}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {/* ===== EMAIL ===== */}
          <motion.div variants={itemVariant} className="relative">
            <input
              type="email"
              required
              placeholder="Email"
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="placeholder:text-gray-400 w-full border rounded-md p-2
                focus:ring-1 focus:ring-zinc-300 border-slate-800 outline-none bg-zinc-500 text-gray-100"
            />
            <Mail
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300"
            />
          </motion.div>

          {/* ===== PASSWORD ===== */}
          <motion.div variants={itemVariant} className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="placeholder:text-gray-400 w-full border rounded-md p-2
                focus:ring-1 focus:ring-zinc-300 border-slate-800 outline-none bg-zinc-500 text-gray-100"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </motion.div>

          {/* ===== FORGOT PASSWORD ===== */}
          <motion.div
            variants={itemVariant}
            className="text-right"
          >
            <button
              type="button"
              onClick={() => router.push("/reset-password")}
              className="text-sm text-gray-200 hover:underline font-semibold"
            >
              Forgot password?
            </button>
          </motion.div>

          {/* ===== LOGIN BUTTON ===== */}
          <motion.div
            variants={itemVariant}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
          >
            <LoadingButton
              type="submit"
              loading={loading}
              className="w-full bg-gray-400 text-gray-100 font-semibold p-2
                rounded-md mt-2 hover:bg-zinc-400 transition"
            >
              {loading ? "Logging in..." : "L O G I N"}
            </LoadingButton>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  );
}
