import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ShiftSchedule } from "@/components/employees/shift-schedule";
import { PerformanceTable } from "@/components/employees/performance-table";

export default function EmployeesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
        <p className="text-muted-foreground">Shift scheduling and performance tracking.</p>
      </div>

      <Tabs defaultValue="schedule">
        <TabsList>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        <TabsContent value="schedule" className="mt-4">
          <ShiftSchedule />
        </TabsContent>
        <TabsContent value="performance" className="mt-4">
          <PerformanceTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
