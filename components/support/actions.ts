"use server";

import { SupabaseServer } from "@/lib/supabase/server";
import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabase = SupabaseServer();

export async function createSupportSession(subject: string, issue: string) {
  const user = await currentUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("support_sessions")
    .insert({ subject, issue, status: "active", user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSupportSessions() {
  const user = await currentUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("support_sessions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getSupportSession(sessionId: string) {
  const { data, error } = await supabase
    .from("support_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (error) throw error;
  return data;
}

export async function getSupportMessages(sessionId: string) {
  const { data, error } = await supabase
    .from("support_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function createSupportMessage(
  sessionId: string,
  content: string,
  isAdmin: boolean
) {
  const user = await currentUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("support_messages")
    .insert({
      session_id: sessionId,
      user_id: user.id,
      content,
      is_admin: isAdmin,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMessageSeen(messageId: string) {
  const { data, error } = await supabase
    .from("support_messages")
    .update({ seen: true, seen_at: new Date().toISOString() })
    .eq("id", messageId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// New admin functions

export async function getAllSupportSessions() {
  const { data, error } = await supabase
    .from("support_sessions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateSupportSessionStatus(
  sessionId: string,
  status: string
) {
  const { data, error } = await supabase
    .from("support_sessions")
    .update({ status })
    .eq("id", sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
