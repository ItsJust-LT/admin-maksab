import AdminSupportTicketsList from "@/components/support-ticket-list";

export default function SupportTicketsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Support Tickets</h1>
      <AdminSupportTicketsList />
    </div>
  );
}
