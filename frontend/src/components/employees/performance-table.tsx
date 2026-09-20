"use client";

import * as React from "react";

import { apiClient } from "@/lib/api-client";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

interface PerformanceMetric {
  user_id: string;
  metric_date: string;
  prescriptions_filled: number;
  avg_checkout_seconds: number | null;
  sales_total: number;
}

export function PerformanceTable() {
  const [metrics, setMetrics] = React.useState<PerformanceMetric[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    apiClient
      .get<PerformanceMetric[]>("/api/employees/performance")
      .then(setMetrics)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Rx Filled</TableHead>
            <TableHead className="text-right">Avg Checkout</TableHead>
            <TableHead className="text-right">Sales Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Loading…
              </TableCell>
            </TableRow>
          ) : metrics.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No performance data yet.
              </TableCell>
            </TableRow>
          ) : (
            metrics.map((m) => (
              <TableRow key={`${m.user_id}-${m.metric_date}`}>
                <TableCell className="font-mono text-xs">{m.user_id}</TableCell>
                <TableCell>{m.metric_date}</TableCell>
                <TableCell className="text-right">{m.prescriptions_filled}</TableCell>
                <TableCell className="text-right">
                  {m.avg_checkout_seconds ? `${m.avg_checkout_seconds.toFixed(1)}s` : "—"}
                </TableCell>
                <TableCell className="text-right">${m.sales_total.toFixed(2)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
