"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Shift {
  id: string;
  user_id: string;
  branch_id: string;
  starts_at: string;
  ends_at: string;
  is_ai_suggested: boolean;
}

// Same placeholder pattern as the POS page — swap for the user's actual
// assigned branch once branch selection exists in the UI.
const DEFAULT_BRANCH_ID = "00000000-0000-0000-0000-000000000000";

export function ShiftSchedule() {
  const [shifts, setShifts] = React.useState<Shift[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const [userId, setUserId] = React.useState("");
  const [startsAt, setStartsAt] = React.useState("");
  const [endsAt, setEndsAt] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchShifts = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.get<Shift[]>(`/api/employees/shifts?branch_id=${DEFAULT_BRANCH_ID}`);
      setShifts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shifts");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  async function handleCreateShift(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await apiClient.post("/api/employees/shifts", {
        branch_id: DEFAULT_BRANCH_ID,
        user_id: userId,
        starts_at: new Date(startsAt).toISOString(),
        ends_at: new Date(endsAt).toISOString(),
      });
      setDialogOpen(false);
      setUserId("");
      setStartsAt("");
      setEndsAt("");
      await fetchShifts();
    } catch (err) {
      // Surfaces the backend's overlap-detection error (409) directly —
      // e.g. "Employee already has a shift from ... to ..."
      setError(err instanceof Error ? err.message : "Failed to create shift");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(shiftId: string) {
    try {
      await apiClient.delete(`/api/employees/shifts/${shiftId}`);
      await fetchShifts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete shift");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Shift
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule a shift</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateShift} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userId">Employee user ID</Label>
                <Input
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="UUID — wire to an employee picker later"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="startsAt">Starts</Label>
                  <Input
                    id="startsAt"
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endsAt">Ends</Label>
                  <Input
                    id="endsAt"
                    type="datetime-local"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving…" : "Save shift"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Starts</TableHead>
              <TableHead>Ends</TableHead>
              <TableHead>Source</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : shifts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No shifts scheduled.
                </TableCell>
              </TableRow>
            ) : (
              shifts.map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell className="font-mono text-xs">{shift.user_id}</TableCell>
                  <TableCell>{new Date(shift.starts_at).toLocaleString()}</TableCell>
                  <TableCell>{new Date(shift.ends_at).toLocaleString()}</TableCell>
                  <TableCell>
                    {shift.is_ai_suggested ? (
                      <Badge variant="outline">AI suggested</Badge>
                    ) : (
                      <Badge variant="secondary">Manual</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(shift.id)}>
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
