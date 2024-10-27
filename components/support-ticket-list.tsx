"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Send,
  Loader2,
  CheckCircle2,
  Edit2,
  Trash2,
  ArrowLeft,
  MoreVertical,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SupportTicket {
  id: string;
  subject: string;
  issue: string;
  created_at: string;
  status: "active" | "resolved" | "pending";
  user_id: string;
}

interface SupportMessage {
  id: string;
  session_id: string;
  user_id: string;
  content: string;
  created_at: string;
  seen: boolean;
  seen_at: string | null;
  is_admin: boolean;
}

export default function Component() {
  const { user } = useUser();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedMessageContent, setEditedMessageContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isTicketsLoading, setIsTicketsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!user) return;
    fetchTickets();

    const ticketsChannel = supabase.channel("admin-tickets");
    ticketsChannel
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "support_sessions" },
        () => {
          fetchTickets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ticketsChannel);
    };
  }, [user]);

  useEffect(() => {
    if (activeTicketId) {
      setIsMessagesLoading(true);
      fetchMessages(activeTicketId);

      const messagesChannel = supabase.channel(
        `support-ticket:${activeTicketId}`
      );
      messagesChannel
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "support_messages",
            filter: `session_id=eq.${activeTicketId}`,
          },
          () => {
            fetchMessages(activeTicketId);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(messagesChannel);
      };
    }
  }, [activeTicketId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchTickets = async () => {
    try {
      setIsTicketsLoading(true);
      const { data, error } = await supabase
        .from("support_sessions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setTickets(data);
    } catch (error) {
      setError("Error fetching tickets. Please try again.");
    } finally {
      setIsTicketsLoading(false);
      setIsLoading(false);
    }
  };

  const fetchMessages = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from("support_messages")
        .select("*")
        .eq("session_id", ticketId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setMessages(data);
      data.forEach((message: SupportMessage) => {
        if (!message.seen && !message.is_admin) {
          updateMessageSeen(message.id);
        }
      });
    } catch (error) {
      setError("Error fetching messages. Please try again.");
    } finally {
      setIsMessagesLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeTicketId) return;
    try {
      setIsSending(true);
      const { error } = await supabase
        .from("support_messages")
        .insert({
          session_id: activeTicketId,
          user_id: user?.id,
          content: newMessage,
          is_admin: true,
        });
      if (error) throw error;
      setNewMessage("");
    } catch (error) {
      setError("Error sending message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("support_sessions")
        .update({ status: newStatus })
        .eq("id", ticketId);
      if (error) throw error;
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === ticketId
            ? {
                ...ticket,
                status: newStatus as "active" | "resolved" | "pending",
              }
            : ticket
        )
      );
    } catch (error) {
      setError("Error updating ticket status. Please try again.");
    }
  };

  const updateMessageSeen = async (messageId: string) => {
    const { error } = await supabase
      .from("support_messages")
      .update({ seen: true, seen_at: new Date().toISOString() })
      .eq("id", messageId);
    if (error) console.error("Error updating message seen status:", error);
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    try {
      const { error } = await supabase
        .from("support_messages")
        .update({ content: newContent })
        .eq("id", messageId);
      if (error) throw error;
      setMessages((prevMessages) =>
        prevMessages.map((message) =>
          message.id === messageId
            ? { ...message, content: newContent }
            : message
        )
      );
      setEditingMessageId(null);
    } catch (error) {
      setError("Error editing message. Please try again.");
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from("support_messages")
        .delete()
        .eq("id", messageId);
      if (error) throw error;
      setMessages((prevMessages) =>
        prevMessages.filter((message) => message.id !== messageId)
      );
    } catch (error) {
      setError("Error deleting message. Please try again.");
    }
  };

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.issue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          You must be signed in to access this page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader className="bg-primary text-primary-foreground">
        <CardTitle className="text-2xl font-bold">
          Admin Support Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="w-full lg:w-1/3">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8"
                />
              </div>
            </div>
            <ScrollArea className="h-[calc(100vh-300px)]">
              <AnimatePresence>
                {isTicketsLoading
                  ? Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Skeleton
                          key={i}
                          className="w-full h-24 mb-2 rounded-lg"
                        />
                      ))
                  : filteredTickets.map((ticket) => (
                      <motion.div
                        key={ticket.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card
                          className={`mb-2 cursor-pointer hover:bg-accent transition-colors duration-200 ${
                            activeTicketId === ticket.id ? "border-primary" : ""
                          }`}
                          onClick={() => setActiveTicketId(ticket.id)}
                        >
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-lg mb-1">
                              {ticket.subject}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {ticket.issue}
                            </p>
                            <div className="flex justify-between items-center mt-2">
                              <Badge
                                variant={
                                  ticket.status === "active"
                                    ? "default"
                                    : ticket.status === "resolved"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {ticket.status}
                              </Badge>
                              <small className="text-xs text-muted-foreground">
                                {formatDistanceToNow(
                                  new Date(ticket.created_at),
                                  { addSuffix: true }
                                )}
                              </small>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
              </AnimatePresence>
            </ScrollArea>
          </div>
          <div className="w-full lg:w-2/3">
            <AnimatePresence mode="wait">
              {activeTicketId ? (
                <motion.div
                  key="active-ticket"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setActiveTicketId(null)}
                        className="lg:hidden"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <h2 className="text-2xl font-bold">
                        {tickets.find((t) => t.id === activeTicketId)?.subject}
                      </h2>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() =>
                          handleUpdateStatus(activeTicketId, "active")
                        }
                        variant="outline"
                        size="sm"
                      >
                        Mark Active
                      </Button>
                      <Button
                        onClick={() =>
                          handleUpdateStatus(activeTicketId, "resolved")
                        }
                        variant="outline"
                        size="sm"
                      >
                        Mark Resolved
                      </Button>
                    </div>
                  </div>
                  <ScrollArea className="h-[calc(100vh-400px)] mb-4 rounded-md border p-4">
                    {isMessagesLoading ? (
                      Array(3)
                        .fill(0)
                        .map((_, i) => (
                          <Skeleton
                            key={i}
                            className="w-3/4 h-16 mb-2 rounded-md"
                          />
                        ))
                    ) : (
                      <AnimatePresence>
                        {messages.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className={`mb-2 p-3 rounded-lg ${
                              message.is_admin
                                ? "bg-primary text-primary-foreground ml-auto"
                                : "bg-secondary"
                            }`}
                            style={{ maxWidth: "70%" }}
                          >
                            {editingMessageId === message.id ? (
                              <div className="flex flex-col space-y-2">
                                <Textarea
                                  value={editedMessageContent}
                                  onChange={(e) =>
                                    setEditedMessageContent(e.target.value)
                                  }
                                  className="min-h-[100px]"
                                />
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingMessageId(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleEditMessage(
                                        message.id,
                                        editedMessageContent
                                      )
                                    }
                                  >
                                    Save
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="mb-1">{message.content}</p>
                                <div className="flex justify-between items-center text-xs opacity-70">
                                  <span>
                                    {formatDistanceToNow(
                                      new Date(message.created_at),
                                      { addSuffix: true }
                                    )}
                                  </span>
                                  {message.is_admin && (
                                    <div className="flex items-center space-x-2">
                                      {message.seen && (
                                        <CheckCircle2 className="h-3 w-3" />
                                      )}
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                          >
                                            <MoreVertical className="h-4 w-4" />
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-40">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full justify-start"
                                            onClick={() => {
                                              setEditingMessageId(message.id);
                                              setEditedMessageContent(
                                                message.content
                                              );
                                            }}
                                          >
                                            <Edit2 className="mr-2 h-4 w-4" />
                                            Edit
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full justify-start text-destructive"
                                            onClick={() =>
                                              handleDeleteMessage(message.id)
                                            }
                                          >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                          </Button>
                                        </PopoverContent>
                                      </Popover>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                    <div ref={messagesEndRef} />
                  </ScrollArea>
                  <div className="flex gap-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-grow resize-none"
                      rows={2}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={isSending}
                      className="self-end"
                    >
                      {isSending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      Send
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="no-ticket"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-center h-full"
                >
                  <p className="text-muted-foreground text-lg">
                    Select a ticket to view details
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
