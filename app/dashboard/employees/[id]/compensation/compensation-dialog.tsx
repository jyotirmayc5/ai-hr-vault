    "use client";

    import { useState, useTransition } from "react";
    import { addCompensation, editCompensation } from "./actions";
    import type { EmployeeCompensation } from "@/types/employee";

    type Props = {


    employeeId: string;
    compensation?: EmployeeCompensation;
    mode: "add" | "edit";
    canManage: boolean;
    };

    export default function CompensationDialog({
    employeeId,
    compensation,
    mode,
    canManage,
    }: Props) {
        const [open, setOpen] = useState(false);

        const [payType, setPayType] = useState<"salary" | "hourly">(
        compensation?.pay_type ?? "salary"
        );

        const [isPending, startTransition] = useTransition();



    function handleSubmit(formData: FormData) {
        const payType = formData.get("payType") as "salary" | "hourly";

        const payload = {
        payType,
        payFrequency: formData.get("payFrequency") as
            | "weekly"
            | "biweekly"
            | "semimonthly"
            | "monthly",
        annualSalary:
            payType === "salary"
            ? Number(formData.get("annualSalary") || 0)
            : null,
        hourlyRate:
            payType === "hourly"
            ? Number(formData.get("hourlyRate") || 0)
            : null,
        bonusEligible: formData.get("bonusEligible") === "on",
        bonusTargetPercent: Number(formData.get("bonusTargetPercent") || 0),
        effectiveStartDate: String(formData.get("effectiveStartDate")),
        notes: String(formData.get("notes") || ""),
        };

        startTransition(async () => {
        if (mode === "add") {
            await addCompensation({
            employeeId,
            ...payload,
            });
        } else if (compensation) {
            await editCompensation(compensation.id, employeeId, payload);
        }

        setOpen(false);
        });
    }

    return (
        <div>
            <button
            type="button"
            disabled={!canManage}
            onClick={() => setOpen(true)}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
            {mode === "add" ? "Add Compensation" : "Edit"}
            </button>

        {open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
                <div className="mb-4">
                <h2 className="text-lg font-semibold">
                    {mode === "add" ? "Add Compensation" : "Edit Compensation"}
                </h2>
                <p className="text-sm text-muted-foreground">
                    Add salary or hourly compensation history.
                </p>
                </div>

                <form action={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-sm font-medium">Pay Type</label>
                        <select
                        name="payType"
                        value={payType}
                        onChange={(e) =>
                            setPayType(e.target.value as "salary" | "hourly")
                        }
                        className="mt-1 w-full rounded-md border px-3 py-2"
                        >
                        <option value="salary">Salary</option>
                        <option value="hourly">Hourly</option>
                        </select>
                </div>

                <div>
                    <label className="text-sm font-medium">Pay Frequency</label>
                    <select
                    name="payFrequency"
                    defaultValue={compensation?.pay_frequency ?? "biweekly"}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                    >
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Biweekly</option>
                    <option value="semimonthly">Semimonthly</option>
                    <option value="monthly">Monthly</option>
                    </select>
                </div>

                <div>
                <label className="text-sm font-medium">
                    {payType === "salary" ? "Annual Salary" : "Hourly Rate"}
                </label>

                <input
                    name={payType === "salary" ? "annualSalary" : "hourlyRate"}
                    type="number"
                    step={payType === "hourly" ? "0.01" : undefined}
                    defaultValue={
                    payType === "salary"
                        ? (compensation?.annual_salary ?? "")
                        : (compensation?.hourly_rate ?? "")
                    }
                    className="mt-1 w-full rounded-md border px-3 py-2"
                />
                </div>

                <div>
                    <label className="text-sm font-medium">Effective Start Date</label>
                    <input
                    name="effectiveStartDate"
                    type="date"
                    required
                    defaultValue={compensation?.effective_start_date ?? ""}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 text-sm">
                    <input
                        name="bonusEligible"
                        type="checkbox"
                        defaultChecked={compensation?.bonus_eligible ?? false}
                    />
                    Bonus Eligible
                    </label>

                    <div>
                    <label className="text-sm font-medium">Bonus Target %</label>
                    <input
                        name="bonusTargetPercent"
                        type="number"
                        step="0.01"
                        defaultValue={compensation?.bonus_target_percent ?? ""}
                        className="mt-1 w-full rounded-md border px-3 py-2"
                    />
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium">Notes</label>
                    <textarea
                    name="notes"
                    defaultValue={compensation?.notes ?? ""}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                    />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-md border px-4 py-2 text-sm"
                    >
                    Cancel
                    </button>

                    <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                    {isPending ? "Saving..." : "Save"}
                    </button>
                </div>
                </form>
            </div>
            </div>
        )}
        </div>
    );
    }