import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { campaignMessagesAPI } from "../../services/campaignsService";
import {
  MessageSquare,
  Send,
  Search,
  Building2,
  User,
  Clock,
  CheckCheck,
} from "lucide-react";

interface Message {
  id: string;
  campaign: string;
  campaign_title?: string;
  sender: number;
  sender_name: string;
  sender_type: string;
  receiver: number;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface Conversation {
  otherPartyId: number;
  otherPartyName: string;
  otherPartyType: string;
  campaignId: string;
  campaignTitle: string;
  lastMessage: Message;
  unreadCount: number;
  messages: Message[];
}

const Messages: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const location = useLocation();
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Get navigation state for auto-selecting conversation
  const navigationState = location.state as {
    campaignId: string;
    campaignTitle?: string;
    otherPartyId?: number;
    otherPartyType?: string;
  } | null;

  // Fetch all messages
  const { data: messagesResponse, isLoading } = useQuery({
    queryKey: ["messages"],
    queryFn: () => campaignMessagesAPI.getAll({}),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const messages = (messagesResponse?.data?.results || []) as Message[];

  // Mark message as read
  const markReadMutation = useMutation({
    mutationFn: (messageId: string) => campaignMessagesAPI.markRead(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: (data: {
      campaign: string;
      receiver: number;
      content: string;
    }) => campaignMessagesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      setMessageContent("");
    },
  });

  // Group messages into conversations
  const conversations: Conversation[] = React.useMemo(() => {
    const conversationMap = new Map<string, Conversation>();

    messages.forEach((msg) => {
      const isFromMe = msg.sender === user?.id;
      const otherPartyId = isFromMe ? msg.receiver : msg.sender;
      const key = `${msg.campaign}-${otherPartyId}`;

      if (!conversationMap.has(key)) {
        conversationMap.set(key, {
          otherPartyId,
          otherPartyName: isFromMe
            ? "Other Party"
            : msg.sender_name || "Unknown",
          otherPartyType: msg.sender_type,
          campaignId: msg.campaign,
          campaignTitle: msg.campaign_title || "Campaign",
          lastMessage: msg,
          unreadCount: 0,
          messages: [],
        });
      }

      const conversation = conversationMap.get(key)!;
      conversation.messages.push(msg);

      // Update last message if this one is newer
      if (
        new Date(msg.created_at) > new Date(conversation.lastMessage.created_at)
      ) {
        conversation.lastMessage = msg;
      }

      // Count unread messages from other party
      if (!isFromMe && !msg.is_read) {
        conversation.unreadCount++;
      }
    });

    // Sort by last message time
    return Array.from(conversationMap.values()).sort(
      (a, b) =>
        new Date(b.lastMessage.created_at).getTime() -
        new Date(a.lastMessage.created_at).getTime()
    );
  }, [messages, user?.id]);

  // Auto-select conversation from navigation state
  React.useEffect(() => {
    if (navigationState?.campaignId && !selectedConversation) {
      // Wait a bit for conversations to load
      const timer = setTimeout(() => {
        const targetConversation = conversations.find(
          (conv) => conv.campaignId === navigationState.campaignId
        );

        if (targetConversation) {
          setSelectedConversation(targetConversation);
          // Mark unread messages as read
          targetConversation.messages.forEach((msg) => {
            if (msg.receiver === user?.id && !msg.is_read) {
              markReadMutation.mutate(msg.id);
            }
          });
        } else {
          // Create a new conversation placeholder if it doesn't exist
          const newConversation: Conversation = {
            otherPartyId: navigationState.otherPartyId || 0,
            otherPartyName:
              navigationState.otherPartyType === "investor"
                ? "Investor"
                : "Enterprise",
            otherPartyType: navigationState.otherPartyType || "unknown",
            campaignId: navigationState.campaignId,
            campaignTitle: navigationState.campaignTitle || "Campaign",
            lastMessage: {} as Message,
            unreadCount: 0,
            messages: [],
          };
          setSelectedConversation(newConversation);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [navigationState, conversations, selectedConversation, user?.id]);

  // Filter conversations by search term
  const filteredConversations = conversations.filter(
    (conv) =>
      conv.otherPartyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.campaignTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle conversation selection
  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);

    // Mark unread messages as read
    conversation.messages.forEach((msg) => {
      if (msg.receiver === user?.id && !msg.is_read) {
        markReadMutation.mutate(msg.id);
      }
    });
  };

  // Handle send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !messageContent.trim()) return;

    sendMessageMutation.mutate({
      campaign: selectedConversation.campaignId,
      receiver: selectedConversation.otherPartyId,
      content: messageContent.trim(),
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-200 border-t-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900">Messages</h1>
        <p className="text-neutral-600 mt-2">
          Communicate with{" "}
          {user?.user_type === "investor" ? "enterprises" : "investors"} about
          campaigns
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 h-[calc(100vh-250px)]">
          {/* Conversations List */}
          <div className="lg:col-span-1 border-r border-neutral-200 flex flex-col">
            <div className="p-4 border-b border-neutral-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <MessageSquare className="h-12 w-12 text-neutral-400 mb-3" />
                  <p className="text-neutral-600 font-medium">
                    No conversations yet
                  </p>
                  <p className="text-sm text-neutral-500 mt-1">
                    Start a conversation from a campaign page
                  </p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={`${conversation.campaignId}-${conversation.otherPartyId}`}
                    onClick={() => handleSelectConversation(conversation)}
                    className={`p-4 border-b border-neutral-100 cursor-pointer transition-colors ${
                      selectedConversation?.campaignId ===
                        conversation.campaignId &&
                      selectedConversation?.otherPartyId ===
                        conversation.otherPartyId
                        ? "bg-primary-50"
                        : "hover:bg-neutral-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {conversation.otherPartyName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-neutral-900 truncate">
                            {conversation.otherPartyName}
                          </h4>
                          {conversation.unreadCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-primary-600 text-white text-xs font-bold rounded-full">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 mb-1 truncate flex items-center gap-1">
                          {conversation.otherPartyType === "investor" ? (
                            <User className="h-3 w-3" />
                          ) : (
                            <Building2 className="h-3 w-3" />
                          )}
                          {conversation.campaignTitle}
                        </p>
                        <p className="text-sm text-neutral-600 truncate">
                          {conversation.lastMessage.content}
                        </p>
                        <p className="text-xs text-neutral-400 mt-1">
                          {formatTime(conversation.lastMessage.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Messages Panel */}
          <div className="lg:col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Conversation Header */}
                <div className="p-4 border-b border-neutral-200 bg-neutral-50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold">
                      {selectedConversation.otherPartyName
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-900">
                        {selectedConversation.otherPartyName}
                      </h3>
                      <p className="text-sm text-neutral-500 flex items-center gap-1">
                        {selectedConversation.otherPartyType === "investor" ? (
                          <User className="h-3 w-3" />
                        ) : (
                          <Building2 className="h-3 w-3" />
                        )}
                        {selectedConversation.campaignTitle}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedConversation.messages
                    .sort(
                      (a, b) =>
                        new Date(a.created_at).getTime() -
                        new Date(b.created_at).getTime()
                    )
                    .map((msg) => {
                      const isFromMe = msg.sender === user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${
                            isFromMe ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[70%] ${
                              isFromMe
                                ? "bg-primary-600 text-white"
                                : "bg-neutral-100 text-neutral-900"
                            } rounded-2xl px-4 py-2`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {msg.content}
                            </p>
                            <div
                              className={`flex items-center gap-1 mt-1 text-xs ${
                                isFromMe
                                  ? "text-primary-100"
                                  : "text-neutral-500"
                              }`}
                            >
                              <Clock className="h-3 w-3" />
                              {formatTime(msg.created_at)}
                              {isFromMe && msg.is_read && (
                                <CheckCheck className="h-3 w-3 ml-1" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Message Input */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-4 border-t border-neutral-200"
                >
                  <div className="flex items-end gap-2">
                    <textarea
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      placeholder="Type your message..."
                      rows={2}
                      className="flex-1 px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500 resize-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                    <button
                      type="submit"
                      disabled={
                        !messageContent.trim() || sendMessageMutation.isPending
                      }
                      className="btn-primary px-4 py-2 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendMessageMutation.isPending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <MessageSquare className="h-16 w-16 text-neutral-300 mb-4" />
                <h3 className="text-lg font-semibold text-neutral-700 mb-2">
                  No conversation selected
                </h3>
                <p className="text-neutral-500">
                  Select a conversation from the list to start messaging
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
