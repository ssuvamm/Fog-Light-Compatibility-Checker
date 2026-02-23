"use client";

import Link from "next/link";
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

type MakeNode = {
  id: Id<"bikes">;
  name: string;
  models: Array<{ name: string; rows: Row[] }>;
  totalYears: number;
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
      className="h-10 rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 focus:border-amber-400 focus:outline-none"
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

function DashboardLogin({
  email,
  password,
  authMode,
  authError,
  setEmail,
  setPassword,
  setAuthMode,
  onAuth,
}: {
  email: string;
  password: string;
  authMode: "signIn" | "signUp";
  authError: string | null;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setAuthMode: (mode: "signIn" | "signUp") => void;
  onAuth: (e: FormEvent) => Promise<void>;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-6 py-16">
      <form
        onSubmit={(e) => void onAuth(e)}
        className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/90 p-8 shadow-2xl"
      >
        <p className="text-xs uppercase tracking-wider text-zinc-500">MotoAdmin</p>
        <h1 className="mt-2 text-2xl font-bold text-zinc-100">Dashboard Login</h1>
        <p className="mt-1 text-sm text-zinc-400">Convex auth protected admin access.</p>

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

  const [search, setSearch] = useState("");
  const [selectedMakeId, setSelectedMakeId] = useState<Id<"bikes"> | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

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

  const makeTree = useMemo<MakeNode[]>(() => {
    if (!dashboard) {
      return [];
    }

    return dashboard.makes
      .map((makeDoc) => {
        const models = makeDoc.models
          .map((modelNameValue) => {
            const rows = dashboard.rows
              .filter(
                (row) => row.makeId === makeDoc.id && row.model === modelNameValue,
              )
              .sort((a, b) => b.year - a.year);
            return { name: modelNameValue, rows };
          })
          .filter((model) => model.rows.length > 0);

        return {
          id: makeDoc.id,
          name: makeDoc.make,
          models,
          totalYears: models.reduce((sum, model) => sum + model.rows.length, 0),
        };
      })
      .filter((make) => {
        if (!search.trim()) {
          return true;
        }
        const q = search.trim().toLowerCase();
        return (
          make.name.toLowerCase().includes(q) ||
          make.models.some((model) => model.name.toLowerCase().includes(q))
        );
      });
  }, [dashboard, search]);

  const activeMakeId =
    selectedMakeId && makeTree.some((make) => make.id === selectedMakeId)
      ? selectedMakeId
      : (makeTree[0]?.id ?? null);

  const activeMake = useMemo(
    () => makeTree.find((make) => make.id === activeMakeId) ?? null,
    [makeTree, activeMakeId],
  );

  const activeModel =
    selectedModel && activeMake?.models.some((model) => model.name === selectedModel)
      ? selectedModel
      : (activeMake?.models[0]?.name ?? null);

  const selectedRows = useMemo(() => {
    if (!dashboard || !activeMakeId || !activeModel) {
      return [];
    }
    return dashboard.rows
      .filter((row) => row.makeId === activeMakeId && row.model === activeModel)
      .sort((a, b) => b.year - a.year);
  }, [dashboard, activeMakeId, activeModel]);

  const totalYears = selectedRows.length;
  const avgAlternator =
    selectedRows.length > 0
      ? Math.round(
          selectedRows.reduce((sum, row) => sum + row.alternatorOutput, 0) /
            selectedRows.length,
        )
      : 0;
  const manualLinked =
    selectedRows.length > 0
      ? Math.round(
          (selectedRows.filter((row) => !!row.manualUrl).length / selectedRows.length) * 100,
        )
      : 0;

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
    if (!modelMakeId) {
      return;
    }
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
    if (!yearMakeId || !yearModelName) {
      return;
    }
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
      setAlternatorOutput(0);
      setStockLoad(0);
      setManualUrl("");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Failed to add year.");
    }
  };

  if (isLoading) {
    return <main className="p-6 text-sm text-zinc-400">Loading...</main>;
  }

  if (!isAuthenticated) {
    return (
      <DashboardLogin
        email={email}
        password={password}
        authMode={authMode}
        authError={authError}
        setEmail={setEmail}
        setPassword={setPassword}
        setAuthMode={setAuthMode}
        onAuth={onAuth}
      />
    );
  }

  return (
    <main className="flex min-h-screen w-full bg-zinc-950 text-zinc-100">
      <aside className="hidden w-80 shrink-0 border-r border-zinc-800 bg-zinc-900/80 lg:flex lg:flex-col">
        <div className="border-b border-zinc-800 p-6">
          <div className="flex items-center gap-2">
            <Icon name="two_wheeler" className="text-amber-400" />
            <h1 className="text-xl font-semibold">MotoAdmin</h1>
          </div>
          <div className="relative mt-4">
            <Icon
              name="search"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search makes or models"
              className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-950 pl-10 pr-3 text-sm text-zinc-100"
            />
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
          {makeTree.map((make) => {
            const makeSelected = activeMakeId === make.id;
            return (
              <div key={make.id} className="rounded-lg border border-zinc-800 bg-zinc-900/60">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMakeId(make.id);
                    setSelectedModel(make.models[0]?.name ?? null);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
                    makeSelected ? "bg-zinc-800 text-zinc-100" : "text-zinc-300"
                  }`}
                >
                  <span className="font-medium">{make.name}</span>
                  <span className="rounded-full bg-zinc-700 px-2 py-0.5 text-xs text-zinc-300">
                    {make.totalYears}
                  </span>
                </button>

                <div className="space-y-1 p-2">
                  {make.models.map((model) => {
                    const modelSelected =
                      makeSelected && activeModel?.toLowerCase() === model.name.toLowerCase();
                    return (
                      <button
                        key={`${make.id}-${model.name}`}
                        type="button"
                        onClick={() => {
                          setSelectedMakeId(make.id);
                          setSelectedModel(model.name);
                        }}
                        className={`flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm transition ${
                          modelSelected
                            ? "bg-amber-400/15 text-amber-300"
                            : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                        }`}
                      >
                        <span>{model.name}</span>
                        <span className="text-xs">{model.rows.length}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-zinc-800 p-4">
          <button
            type="button"
            onClick={() => void signOut()}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-zinc-700 text-sm text-zinc-300 hover:bg-zinc-800"
          >
            <Icon name="logout" className="text-base" />
            Log Out
          </button>
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-zinc-800 bg-zinc-900/60 px-6 py-5 md:px-8">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Bike Data Management</p>
          <h2 className="mt-1 text-2xl font-bold text-zinc-100">{activeModel ?? "Select a model"}</h2>
          <p className="mt-1 text-sm text-zinc-400">{activeMake?.name ?? "No make selected"}</p>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto p-6 md:p-8">
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
              <p className="text-sm text-zinc-400">Total Years</p>
              <p className="mt-2 text-2xl font-bold text-zinc-100">{totalYears}</p>
            </article>
            <article className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
              <p className="text-sm text-zinc-400">Avg. Alternator</p>
              <p className="mt-2 text-2xl font-bold text-zinc-100">{avgAlternator} W</p>
            </article>
            <article className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
              <p className="text-sm text-zinc-400">Manuals Linked</p>
              <p className="mt-2 text-2xl font-bold text-zinc-100">{manualLinked}%</p>
            </article>
          </div>

          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/70">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-800">
                <thead className="bg-zinc-900">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-zinc-400">Year</th>
                    <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-zinc-400">
                      Alternator (W)
                    </th>
                    <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-zinc-400">Alt Approx</th>
                    <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-zinc-400">Stock Load (W)</th>
                    <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-zinc-400">Load Approx</th>
                    <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-zinc-400">Manual URL</th>
                    <th className="px-5 py-3 text-right text-xs uppercase tracking-wider text-zinc-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {selectedRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-6 text-sm text-zinc-400">
                        No entries for this model.
                      </td>
                    </tr>
                  ) : (
                    selectedRows.map((row) => (
                      <tr key={`${row.makeId}-${row.model}-${row.year}`} className="hover:bg-zinc-800/50">
                        <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-zinc-100">{row.year}</td>
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-zinc-300">{row.alternatorOutput}</td>
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-zinc-300">
                          {row.alternatorOutputApprox ? "Yes" : "No"}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-zinc-300">{row.stockLoad}</td>
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-zinc-300">
                          {row.stockLoadApprox ? "Yes" : "No"}
                        </td>
                        <td className="max-w-sm truncate px-5 py-4 text-sm text-zinc-400">
                          {row.manualUrl ? (
                            <a
                              href={row.manualUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-amber-300 hover:underline"
                            >
                              {row.manualUrl}
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/dashboard/variant-edit?makeId=${encodeURIComponent(row.makeId)}&model=${encodeURIComponent(row.model)}&year=${row.year}`}
                            className="inline-flex h-8 items-center gap-1 rounded-md border border-zinc-700 px-3 text-xs text-zinc-200 hover:border-amber-400 hover:text-amber-300"
                          >
                            <Icon name="edit" className="text-sm" />
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <section className="grid gap-4 rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 md:grid-cols-3">
            <form onSubmit={(e) => void onAddMake(e)} className="grid gap-2 rounded-lg border border-zinc-800 p-4">
              <h3 className="text-sm font-semibold text-zinc-100">Add Make</h3>
              <RequiredLabel>Make Name</RequiredLabel>
              <input
                required
                value={makeName}
                onChange={(e) => setMakeName(e.target.value)}
                className="h-10 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
              />
              <button
                type="submit"
                className="h-10 rounded-lg bg-amber-400 text-sm font-semibold text-zinc-950"
              >
                Add Make
              </button>
            </form>

            <form onSubmit={(e) => void onAddModel(e)} className="grid gap-2 rounded-lg border border-zinc-800 p-4">
              <h3 className="text-sm font-semibold text-zinc-100">Add Model</h3>
              <RequiredLabel>Make</RequiredLabel>
              <select
                required
                value={modelMakeId}
                onChange={(e) => setModelMakeId(e.target.value as Id<"bikes">)}
                className="h-10 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
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
                className="h-10 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
              />
              <button
                type="submit"
                className="h-10 rounded-lg bg-amber-400 text-sm font-semibold text-zinc-950"
              >
                Add Model
              </button>
            </form>

            <form onSubmit={(e) => void onAddYear(e)} className="grid gap-2 rounded-lg border border-zinc-800 p-4">
              <h3 className="text-sm font-semibold text-zinc-100">Add Year + Specs</h3>
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
                className="h-10 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
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
                className="h-10 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
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
                className="h-10 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
              />

              <RequiredLabel>Alternator Approx?</RequiredLabel>
              <BooleanRadio value={alternatorApprox} onChange={setAlternatorApprox} name="create-alt-approx" />

              <RequiredLabel>Stock Load (W)</RequiredLabel>
              <input
                type="number"
                required
                min={0}
                value={stockLoad}
                onChange={(e) => setStockLoad(Number(e.target.value))}
                className="h-10 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
              />

              <RequiredLabel>Stock Load Approx?</RequiredLabel>
              <BooleanRadio value={stockLoadApprox} onChange={setStockLoadApprox} name="create-stock-approx" />

              <label className="text-xs font-semibold text-zinc-300">Manual URL</label>
              <input
                type="url"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                className="h-10 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
              />

              <button
                type="submit"
                className="h-10 rounded-lg bg-amber-400 text-sm font-semibold text-zinc-950"
              >
                Add Year
              </button>
            </form>
          </section>

          <p className="text-sm text-red-400">{formError ?? ""}</p>
        </div>
      </section>
    </main>
  );
}
