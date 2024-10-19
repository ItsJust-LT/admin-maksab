import { getPayments } from "./actions";
import { PaymentsList } from "./payments-list";

export default async function PaymentsPage() {
  const { payments, totalCount } = await getPayments({ limit: 10, offset: 0 });

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5">Payments</h1>
      <PaymentsList initialPayments={payments} initialTotalCount={totalCount} />
    </div>
  );
}
