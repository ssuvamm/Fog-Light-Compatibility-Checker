"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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

function Icon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span
      className={`material-symbols-outlined leading-none ${className}`.trim()}
      aria-hidden
    >
      {name}
    </span>
  );
}

function RequiredLabel({ children }: { children: string }) {
  return (
    <label className="text-xs font-semibold text-zinc-300">
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
      className="h-10 rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100"
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
      <label className="flex items-center gap-2 text-zinc-300">
        <input type="radio" name={name} checked={value} onChange={() => onChange(true)} />
        Yes
      </label>
      <label className="flex items-center gap-2 text-zinc-300">
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

export default function BikeVariantEditPage() {
  const params = useSearchParams();
  const makeId = params.get("makeId");
  const model = params.get("model");
  const year = Number(params.get("year"));

  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  const updateYear = useMutation(api.bikes.updateYear);
  const dashboard = useQuery(
    api.bikes.listDashboardData,
    isAuthenticated ? {} : "skip",
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"signIn" | "signUp">("signIn");
  const [authError, setAuthError] = useState<string | null>(null);

  const row = useMemo<Row | null>(() => {
    if (!dashboard || !makeId || !model || Number.isNaN(year)) {
      return null;
    }

    const found = dashboard.rows.find(
      (entry) =>
        String(entry.makeId) === makeId && entry.model === model && entry.year === year,
    );
    if (!found) {
      return null;
    }

    return found;
  }, [dashboard, makeId, model, year]);

  const [form, setForm] = useState({
    make: "",
    modelName: "",
    year: new Date().getFullYear(),
    alternatorOutput: 0,
    alternatorOutputApprox: false,
    stockLoad: 0,
    stockLoadApprox: false,
    manualUrl: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!row) {
      return;
    }
    setForm({
      make: row.make,
      modelName: row.model,
      year: row.year,
      alternatorOutput: row.alternatorOutput,
      alternatorOutputApprox: row.alternatorOutputApprox,
      stockLoad: row.stockLoad,
      stockLoadApprox: row.stockLoadApprox,
      manualUrl: row.manualUrl ?? "",
    });
  }, [row]);

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

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!row) {
      return;
    }
    setSaving(true);
    setSaveError(null);
    setSaved(false);
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
      setSaved(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <main className="p-6 text-sm text-zinc-400">Loading...</main>;
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-6 py-16">
        <form
          onSubmit={(e) => void onAuth(e)}
          className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/90 p-8 shadow-2xl"
        >
          <h1 className="text-2xl font-bold text-zinc-100">Dashboard Login</h1>
          <p className="mt-1 text-sm text-zinc-400">Sign in to edit bike variants.</p>

          <div className="mt-6 grid gap-3">
            <div className="grid gap-1">
              <RequiredLabel>Email</RequiredLabel>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
              />
            </div>
            <div className="grid gap-1">
              <RequiredLabel>Password</RequiredLabel>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
              />
            </div>
            <div className="flex gap-4 text-sm text-zinc-300">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={authMode === "signIn"}
                  onChange={() => setAuthMode("signIn")}
                />
                Sign In
              </label>
              {/* <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={authMode === "signUp"}
                  onChange={() => setAuthMode("signUp")}
                />
                Sign Up
              </label> */}
            </div>
            <button
              type="submit"
              className="mt-2 h-10 rounded-lg bg-amber-400 text-sm font-semibold text-zinc-950"
            >
              Continue
            </button>
            <p className="text-xs text-red-400">{authError ?? ""}</p>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-10">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-xl md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-500">Variant Editor</p>
            <h1 className="mt-1 text-2xl font-bold text-zinc-100">Edit Bike Year Variant</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-700 px-3 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              <Icon name="logout" className="text-base" />
              Log Out
            </button>
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-700 px-3 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              <Icon name="arrow_back" className="text-base" />
              Back
            </Link>
          </div>
        </div>

        {!makeId || !model || Number.isNaN(year) ? (
          <p className="mt-8 text-sm text-red-400">Missing query params. Required: makeId, model, year.</p>
        ) : !dashboard ? (
          <p className="mt-8 text-sm text-zinc-400">Loading variant data...</p>
        ) : !row ? (
          <p className="mt-8 text-sm text-red-400">Variant not found. It may have been edited or removed.</p>
        ) : (
          <form onSubmit={(e) => void onSave(e)} className="mt-8 grid gap-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-1">
                <RequiredLabel>Make</RequiredLabel>
                <input
                  required
                  value={form.make}
                  onChange={(e) => setForm((prev) => ({ ...prev, make: e.target.value }))}
                  className="h-10 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                />
              </div>
              <div className="grid gap-1">
                <RequiredLabel>Model</RequiredLabel>
                <input
                  required
                  value={form.modelName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, modelName: e.target.value }))
                  }
                  className="h-10 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                />
              </div>
              <div className="grid gap-1">
                <RequiredLabel>Year</RequiredLabel>
                <YearSelect
                  value={form.year}
                  onChange={(next) => setForm((prev) => ({ ...prev, year: next }))}
                />
              </div>
              <div className="grid gap-1">
                <label className="text-xs font-semibold text-zinc-300">Manual URL</label>
                <input
                  type="url"
                  value={form.manualUrl}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, manualUrl: e.target.value }))
                  }
                  className="h-10 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-1">
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
                  className="h-10 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                />
              </div>
              <div className="grid gap-1">
                <RequiredLabel>Stock Load (W)</RequiredLabel>
                <input
                  type="number"
                  required
                  min={0}
                  value={form.stockLoad}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      stockLoad: Number(e.target.value),
                    }))
                  }
                  className="h-10 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                />
              </div>
              <div className="grid gap-1">
                <RequiredLabel>Alternator Approx?</RequiredLabel>
                <BooleanRadio
                  value={form.alternatorOutputApprox}
                  onChange={(next) =>
                    setForm((prev) => ({ ...prev, alternatorOutputApprox: next }))
                  }
                  name="edit-alt-approx"
                />
              </div>
              <div className="grid gap-1">
                <RequiredLabel>Stock Load Approx?</RequiredLabel>
                <BooleanRadio
                  value={form.stockLoadApprox}
                  onChange={(next) =>
                    setForm((prev) => ({ ...prev, stockLoadApprox: next }))
                  }
                  name="edit-stock-approx"
                />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="text-xs">
                <p className="text-red-400">{saveError ?? ""}</p>
                <p className="text-emerald-400">{saved ? "Saved." : ""}</p>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-amber-400 px-4 text-sm font-semibold text-zinc-950 disabled:opacity-60"
              >
                <Icon name="save" className="text-base" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
