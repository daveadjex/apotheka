import { PosCheckout } from "@/components/pos/pos-checkout";

export default function PosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Point of Sale</h1>
        <p className="text-muted-foreground">Scan items, apply insurance splits, and complete sales.</p>
      </div>
      <PosCheckout />
    </div>
  );
}
