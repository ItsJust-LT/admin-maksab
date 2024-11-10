"use server";

import { SupabaseClient } from "@/lib/supabase/client";
import { z } from "zod";

const bankDetailsSchema = z.object({
  iban: z.string().min(1, "IBAN is required"),
  bankName: z.string().min(1, "Bank name is required"),
  swiftCode: z.string().min(8, "SWIFT code must be at least 8 characters"),
  accountName: z.string().min(1, "Account name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  branchAddress: z.string().min(1, "Branch address is required"),
});

export type BankDetails = z.infer<typeof bankDetailsSchema>;

export async function getBankDetails() {
  const supabase = SupabaseClient();
  const { data, error } = await supabase
    .from("project_settings")
    .select("value")
    .eq("key", "bank_details")
    .single();

  if (error) {
    console.error("Error fetching bank details:", error);
    throw new Error("Failed to fetch bank details");
  }

  return data?.value as BankDetails;
}

export async function updateBankDetails(bankDetails: BankDetails) {
  const supabase = SupabaseClient();
  const { error } = await supabase
    .from("project_settings")
    .update({ value: bankDetails })
    .eq("key", "bank_details");

  if (error) {
    console.error("Error updating bank details:", error);
    throw new Error("Failed to update bank details");
  }
}
