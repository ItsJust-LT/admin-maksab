"use server";
import { SupabaseClient } from "../../lib/supabase/client";

export async function getData() {
  const supabase = SupabaseClient();

  // Fetch user counts, organizations, etc.
  const { error: UserError, count: UserCount } = await supabase
    .from("users")
    .select("id", { count: "exact" });

  const { error: RecentUserError, count: RecentUserCount } = await supabase
    .from("users")
    .select("id", { count: "exact" })
    .gt(
      "created_at",
      new Date(new Date().setDate(new Date().getDate() - 30)).toISOString()
    );

  const { error: OrganizationError, count: OrganizationCount } = await supabase
    .from("organizations")
    .select("id", { count: "exact" });

  const { error: RecentOrganizationError, count: RecentOrganizationCount } =
    await supabase
      .from("organizations")
      .select("id", { count: "exact" })
      .gt(
        "created_at",
        new Date(new Date().setDate(new Date().getDate() - 30)).toISOString()
      );

  // Construct the data object to return
  return {
    UserCount,
    RecentUserCount,
    OrganizationCount,
    RecentOrganizationCount,
  };
}
