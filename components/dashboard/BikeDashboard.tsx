"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type Row = {
  makeId: Id<"bikes">;
  make: string;
  model: string;
  year: number;
  alternatorOutput: number;
  alternatorOutputApprox: boolean;
  stockLoad: number;
  stockLoadApprox: boolean;
  manualUrl?: string;
};

function RequiredLabel({ children }: { children: string }) {
  return (
    <label className="text-xs font-semibold text-zinc-200">
      {children} <span className="text-red-400">*</span>
    </label>
  );
}

function YearSelect({
  value,
  onChange,
  required = true,
}: {
  value: number;
  onChange: (next: number) => void;
  required?: boolean;
}) {
  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () => Array.from({ length: currentYear - 1979 }, (_, i) => currentYear - i),
    [currentYear],
  );

  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      required={required}
      className="h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
    >
      {years.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
  );
}

function BooleanRadio({
  value,
  onChange,
  name,
}: {
  value: boolean;
  onChange: (next: boolean) => void;
  name: string;
}) {
  return (
    <div className="flex items-center gap-4 text-sm">
      <label className="flex items-center gap-1 text-zinc-200">
        <input
          type="radio"
          name={name}
          checked={value}
          onChange={() => onChange(true)}
        />
        Yes
      </label>
      <label className="flex items-center gap-1 text-zinc-200">
        <input
          type="radio"
          name={name}
          checked={!value}
          onChange={() => onChange(false)}
        />
        No
      </label>
    </div>
  );
}

function RowEditor({ row }: { row: Row }) {
  const updateYear = useMutation(api.bikes.updateYear);
  const [form, setForm] = useState({
    make: row.make,
    modelName: row.model,
    year: row.year,
    alternatorOutput: row.alternatorOutput,
    alternatorOutputApprox: row.alternatorOutputApprox,
    stockLoad: row.stockLoad,
    stockLoadApprox: row.stockLoadApprox,
    manualUrl: row.manualUrl ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateYear({
        makeId: row.makeId,
        sourceModelName: row.model,
        sourceYear: row.year,
        make: form.make,
        modelName: form.modelName,
        year: form.year,
        alternatorOutput: form.alternatorOutput,
        alternatorOutputApprox: form.alternatorOutputApprox,
        stockLoad: form.stockLoad,
        stockLoadApprox: form.stockLoadApprox,
        manualUrl: form.manualUrl.trim() || undefined,
      });
    } catch (mutationError) {
      setError(
        mutationError instanceof Error ? mutationError.message : "Update failed.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={onSave}
      className="grid gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4"
    >
      <div className="grid gap-2 md:grid-cols-4">
        <div className="flex flex-col gap-1">
          <RequiredLabel>Make</RequiredLabel>
          <input
            required
            value={form.make}
            onChange={(e) => setForm((prev) => ({ ...prev, make: e.target.value }))}
            className="h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
          />
        </div>
        <div className="flex flex-col gap-1">
          <RequiredLabel>Model</RequiredLabel>
          <input
            required
            value={form.modelName}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, modelName: e.target.value }))
            }
            className="h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
          />
        </div>
        <div className="flex flex-col gap-1">
          <RequiredLabel>Year</RequiredLabel>
          <YearSelect
            value={form.year}
            onChange={(next) => setForm((prev) => ({ ...prev, year: next }))}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-zinc-200">Manual URL</label>
          <input
            type="url"
            value={form.manualUrl}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, manualUrl: e.target.value }))
            }
            className="h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
          />
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-4">
        <div className="flex flex-col gap-1">
          <RequiredLabel>Alternator Output (W)</RequiredLabel>
          <input
            type="number"
            required
            min={0}
            value={form.alternatorOutput}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                alternatorOutput: Number(e.target.value),
              }))
            }
            className="h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
          />
        </div>
        <div className="flex flex-col gap-1">
          <RequiredLabel>Alternator Approx?</RequiredLabel>
          <BooleanRadio
            value={form.alternatorOutputApprox}
            onChange={(next) =>
              setForm((prev) => ({ ...prev, alternatorOutputApprox: next }))
            }
            name={`alt-approx-${row.makeId}-${row.model}-${row.year}`}
          />
        </div>
        <div className="flex flex-col gap-1">
          <RequiredLabel>Stock Load (W)</RequiredLabel>
          <input
            type="number"
            required
            min={0}
            value={form.stockLoad}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, stockLoad: Number(e.target.value) }))
            }
            className="h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
          />
        </div>
        <div className="flex flex-col gap-1">
          <RequiredLabel>Stock Load Approx?</RequiredLabel>
          <BooleanRadio
            value={form.stockLoadApprox}
            onChange={(next) =>
              setForm((prev) => ({ ...prev, stockLoadApprox: next }))
            }
            name={`stock-approx-${row.makeId}-${row.model}-${row.year}`}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-red-300">{error ?? ""}</p>
        <button
          type="submit"
          disabled={saving}
          className="h-10 rounded-md bg-amber-400 px-4 text-sm font-semibold text-black disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

