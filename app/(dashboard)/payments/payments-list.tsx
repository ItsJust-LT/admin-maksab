"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/app/(dashboard)/payments/data-table";
import { columns } from "@/app/(dashboard)/payments/columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPayments, Payment } from "@/app/(dashboard)/payments/actions";
import { useRouter } from "next/navigation";

interface PaymentsListProps {
  initialPayments: Payment[];
  initialTotalCount: number;
}

export function PaymentsList({
  initialPayments,
  initialTotalCount,
}: PaymentsListProps) {
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const fetchPayments = async (query: string = "") => {
    setIsLoading(true);
    try {
      const { payments: fetchedPayments, totalCount: fetchedTotalCount } =
        await getPayments({
          query,
          limit: 10,
          offset: 0,
        });
      setPayments(fetchedPayments);
      setTotalCount(fetchedTotalCount);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(searchQuery);
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search payments..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => router.push("/payments/new")}>
          Add Payment
        </Button>
      </div>
      <DataTable columns={columns} data={payments} onSearch={handleSearch} />
      {isLoading && <div className="text-center">Loading...</div>}
      {totalCount > 10 && (
        <div className="flex justify-center">
          <Button onClick={() => fetchPayments(searchQuery)}>Load More</Button>
        </div>
      )}
    </div>
  );
}
