"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type LoadingButtonProps = {
  loading?: boolean;
  children: React.ReactNode;
} & React.ComponentProps<typeof Button>;

export function LoadingButton({
  loading = false,
  children,
  className,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      {...props}
      disabled={loading || disabled}
      className={cn("flex items-center gap-2", className)}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}
