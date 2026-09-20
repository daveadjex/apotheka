import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function DashboardHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of today's activity across your pharmacy.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Today's Sales", value: "—" },
          { label: "Low Stock Items", value: "—" },
          { label: "Pending Rx", value: "—" },
          { label: "Staff On Shift", value: "—" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Wire these cards to /api/inventory, /api/pos, and /api/employees once you're ready for live data.
      </p>
    </div>
  );
}
