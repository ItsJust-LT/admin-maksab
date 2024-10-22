"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Search, Send, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  getAllSupportSessions,
  getSupportMessages,
  createSupportMessage,
  updateMessageSeen,
  updateSupportSessionStatus,
} from "@/components/support/actions";
import { SupabaseRealtimeClient } from "@/lib/supabase/realtime";

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

const supabase = SupabaseRealtimeClient();

export default function AdminSupportTicketsList() {
  const { user } = useUser();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isTicketsLoading, setIsTicketsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchTickets();
    const ticketsChannel = supabase
      .channel("admin-tickets")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "support_sessions" },
        (payload) => {
          console.log("Tickets change received:", payload);
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
      const messagesChannel = supabase
        .channel(`support-ticket:${activeTicketId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "support_messages",
            filter: `session_id=eq.${activeTicketId}`,
          },
          (payload) => {
            console.log("Message change received:", payload);
            fetchMessages(activeTicketId);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(messagesChannel);
      };
    }
  }, [activeTicketId]);

  const fetchTickets = async () => {
    try {
      setIsTicketsLoading(true);
      const ticketsData = await getAllSupportSessions();
      setTickets(ticketsData as SupportTicket[]);
    } catch (error) {
      setError("Error fetching tickets. Please try again.");
    } finally {
      setIsTicketsLoading(false);
      setIsLoading(false);
    }
  };

  const fetchMessages = async (ticketId: string) => {
    try {
      const messagesData = await getSupportMessages(ticketId);
      setMessages(messagesData as SupportMessage[]);
      messagesData.forEach((message: SupportMessage) => {
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
      await createSupportMessage(activeTicketId, newMessage, true);
      setNewMessage("");
    } catch (error) {
      setError("Error sending message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      await updateSupportSessionStatus(ticketId, newStatus);
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
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle>Admin Support Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex space-x-4">
          <div className="w-1/3">
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <ScrollArea className="h-[600px]">
              {isTicketsLoading
                ? Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="w-full h-24 mb-2" />
                    ))
                : filteredTickets.map((ticket) => (
                    <Card
                      key={ticket.id}
                      className={`mb-2 cursor-pointer hover:bg-accent ${
                        activeTicketId === ticket.id ? "border-primary" : ""
                      }`}
                      onClick={() => setActiveTicketId(ticket.id)}
                    >
                      <CardContent className="p-4">
                        <h3 className="font-semibold">{ticket.subject}</h3>
                        <p className="text-sm text-muted-foreground">
                          {ticket.issue.substring(0, 50)}...
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
                          <small className="text-muted-foreground">
                            {formatDistanceToNow(new Date(ticket.created_at), {
                              addSuffix: true,
                            })}
                          </small>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
            </ScrollArea>
          </div>
          <div className="w-2/3">
            {activeTicketId ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">
                    Ticket:{" "}
                    {tickets.find((t) => t.id === activeTicketId)?.subject}
                  </h2>
                  <div className="space-x-2">
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
                <ScrollArea className="h-[500px] mb-4">
                  {isMessagesLoading
                    ? Array(3)
                        .fill(0)
                        .map((_, i) => (
                          <Skeleton key={i} className="w-3/4 h-16 mb-2" />
                        ))
                    : messages.map((message) => (
                        <div
                          key={message.id}
                          className={`mb-2 p-2 rounded ${
                            message.is_admin
                              ? "bg-primary text-primary-foreground ml-auto"
                              : "bg-secondary"
                          }`}
                          style={{ maxWidth: "70%" }}
                        >
                          <p>{message.content}</p>
                          <small className="text-muted-foreground">
                            {formatDistanceToNow(new Date(message.created_at), {
                              addSuffix: true,
                            })}
                          </small>
                        </div>
                      ))}
                </ScrollArea>
                <div className="flex gap-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-grow"
                  />
                  <Button onClick={handleSendMessage} disabled={isSending}>
                    {isSending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Send
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">
                  Select a ticket to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
