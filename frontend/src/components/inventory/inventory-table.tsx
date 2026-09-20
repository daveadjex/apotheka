"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";

import { apiClient } from "@/lib/api-client";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface InventoryItem {
  id: string;
  drug: { generic_name: string; brand_name: string | null; requires_rx: boolean };
  batch_number: string;
  quantity_on_hand: number;
  reorder_threshold: number;
  unit_price: number;
  expiry_date: string;
}

export function InventoryTable() {
  const [items, setItems] = React.useState<InventoryItem[]>([]);
  const [search, setSearch] = React.useState("");
  const [lowStockOnly, setLowStockOnly] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchItems = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (lowStockOnly) params.set("low_stock_only", "true");
    try {
      const data = await apiClient.get<InventoryItem[]>(`/api/inventory?${params}`);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inventory");
    } finally {
      setIsLoading(false);
    }
  }, [search, lowStockOnly]);

  React.useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search by drug name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Button
          variant={lowStockOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setLowStockOnly((v) => !v)}
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          Low stock only
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Drug</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead className="text-right">Qty on Hand</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No items found.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
                const isLow = item.quantity_on_hand <= item.reorder_threshold;
                const isExpiringSoon =
                  new Date(item.expiry_date).getTime() - Date.now() < 1000 * 60 * 60 * 24 * 30;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.drug.generic_name}
                      {item.drug.brand_name && (
                        <span className="ml-1 text-muted-foreground">({item.drug.brand_name})</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.batch_number}</TableCell>
                    <TableCell className="text-right">{item.quantity_on_hand}</TableCell>
                    <TableCell className="text-right">${item.unit_price.toFixed(2)}</TableCell>
                    <TableCell>{item.expiry_date}</TableCell>
                    <TableCell className="space-x-1">
                      {isLow && <Badge variant="destructive">Low stock</Badge>}
                      {isExpiringSoon && <Badge variant="outline">Expiring soon</Badge>}
                      {!isLow && !isExpiringSoon && <Badge variant="secondary">OK</Badge>}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
