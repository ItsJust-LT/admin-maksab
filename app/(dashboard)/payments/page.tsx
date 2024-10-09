import { PaymentList } from '@/components/payment-list';

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Payments</h1>
      <PaymentList />
    </div>
  );
}