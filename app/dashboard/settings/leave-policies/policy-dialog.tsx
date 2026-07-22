"use client";

import {
  useActionState,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
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
import { Switch } from "@/components/ui/switch";

import {
  createLeavePolicy,
  updateLeavePolicy,
  type LeavePolicyActionState,
} from "./actions";
import type { LeavePolicy } from "./leave-policy.service";

type PolicyDialogProps = {
  companyId: string;
  policy?: LeavePolicy;
};

const initialState: LeavePolicyActionState = {
  success: false,
  message: "",
  validationErrors: {},
};

function getFieldError(
  validationErrors:
    | LeavePolicyActionState["validationErrors"]
    | undefined,
  field: keyof NonNullable<
    LeavePolicyActionState["validationErrors"]
  >,
): string | undefined {
  const error = validationErrors?.[field];

  return Array.isArray(error) ? error[0] : undefined;
}

export default function PolicyDialog({
  companyId,
  policy,
}: PolicyDialogProps) {
  const router = useRouter();
  const isEditing = Boolean(policy?.id);

  const action = isEditing
    ? updateLeavePolicy
    : createLeavePolicy;

  const [state, formAction, isPending] =
    useActionState(action, initialState);

  const [open, setOpen] = useState(false);

  const [leaveType, setLeaveType] = useState(
    policy?.leaveType ?? "vacation",
  );

  const [
    annualAllocation,
    setAnnualAllocation,
  ] = useState(
    String(policy?.annualAllocation ?? 0),
  );

  const [accrualMethod, setAccrualMethod] =
    useState(
      policy?.accrualMethod ?? "annual",
    );

  const [
    waitingPeriodDays,
    setWaitingPeriodDays,
  ] = useState(
    String(policy?.waitingPeriodDays ?? 0),
  );

  const [maxCarryOver, setMaxCarryOver] =
    useState(
      String(policy?.maxCarryOver ?? 0),
    );

  const [maxAccrual, setMaxAccrual] =
    useState(
      policy?.maxAccrual == null
        ? ""
        : String(policy.maxAccrual),
    );

  const [
    carryOverAllowed,
    setCarryOverAllowed,
  ] = useState(
    policy?.carryOverAllowed ?? false,
  );

  const [allowHalfDay, setAllowHalfDay] =
    useState(
      policy?.allowHalfDay ?? true,
    );

  const [
    requiresManagerApproval,
    setRequiresManagerApproval,
  ] = useState(
    policy?.requiresManagerApproval ?? true,
  );

  const [
    requiresHrApproval,
    setRequiresHrApproval,
  ] = useState(
    policy?.requiresHrApproval ?? false,
  );

  const [active, setActive] = useState(
    policy?.active ?? true,
  );

  useEffect(() => {
    if (!state.message) {
      return;
    }

    if (state.success) {
      toast.success(state.message);
      setOpen(false);
      router.refresh();
      return;
    }

    toast.error(state.message);
  }, [
    router,
    state.message,
    state.success,
  ]);

  function resetFormValues() {
    setLeaveType(
      policy?.leaveType ?? "vacation",
    );

    setAnnualAllocation(
      String(policy?.annualAllocation ?? 0),
    );

    setAccrualMethod(
      policy?.accrualMethod ?? "annual",
    );

    setWaitingPeriodDays(
      String(policy?.waitingPeriodDays ?? 0),
    );

    setMaxCarryOver(
      String(policy?.maxCarryOver ?? 0),
    );

    setMaxAccrual(
      policy?.maxAccrual == null
        ? ""
        : String(policy.maxAccrual),
    );

    setCarryOverAllowed(
      policy?.carryOverAllowed ?? false,
    );

    setAllowHalfDay(
      policy?.allowHalfDay ?? true,
    );

    setRequiresManagerApproval(
      policy?.requiresManagerApproval ?? true,
    );

    setRequiresHrApproval(
      policy?.requiresHrApproval ?? false,
    );

    setActive(policy?.active ?? true);
  }

  function handleOpenChange(
    nextOpen: boolean,
  ) {
    setOpen(nextOpen);

    if (nextOpen) {
      resetFormValues();
    }
  }

  const leaveTypeError = getFieldError(
    state.validationErrors,
    "leave_type",
  );

  const annualAllocationError =
    getFieldError(
      state.validationErrors,
      "annual_allocation",
    );

  const maxCarryOverError = getFieldError(
    state.validationErrors,
    "max_carry_over",
  );

  const maxAccrualError = getFieldError(
    state.validationErrors,
    "max_accrual",
  );

  const accrualMethodError =
    getFieldError(
      state.validationErrors,
      "accrual_method",
    );

  const waitingPeriodError =
    getFieldError(
      state.validationErrors,
      "waiting_period_days",
    );

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            variant={
              isEditing
                ? "outline"
                : "default"
            }
            size={
              isEditing ? "sm" : "default"
            }
          />
        }
      >
        {isEditing ? (
          <>
            <Pencil className="mr-2 size-4" />
            Edit
          </>
        ) : (
          <>
            <Plus className="mr-2 size-4" />
            Add Policy
          </>
        )}
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Edit Leave Policy"
              : "Create Leave Policy"}
          </DialogTitle>

          <DialogDescription>
            Configure leave allocation,
            accrual, carry-over, and approval
            requirements.
          </DialogDescription>
        </DialogHeader>

        <form
          action={formAction}
          className="space-y-6"
        >
          <input
            type="hidden"
            name="company_id"
            value={companyId}
          />

          {policy?.id ? (
            <input
              type="hidden"
              name="policy_id"
              value={policy.id}
            />
          ) : null}

          <input
            type="hidden"
            name="carry_over_allowed"
            value={String(
              carryOverAllowed,
            )}
          />

          <input
            type="hidden"
            name="allow_half_day"
            value={String(allowHalfDay)}
          />

          <input
            type="hidden"
            name="requires_manager_approval"
            value={String(
              requiresManagerApproval,
            )}
          />

          <input
            type="hidden"
            name="requires_hr_approval"
            value={String(
              requiresHrApproval,
            )}
          />

          <input
            type="hidden"
            name="active"
            value={String(active)}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="leave_type">
                Leave type
              </Label>

              <Select
                name="leave_type"
                value={leaveType}
                onValueChange={(value) => {
                if (value !== null) {
                    setLeaveType(value);
                }
                }}
              >
                <SelectTrigger
                  id="leave_type"
                  aria-invalid={Boolean(
                    leaveTypeError,
                  )}
                >
                  <SelectValue placeholder="Select a leave type" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="vacation">
                    Vacation
                  </SelectItem>

                  <SelectItem value="sick">
                    Sick
                  </SelectItem>

                  <SelectItem value="personal">
                    Personal
                  </SelectItem>

                  <SelectItem value="bereavement">
                    Bereavement
                  </SelectItem>

                  <SelectItem value="parental">
                    Parental
                  </SelectItem>

                  <SelectItem value="maternity">
                    Maternity
                  </SelectItem>

                  <SelectItem value="paternity">
                    Paternity
                  </SelectItem>

                  <SelectItem value="unpaid">
                    Unpaid
                  </SelectItem>

                  <SelectItem value="other">
                    Other
                  </SelectItem>
                </SelectContent>
              </Select>

              {leaveTypeError ? (
                <p className="text-sm text-destructive">
                  {leaveTypeError}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="annual_allocation">
                Annual allocation
              </Label>

              <Input
                id="annual_allocation"
                name="annual_allocation"
                type="number"
                min="0"
                step="0.5"
                value={annualAllocation}
                onChange={(event) => {
                  setAnnualAllocation(
                    event.target.value,
                  );
                }}
                aria-invalid={Boolean(
                  annualAllocationError,
                )}
              />

              {annualAllocationError ? (
                <p className="text-sm text-destructive">
                  {annualAllocationError}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accrual_method">
                Accrual method
              </Label>

              <Select
                name="accrual_method"
                value={accrualMethod}
                onValueChange={(value) => {
                if (
                    value === "annual" ||
                    value === "monthly" ||
                    value === "per_pay_period"
                ) {
                    setAccrualMethod(value);
                }
                }}
              >
                <SelectTrigger
                  id="accrual_method"
                  aria-invalid={Boolean(
                    accrualMethodError,
                  )}
                >
                  <SelectValue placeholder="Select accrual method" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="annual">
                    Annual
                  </SelectItem>

                  <SelectItem value="monthly">
                    Monthly
                  </SelectItem>

                  <SelectItem value="biweekly">
                    Biweekly
                  </SelectItem>

                  <SelectItem value="weekly">
                    Weekly
                  </SelectItem>

                  <SelectItem value="per_pay_period">
                    Per pay period
                  </SelectItem>

                  <SelectItem value="none">
                    No accrual
                  </SelectItem>
                </SelectContent>
              </Select>

              {accrualMethodError ? (
                <p className="text-sm text-destructive">
                  {accrualMethodError}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="waiting_period_days">
                Waiting period in days
              </Label>

              <Input
                id="waiting_period_days"
                name="waiting_period_days"
                type="number"
                min="0"
                step="1"
                value={waitingPeriodDays}
                onChange={(event) => {
                  setWaitingPeriodDays(
                    event.target.value,
                  );
                }}
                aria-invalid={Boolean(
                  waitingPeriodError,
                )}
              />

              {waitingPeriodError ? (
                <p className="text-sm text-destructive">
                  {waitingPeriodError}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_carry_over">
                Maximum carry-over
              </Label>

              <Input
                id="max_carry_over"
                name="max_carry_over"
                type="number"
                min="0"
                step="0.5"
                disabled={
                  !carryOverAllowed
                }
                value={maxCarryOver}
                onChange={(event) => {
                  setMaxCarryOver(
                    event.target.value,
                  );
                }}
                aria-invalid={Boolean(
                  maxCarryOverError,
                )}
              />

              {!carryOverAllowed ? (
                <p className="text-xs text-muted-foreground">
                  Enable carry-over to edit
                  this value.
                </p>
              ) : null}

              {maxCarryOverError ? (
                <p className="text-sm text-destructive">
                  {maxCarryOverError}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_accrual">
                Maximum accrual balance
              </Label>

              <Input
                id="max_accrual"
                name="max_accrual"
                type="number"
                min="0"
                step="0.5"
                placeholder="Optional"
                value={maxAccrual}
                onChange={(event) => {
                  setMaxAccrual(
                    event.target.value,
                  );
                }}
                aria-invalid={Boolean(
                  maxAccrualError,
                )}
              />

              {maxAccrualError ? (
                <p className="text-sm text-destructive">
                  {maxAccrualError}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-5 rounded-lg border p-4">
            <h3 className="font-medium">
              Policy options
            </h3>

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor="carry-over-allowed">
                  Allow carry-over
                </Label>

                <p className="text-sm text-muted-foreground">
                  Move unused leave into the
                  next year.
                </p>
              </div>

              <Switch
                id="carry-over-allowed"
                checked={
                  carryOverAllowed
                }
                onCheckedChange={
                  setCarryOverAllowed
                }
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor="allow-half-day">
                  Allow half-day requests
                </Label>

                <p className="text-sm text-muted-foreground">
                  Employees can request leave
                  in half-day increments.
                </p>
              </div>

              <Switch
                id="allow-half-day"
                checked={allowHalfDay}
                onCheckedChange={
                  setAllowHalfDay
                }
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor="manager-approval">
                  Require manager approval
                </Label>

                <p className="text-sm text-muted-foreground">
                  A manager must approve the
                  leave request.
                </p>
              </div>

              <Switch
                id="manager-approval"
                checked={
                  requiresManagerApproval
                }
                onCheckedChange={
                  setRequiresManagerApproval
                }
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor="hr-approval">
                  Require HR approval
                </Label>

                <p className="text-sm text-muted-foreground">
                  HR must approve the request
                  after the manager.
                </p>
              </div>

              <Switch
                id="hr-approval"
                checked={
                  requiresHrApproval
                }
                onCheckedChange={
                  setRequiresHrApproval
                }
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor="active">
                  Active policy
                </Label>

                <p className="text-sm text-muted-foreground">
                  Allow employees to select
                  this leave type.
                </p>
              </div>

              <Switch
                id="active"
                checked={active}
                onCheckedChange={setActive}
              />
            </div>
          </div>

          {state.message &&
          !state.success ? (
            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {state.message}
            </p>
          ) : null}

          <DialogFooter>
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                />
              }
            >
              Cancel
            </DialogClose>

            <Button
              type="submit"
              disabled={isPending}
            >
              {isPending
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Create Policy"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}