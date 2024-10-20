"use server";

import { clerkClient } from "@/lib/clerk";
import { SupabaseClient } from "@/lib/supabase/client";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export type Payment = {
  id: number;
  organization_id: string;
  organization: string;
  amount: number;
  reference: string;
  created_at: string;
  status: "verified" | "pending" | "cancelled" | "refunded";
};

export type PaymentListParams = {
  limit?: number;
  offset?: number;
  query?: string;
};
export async function getPayments({
  limit = 10,
  offset = 0,
  query = "",
}: PaymentListParams) {
  const supabase = SupabaseClient();

  try {
    let queryBuilder = supabase
      .from("payments")
      .select("*", { count: "exact" })
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (query) {
      queryBuilder = queryBuilder.or(`reference.ilike.%${query}%`);
    }

    const { data: payments, error, count } = await queryBuilder;

    if (error) throw error;

    // Fetch all organizations from Clerk
    const organizationsResponse =
      await clerkClient.organizations.getOrganizationList();
    const organizations = organizationsResponse.data;

    // Create a mapping of organization IDs to names
    const organizationMap = organizations.reduce((map, org) => {
      map[org.id] = org.name;
      return map;
    }, {} as Record<string, string>);

    // Map payments to include organization names
    const paymentsWithOrganizations = payments.map((payment) => {
      const organizationName =
        organizationMap[payment.organization_id] || "Unknown Organization";
      return {
        ...payment,
        organization: organizationName,
      };
    });

    // Filter by organization name if there's a query
    const filteredPayments = query
      ? paymentsWithOrganizations.filter(
          (payment) =>
            payment.organization.toLowerCase().includes(query.toLowerCase()) ||
            payment.reference.toLowerCase().includes(query.toLowerCase())
        )
      : paymentsWithOrganizations;

    return {
      payments: filteredPayments as Payment[],
      totalCount: count || 0,
    };
  } catch (error) {
    console.error("Error fetching payments:", error);
    throw new Error("Failed to fetch payments");
  }
}

export async function updatePaymentStatus(
  paymentId: string,
  status: Payment["status"]
) {
  const supabase = SupabaseClient();

  try {
    // Fetch the payment to get organization_id, plan, and duration
    const { data: payment, error: fetchError } = await supabase
      .from("payments")
      .select("organization_id, plan, duration")
      .eq("id", paymentId)
      .single();

    if (fetchError || !payment) {
      throw new Error("Failed to fetch payment details.");
    }

    const { organization_id, plan, duration } = payment;

    // Update the payment status in the database
    const { error: updateError } = await supabase
      .from("payments")
      .update({ status })
      .eq("id", paymentId);

    if (updateError) throw updateError;

    // Perform actions based on the new status, passing organization_id, plan, and duration
    switch (status) {
      case "verified":
        await handleVerifiedPayment(paymentId, organization_id, plan, duration);
        break;
      case "pending":
        await handlePendingPayment(paymentId, organization_id, plan, duration);
        break;
      case "cancelled":
        await handleCancelledPayment(
          paymentId,
          organization_id,
          plan,
          duration
        );
        break;
      case "refunded":
        await handleRefundedPayment(paymentId, organization_id, plan, duration);
        break;
      default:
        throw new Error(`Unknown payment status: ${status}`);
    }

    revalidatePath("/payments");
  } catch (error) {
    console.error("Error updating payment status:", error);
    throw new Error("Failed to update payment status");
  }
}

import { addMonths, addYears } from "date-fns"; // date-fns can help with date manipulation

// Example function for handling verified payments
async function handleVerifiedPayment(
  paymentId: string,
  organizationId: string,
  plan: string,
  duration: string
) {
  try {
    // Determine subscription end date based on duration
    const currentDate = new Date();
    let subscriptionEnd: Date;

    if (duration === "monthly") {
      subscriptionEnd = addMonths(currentDate, 1); // Add 1 month to the current date
    } else if (duration === "yearly") {
      subscriptionEnd = addYears(currentDate, 1); // Add 1 year to the current date
    } else {
      throw new Error(
        "Unknown duration type. It should be 'monthly' or 'yearly'."
      );
    }

    // Update organization's privateMetadata in Clerk
    await clerkClient.organizations.updateOrganization(organizationId, {
      privateMetadata: {
        subscription: plan,
        subscriptionEnd: subscriptionEnd.toISOString(), // Convert to ISO format for timestamp
      },
    });

    console.log(
      `Payment ${paymentId} for ${plan} (${duration}) from organization ${organizationId} has been verified.`
    );
    console.log(
      `Updated organization ${organizationId} with plan ${plan} and subscription end date: ${subscriptionEnd.toISOString()}`
    );
  } catch (error) {
    console.error("Error updating organization in Clerk:", error);
    throw new Error("Failed to update organization metadata in Clerk");
  }
}

async function handlePendingPayment(
  paymentId: string,
  organizationId: string,
  plan: string,
  duration: string
) {
  // Logic for handling pending payments
  console.log(
    `Payment ${paymentId} for ${plan} (${duration}) from organization ${organizationId} is pending.`
  );
  // e.g., notify the user, start a timer, etc.
}

async function handleCancelledPayment(
  paymentId: string,
  organizationId: string,
  plan: string,
  duration: string
) {
  // Logic for handling cancelled payments
  console.log(
    `Payment ${paymentId} for ${plan} (${duration}) from organization ${organizationId} has been cancelled.`
  );
  // e.g., initiate a refund process, notify the user, etc.
}

async function handleRefundedPayment(
  paymentId: string,
  organizationId: string,
  plan: string,
  duration: string
) {
  // Logic for handling refunded payments
  console.log(
    `Payment ${paymentId} for ${plan} (${duration}) from organization ${organizationId} has been refunded.`
  );
  // e.g., update records, notify the user, etc.
}

export async function deletePayment(paymentId: string) {
  const supabase = SupabaseClient();

  try {
    const { error } = await supabase
      .from("payments")
      .delete()
      .eq("id", paymentId);

    if (error) throw error;

    revalidatePath("/payments");
  } catch (error) {
    console.error("Error deleting payment:", error);
    throw new Error("Failed to delete payment");
  }
}
