"use client";

import {
  useState,
  useTransition,
  type ReactElement,
} from "react";
import { CalendarDays, Loader2, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import type { EmployeeLeaveRequest } from "@/app/dashboard/employees/services/employee-leave.service";

import {
  createLeaveRequest,
  updateLeaveRequest,
} from "./leave-actions";

interface LeaveRequestDialogProps {
  employeeId: string;
  companyId: string;
  request?: EmployeeLeaveRequest | null;
  trigger?: ReactElement;
}

interface LeaveFormState {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
}

interface LeaveActionResult {
  success?: boolean;
  message?: string;
  error?: string;
  validationErrors?: Record<string, string[] | undefined>;
}

function getInitialFormState(
  request?: EmployeeLeaveRequest | null,
): LeaveFormState {
  return {
    leaveType: request?.leave_type ?? "",
    startDate: request?.start_date ?? "",
    endDate: request?.end_date ?? "",
    reason: request?.reason ?? "",
  };
}

function getValidationMessage(
  errors: Record<string, string[] | undefined>,
  field: string,
): string | undefined {
  return errors[field]?.[0];
}

export default function LeaveRequestDialog({
  employeeId,
  companyId,
  request,
  trigger,
}: LeaveRequestDialogProps) {
  const isEditing = Boolean(request);

  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [formState, setFormState] = useState<LeaveFormState>(() =>
    getInitialFormState(request),
  );

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[] | undefined>
  >({});

  function resetForm(): void {
    setFormState(getInitialFormState(request));
    setValidationErrors({});
  }

  function handleOpenChange(nextOpen: boolean): void {
    setOpen(nextOpen);

    if (nextOpen) {
      resetForm();
    }
  }

  function updateField<K extends keyof LeaveFormState>(
    field: K,
    value: LeaveFormState[K],
  ): void {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));

    setValidationErrors((current) => ({
      ...current,
      [field]: undefined,
      general: undefined,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const formData = new FormData();

    formData.set("employee_id", employeeId);
    formData.set("company_id", companyId);
    formData.set("leave_type", formState.leaveType);
    formData.set("start_date", formState.startDate);
    formData.set("end_date", formState.endDate);
    formData.set("reason", formState.reason);

    if (request?.id) {
      formData.set("request_id", request.id);
      formData.set("leave_request_id", request.id);
      formData.set("id", request.id);
    }

    startTransition(async () => {
      try {
        const initialState = {
          success: false,
          message: "",
        };

        const result = isEditing
          ? await updateLeaveRequest(initialState, formData)
          : await createLeaveRequest(initialState, formData);

        if (result.validationErrors) {
          setValidationErrors(result.validationErrors);

          toast.error(
            result.message || "Please correct the highlighted fields.",
          );

          return;
        }

        if (!result.success) {
          toast.error(
            result.message || "The leave request could not be saved.",
          );

          return;
        }

        toast.success(
          result?.message ??
            (isEditing
              ? "Leave request updated successfully."
              : "Leave request created successfully."),
        );

        setOpen(false);
        resetForm();
      } catch (error) {
        console.error("Failed to save leave request:", error);

        toast.error(
          isEditing
            ? "The leave request could not be updated."
            : "The leave request could not be created.",
        );
      }
    });
  }

  const generalError = getValidationMessage(validationErrors, "general");
  const leaveTypeError = getValidationMessage(
    validationErrors,
    "leave_type",
  );
  const startDateError = getValidationMessage(
    validationErrors,
    "start_date",
  );
  const endDateError = getValidationMessage(validationErrors, "end_date");
  const reasonError = getValidationMessage(validationErrors, "reason");

  const defaultTrigger = isEditing ? (
    <Button type="button" variant="outline" size="sm">
      <Pencil className="mr-2 h-4 w-4" />
      Edit
    </Button>
  ) : (
    <Button type="button">
      <Plus className="mr-2 h-4 w-4" />
      New leave request
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger ?? defaultTrigger} />

      <DialogContent className="sm:max-w-[560px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit leave request" : "New leave request"}
            </DialogTitle>

            <DialogDescription>
              {isEditing
                ? "Update the employee's leave request information."
                : "Enter the dates and details for the employee's leave request."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-6">
            {generalError ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {generalError}
              </div>
            ) : null}

            <input
              type="hidden"
              name="employee_id"
              value={employeeId}
            />

            <input
              type="hidden"
              name="company_id"
              value={companyId}
            />

            {request?.id ? (
              <input
                type="hidden"
                name="request_id"
                value={request.id}
              />
            ) : null}

            <div className="grid gap-2">
              <Label htmlFor="leave-type">
                Leave type <span className="text-destructive">*</span>
              </Label>

            <Select
              value={formState.leaveType}
              onValueChange={(value) =>
                updateField("leaveType", value ?? "")
              }
              disabled={isPending}
            >
                <SelectTrigger
                  id="leave-type"
                  aria-invalid={Boolean(leaveTypeError)}
                >
                  <SelectValue placeholder="Select a leave type" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="vacation">Vacation</SelectItem>
                  <SelectItem value="sick">Sick leave</SelectItem>
                  <SelectItem value="personal">Personal leave</SelectItem>
                  <SelectItem value="bereavement">Bereavement</SelectItem>
                  <SelectItem value="parental">Parental leave</SelectItem>
                  <SelectItem value="jury_duty">Jury duty</SelectItem>
                  <SelectItem value="unpaid">Unpaid leave</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              {leaveTypeError ? (
                <p className="text-sm text-destructive">
                  {leaveTypeError}
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="start-date">
                  Start date <span className="text-destructive">*</span>
                </Label>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    id="start-date"
                    name="start_date"
                    type="date"
                    className="pl-9"
                    value={formState.startDate}
                    onChange={(event) =>
                      updateField("startDate", event.target.value)
                    }
                    aria-invalid={Boolean(startDateError)}
                    disabled={isPending}
                    required
                  />
                </div>

                {startDateError ? (
                  <p className="text-sm text-destructive">
                    {startDateError}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="end-date">
                  End date <span className="text-destructive">*</span>
                </Label>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    id="end-date"
                    name="end_date"
                    type="date"
                    className="pl-9"
                    min={formState.startDate || undefined}
                    value={formState.endDate}
                    onChange={(event) =>
                      updateField("endDate", event.target.value)
                    }
                    aria-invalid={Boolean(endDateError)}
                    disabled={isPending}
                    required
                  />
                </div>

                {endDateError ? (
                  <p className="text-sm text-destructive">
                    {endDateError}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="leave-reason">Reason</Label>

              <Textarea
                id="leave-reason"
                name="reason"
                value={formState.reason}
                onChange={(event) =>
                  updateField("reason", event.target.value)
                }
                placeholder="Enter the reason or any additional details..."
                rows={4}
                maxLength={1000}
                aria-invalid={Boolean(reasonError)}
                disabled={isPending}
              />

              <div className="flex items-center justify-between gap-4">
                <div>
                  {reasonError ? (
                    <p className="text-sm text-destructive">
                      {reasonError}
                    </p>
                  ) : null}
                </div>

                <p className="text-xs text-muted-foreground">
                  {formState.reason.length}/1000
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Saving..." : "Creating..."}
                </>
              ) : isEditing ? (
                "Save changes"
              ) : (
                "Create request"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}