export default function BikeDashboard() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();

  const createMake = useMutation(api.bikes.createMake);
  const createModel = useMutation(api.bikes.createModel);
  const createYear = useMutation(api.bikes.createYear);
  const dashboard = useQuery(
    api.bikes.listDashboardData,
    isAuthenticated ? {} : "skip",
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"signIn" | "signUp">("signIn");
  const [authError, setAuthError] = useState<string | null>(null);

  const [makeName, setMakeName] = useState("");
  const [modelMakeId, setModelMakeId] = useState<Id<"bikes"> | "">("");
  const [modelName, setModelName] = useState("");

  const [yearMakeId, setYearMakeId] = useState<Id<"bikes"> | "">("");
  const [yearModelName, setYearModelName] = useState("");
  const [yearValue, setYearValue] = useState(new Date().getFullYear());
  const [alternatorOutput, setAlternatorOutput] = useState(0);
  const [alternatorApprox, setAlternatorApprox] = useState(false);
  const [stockLoad, setStockLoad] = useState(0);
  const [stockLoadApprox, setStockLoadApprox] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const selectedMakeForYear =
    dashboard?.makes.find((makeDoc) => makeDoc.id === yearMakeId) ?? null;

  const onAuth = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      await signIn("password", {
        email,
        password,
        flow: authMode,
      });
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Authentication failed.");
    }
  };

  const onAddMake = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await createMake({ make: makeName });
      setMakeName("");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Failed to add make.");
    }
  };

  const onAddModel = async (e: FormEvent) => {
    e.preventDefault();
    if (!modelMakeId) return;
    setFormError(null);
    try {
      await createModel({ makeId: modelMakeId, modelName });
      setModelName("");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Failed to add model.");
    }
  };

  const onAddYear = async (e: FormEvent) => {
    e.preventDefault();
    if (!yearMakeId || !yearModelName) return;
    setFormError(null);
    try {
      await createYear({
        makeId: yearMakeId,
        modelName: yearModelName,
        year: yearValue,
        alternatorOutput,
        alternatorOutputApprox: alternatorApprox,
        stockLoad,
        stockLoadApprox,
        manualUrl: manualUrl.trim() || undefined,
      });
      setManualUrl("");
      setAlternatorOutput(0);
      setStockLoad(0);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Failed to add year.");
    }
  };

  if (isLoading) {
    return <main className="mx-auto max-w-7xl p-6 text-sm text-zinc-300">Loading...</main>;
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-md items-center p-6">
        <form
          onSubmit={onAuth}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
        >
          <h1 className="text-lg font-semibold text-zinc-100">Dashboard Login</h1>
          <p className="mt-1 text-xs text-zinc-400">Convex Auth protected access.</p>
          <div className="mt-4 grid gap-3">
            <div className="flex flex-col gap-1">
              <RequiredLabel>Email</RequiredLabel>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
              />
            </div>
            <div className="flex flex-col gap-1">
              <RequiredLabel>Password</RequiredLabel>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
              />
            </div>
            <div className="flex gap-2 text-sm">
              <label className="flex items-center gap-1 text-zinc-200">
                <input
                  type="radio"
                  checked={authMode === "signIn"}
                  onChange={() => setAuthMode("signIn")}
                />
                Sign In
              </label>
              <label className="flex items-center gap-1 text-zinc-200">
                <input
                  type="radio"
                  checked={authMode === "signUp"}
                  onChange={() => setAuthMode("signUp")}
                />
                Sign Up
              </label>
            </div>
            <button
              type="submit"
              className="h-10 rounded-md bg-amber-400 text-sm font-semibold text-black"
            >
              Continue
            </button>
            <p className="text-xs text-red-300">{authError ?? ""}</p>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Bike Dashboard</h1>
          <p className="text-sm text-zinc-400">
            Live Convex data. No local fallback cache is used on this route.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void signOut()}
          className="h-10 rounded-md border border-zinc-700 px-4 text-sm font-semibold text-zinc-100"
        >
          Log Out
        </button>
      </header>

      <section className="grid gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 md:grid-cols-3">
        <form onSubmit={onAddMake} className="grid gap-2">
          <h2 className="text-sm font-semibold text-zinc-100">Add Make</h2>
          <RequiredLabel>Make Name</RequiredLabel>
          <input
            required
            value={makeName}
            onChange={(e) => setMakeName(e.target.value)}
            className="h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
          />
          <button
            type="submit"
            className="h-10 rounded-md bg-amber-400 text-sm font-semibold text-black"
          >
            Add Make
          </button>
        </form>

        <form onSubmit={onAddModel} className="grid gap-2">
          <h2 className="text-sm font-semibold text-zinc-100">Add Model</h2>
          <RequiredLabel>Make</RequiredLabel>
          <select
            required
            value={modelMakeId}
            onChange={(e) => setModelMakeId(e.target.value as Id<"bikes">)}
            className="h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
          >
            <option value="">Select make</option>
            {dashboard?.makes.map((makeDoc) => (
              <option key={makeDoc.id} value={makeDoc.id}>
                {makeDoc.make}
              </option>
            ))}
          </select>
          <RequiredLabel>Model Name</RequiredLabel>
          <input
            required
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            className="h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
          />
          <button
            type="submit"
            className="h-10 rounded-md bg-amber-400 text-sm font-semibold text-black"
          >
            Add Model
          </button>
        </form>

        <form onSubmit={onAddYear} className="grid gap-2">
          <h2 className="text-sm font-semibold text-zinc-100">Add Year + Details</h2>
          <RequiredLabel>Make</RequiredLabel>
          <select
            required
            value={yearMakeId}
            onChange={(e) => {
              const next = e.target.value as Id<"bikes">;
              setYearMakeId(next);
              const firstModel =
                dashboard?.makes.find((makeDoc) => makeDoc.id === next)?.models[0] ?? "";
              setYearModelName(firstModel);
            }}
            className="h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
          >
            <option value="">Select make</option>
            {dashboard?.makes.map((makeDoc) => (
              <option key={makeDoc.id} value={makeDoc.id}>
                {makeDoc.make}
              </option>
            ))}
          </select>
          <RequiredLabel>Model</RequiredLabel>
          <select
            required
            value={yearModelName}
            onChange={(e) => setYearModelName(e.target.value)}
            className="h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
          >
            <option value="">Select model</option>
            {(selectedMakeForYear?.models ?? []).map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
          <RequiredLabel>Year</RequiredLabel>
          <YearSelect value={yearValue} onChange={setYearValue} />
          <RequiredLabel>Alternator Output (W)</RequiredLabel>
          <input
            type="number"
            required
            min={0}
            value={alternatorOutput}
            onChange={(e) => setAlternatorOutput(Number(e.target.value))}
            className="h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
          />
          <RequiredLabel>Alternator Approx?</RequiredLabel>
          <BooleanRadio
            value={alternatorApprox}
            onChange={setAlternatorApprox}
            name="create-alt-approx"
          />
          <RequiredLabel>Stock Load (W)</RequiredLabel>
          <input
            type="number"
            required
            min={0}
            value={stockLoad}
            onChange={(e) => setStockLoad(Number(e.target.value))}
            className="h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
          />
          <RequiredLabel>Stock Load Approx?</RequiredLabel>
          <BooleanRadio
            value={stockLoadApprox}
            onChange={setStockLoadApprox}
            name="create-stock-approx"
          />
          <label className="text-xs font-semibold text-zinc-200">Manual URL</label>
          <input
            type="url"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            className="h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
          />
          <button
            type="submit"
            className="h-10 rounded-md bg-amber-400 text-sm font-semibold text-black"
          >
            Add Year
          </button>
        </form>
      </section>

      <p className="text-sm text-red-300">{formError ?? ""}</p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-100">All Bike Entries</h2>
        {!dashboard ? (
          <p className="text-sm text-zinc-400">Loading bike data...</p>
        ) : dashboard.rows.length === 0 ? (
          <p className="text-sm text-zinc-400">No bike entries yet.</p>
        ) : (
          dashboard.rows.map((row) => (
            <RowEditor
              key={`${row.makeId}-${row.model}-${row.year}`}
              row={row}
            />
          ))
        )}
      </section>
    </main>
  );
}
