import { Bell, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import * as api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function NotificationSection() {
  const { toast } = useToast();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [role, setRole] = useState<"student" | "teacher" | "all">("all");
  const [loading, setLoading] = useState(false);

  /* 🔄 LOAD ALL NOTIFICATIONS */
  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getAllNotifications();
        setNotifications(data);
      } catch {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load notifications",
        });
      }
    };
    load();
  }, [toast]);

  /* 📢 SEND NOTIFICATION */
  const sendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Title and message are required",
      });
      return;
    }

    try {
      setLoading(true);

      await api.sendNotification({
        title,
        message,
        role,
      });

      toast({
        title: "Notification sent",
        description: `Sent to ${role}`,
      });

      setTitle("");
      setMessage("");
      setRole("all");

      const updated = await api.getAllNotifications();
      setNotifications(updated);
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send notification",
      });
    } finally {
      setLoading(false);
    }
  };

  /* 🗑 DELETE NOTIFICATION */
  const deleteNotification = async (id: number) => {
    try {
      await api.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete notification",
      });
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell size={18} /> Notifications
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* CREATE */}
        <Input
          className="text-bold"
          placeholder="Notification title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Textarea
          placeholder="Notification message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <Select value={role} onValueChange={(v) => setRole(v as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Send To" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="student">Students</SelectItem>
            <SelectItem value="teacher">Teachers</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={sendNotification} disabled={loading}>
          {loading ? "Sending..." : "Send Notification"}
        </Button>

        {/* LIST */}
        <div className="space-y-2">
          {notifications.length === 0 && (
            <p className="text-sm text-muted-foreground text-center">
              No notifications yet
            </p>
          )}

          {notifications.map((n) => (
            <div
              key={n.id}
              className="border rounded p-3 flex justify-between items-start"
            >
              <div>
                <p className="font-semibold">{n.title}</p>
                <p className="text-sm text-muted-foreground">
                  {n.message}
                </p>
              </div>

              <Button
                size="icon"
                variant="ghost"
                onClick={() => deleteNotification(n.id)}
              >
                <Trash2 size={16} className="text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
