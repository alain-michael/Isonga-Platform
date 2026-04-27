import React, { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { notificationsAPI } from "../../services/coreService";
import NotificationDropdown from "./NotificationDropdown";

const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ["unreadNotificationCount"],
    queryFn: async () => {
      const res = await notificationsAPI.getUnreadCount();
      return res.data as { count: number };
    },
    refetchInterval: 30000,
  });

  const count = data?.count ?? 0;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute top-0.5 right-0.5 h-4 w-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <NotificationDropdown onClose={() => setOpen(false)} />
      )}
    </div>
  );
};

export default NotificationBell;
