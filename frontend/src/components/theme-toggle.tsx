"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  /* ✅ Prevent hydration mismatch */
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () =>
    setTheme(theme === "dark" ? "light" : "dark");

  /* ⌨️ Ctrl + D shortcut */
  useEffect(() => {
    if (!mounted) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        toggleTheme();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [mounted, theme]);

  /* 🚫 Do not render on server */
  if (!mounted) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className={cn(
              "transition-all",
              className
            )}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 transition-transform duration-300 rotate-0" />
            ) : (
              <Moon className="h-5 w-5 transition-transform duration-300 rotate-180" />
            )}
          </Button>
        </TooltipTrigger>

        <TooltipContent>
          <p>Switch theme</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
