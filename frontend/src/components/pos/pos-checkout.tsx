"use client";

import * as React from "react";
import { Trash2, ScanBarcode } from "lucide-react";

import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface BarcodeLookupResult {
  inventory_item_id: string;
  generic_name: string;
  brand_name: string | null;
  unit_price: number;
  quantity_on_hand: number;
  requires_rx: boolean;
}

interface CartLine {
  inventory_item_id: string;
  name: string;
  unit_price: number;
  quantity: number;
}

// Hard-coded for the scaffold — in a real branch-aware build this comes
// from the logged-in user's assigned branch.
const DEFAULT_BRANCH_ID = "00000000-0000-0000-0000-000000000000";

function generateIdempotencyKey() {
  return crypto.randomUUID();
}

export function PosCheckout() {
  const { user } = useAuth();
  const [barcode, setBarcode] = React.useState("");
  const [cart, setCart] = React.useState<CartLine[]>([]);
  const [paymentMethod, setPaymentMethod] = React.useState("cash");
  const [insuranceCovered, setInsuranceCovered] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = React.useState(false);
  const barcodeInputRef = React.useRef<HTMLInputElement>(null);

  // Keep the scanner input focused — a barcode scanner is just a very fast
  // keyboard, so this is what makes the "point gun, hear beep, see item
  // appear" flow work without the cashier touching the mouse.
  React.useEffect(() => {
    barcodeInputRef.current?.focus();
  }, [cart]);

  async function handleBarcodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!barcode.trim()) return;
    setError(null);
    try {
      const result = await apiClient.get<BarcodeLookupResult>(
        `/api/pos/lookup/${encodeURIComponent(barcode)}?branch_id=${DEFAULT_BRANCH_ID}`
      );
      addToCart(result);
      setBarcode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Item not found");
    }
  }

  function addToCart(result: BarcodeLookupResult) {
    setCart((prev) => {
      const existing = prev.find((l) => l.inventory_item_id === result.inventory_item_id);
      if (existing) {
        return prev.map((l) =>
          l.inventory_item_id === result.inventory_item_id ? { ...l, quantity: l.quantity + 1 } : l
        );
      }
      return [
        ...prev,
        {
          inventory_item_id: result.inventory_item_id,
          name: result.brand_name ? `${result.generic_name} (${result.brand_name})` : result.generic_name,
          unit_price: result.unit_price,
          quantity: 1,
        },
      ];
    });
  }

  function updateQuantity(id: string, quantity: number) {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((l) => l.inventory_item_id !== id));
      return;
    }
    setCart((prev) => prev.map((l) => (l.inventory_item_id === id ? { ...l, quantity } : l)));
  }

  function removeLine(id: string) {
    setCart((prev) => prev.filter((l) => l.inventory_item_id !== id));
  }

  const subtotal = cart.reduce((sum, l) => sum + l.unit_price * l.quantity, 0);
  const copay = Math.max(subtotal - insuranceCovered, 0);

  async function handleCheckout() {
    if (cart.length === 0) return;
    setIsCheckingOut(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const sale = await apiClient.post<{ id: string; total: number }>("/api/pos/checkout", {
        branch_id: DEFAULT_BRANCH_ID,
        items: cart.map((l) => ({ inventory_item_id: l.inventory_item_id, quantity: l.quantity })),
        payment_method: paymentMethod,
        insurance_covered: insuranceCovered,
        tax: 0,
        idempotency_key: generateIdempotencyKey(),
      });
      setSuccessMessage(`Sale completed — total $${sale.total.toFixed(2)}`);
      setCart([]);
      setInsuranceCovered(0);
    } catch (err) {
      // On a real offline-capable build, a network failure here is where
      // the sale gets queued locally (e.g. IndexedDB) and retried with the
      // same idempotency_key once connectivity returns, instead of
      // surfacing an error to the cashier.
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <ScanBarcode className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={barcodeInputRef}
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Scan or type barcode / NDC…"
              className="pl-9"
              autoFocus
            />
          </div>
          <Button type="submit">Add</Button>
        </form>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {successMessage && (
          <Alert>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Line Total</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {cart.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Cart is empty — scan an item to begin.
                  </TableCell>
                </TableRow>
              ) : (
                cart.map((line) => (
                  <TableRow key={line.inventory_item_id}>
                    <TableCell className="font-medium">{line.name}</TableCell>
                    <TableCell className="text-right">${line.unit_price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={(e) =>
                          updateQuantity(line.inventory_item_id, parseInt(e.target.value, 10) || 0)
                        }
                        className="w-16 text-right"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      ${(line.unit_price * line.quantity).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLine(line.inventory_item_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Payment method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="insurance_split">Insurance split</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentMethod === "insurance_split" && (
            <div className="space-y-2">
              <Label htmlFor="insurance">Insurance covered ($)</Label>
              <Input
                id="insurance"
                type="number"
                min={0}
                step="0.01"
                value={insuranceCovered}
                onChange={(e) => setInsuranceCovered(parseFloat(e.target.value) || 0)}
              />
            </div>
          )}

          <div className="space-y-1 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {paymentMethod === "insurance_split" && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Insurance covers</span>
                <span>-${insuranceCovered.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-semibold">
              <span>{paymentMethod === "insurance_split" ? "Patient copay" : "Total"}</span>
              <span>${copay.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            size="lg"
            disabled={cart.length === 0 || isCheckingOut}
            onClick={handleCheckout}
          >
            {isCheckingOut ? "Processing…" : "Complete Sale"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
