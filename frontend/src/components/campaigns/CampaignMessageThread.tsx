import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, MessageSquare } from "lucide-react";
import { campaignMessagesAPI } from "../../services/campaignsService";
import { useAuth } from "../../contexts/AuthContext";

interface Props {
  campaignId: string;
  interestId?: string;
  receiverId: number;
  receiverName: string;
}

const CampaignMessageThread: React.FC<Props> = ({
  campaignId,
  interestId,
  receiverId,
  receiverName,
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", campaignId, interestId],
    queryFn: async () => {
      const res = await campaignMessagesAPI.getAll({
        campaign_id: campaignId,
        interest_id: interestId,
      });
      return res.data as any[];
    },
    refetchInterval: 10000,
  });

  const sendMutation = useMutation({
    mutationFn: () =>
      campaignMessagesAPI.create({
        campaign: campaignId,
        receiver: receiverId,
        content,
        interest: interestId,
      }),
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["messages", campaignId, interestId] });
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    sendMutation.mutate();
  };

  return (
    <div className="flex flex-col h-80 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
        <MessageSquare className="h-4 w-4 text-primary-600" />
        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          Chat with {receiverName}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white dark:bg-neutral-900">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-neutral-400 py-8">
            No messages yet. Start the conversation.
          </p>
        ) : (
          messages.map((msg: any) => {
            const isOwn = msg.sender === user?.id || msg.sender?.id === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                    isOwn
                      ? "bg-primary-600 text-white"
                      : "bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                  }`}
                >
                  <p>{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwn ? "text-primary-200" : "text-neutral-400"
                    }`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 px-4 py-3 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
      >
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          type="submit"
          disabled={!content.trim() || sendMutation.isPending}
          className="p-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white rounded-lg transition"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};

export default CampaignMessageThread;
