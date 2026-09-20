import { InventoryTable } from "@/components/inventory/inventory-table";

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
        <p className="text-muted-foreground">
          Stock levels, batch tracking, and expiry monitoring across your branches.
        </p>
      </div>
      <InventoryTable />
    </div>
  );
}
