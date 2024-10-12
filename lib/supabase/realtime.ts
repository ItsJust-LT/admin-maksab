// src/lib/supabase/client.ts
import { createClient } from "@supabase/supabase-js";

export const SupabaseRealtimeClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};