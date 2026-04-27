import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { CheckCheck, Loader2 } from "lucide-react";
import { notificationsAPI } from "../../services/coreService";

interface Props {
  onClose: () => void;
}

const NotificationDropdown: React.FC<Props> = ({ onClose }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await notificationsAPI.getAll();
      const d = res.data as any;
      const list = Array.isArray(d) ? d : d?.results || [];
      return list.slice(0, 10) as any[];
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsAPI.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsAPI.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    },
  });

  const handleClick = (notification: any) => {
    if (!notification.is_read) {
      markReadMutation.mutate(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
      onClose();
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "Just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Notifications
        </h3>
        <button
          onClick={() => markAllReadMutation.mutate()}
          disabled={markAllReadMutation.isPending}
          className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 disabled:opacity-50"
        >
          <CheckCheck className="h-3.5 w-3.5" />
          Mark all read
        </button>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-10 text-center text-sm text-neutral-400">
            No notifications yet
          </div>
        ) : (
          notifications.map((n: any) => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={`w-full text-left px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors border-b border-neutral-100 dark:border-neutral-700/50 last:border-b-0 flex gap-3 ${
                !n.is_read ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
              }`}
            >
              {/* Unread dot */}
              <div className="mt-1.5 flex-shrink-0">
                <span
                  className={`block h-2 w-2 rounded-full ${
                    n.is_read
                      ? "bg-transparent"
                      : "bg-primary-500"
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                  {n.title}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-0.5">
                  {n.message}
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  {formatRelativeTime(n.created_at)}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
