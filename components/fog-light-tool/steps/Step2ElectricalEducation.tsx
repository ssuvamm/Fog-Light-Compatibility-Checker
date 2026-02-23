import { useMemo, useState } from "react";

type LoadMode = "system" | "normal" | "excessive";
type FlowSegment = {
  path: string;
  color: string;
  count: number;
  dur: number;
};

type SimView = {
  status: string;
  statusClass: string;
  batteryPercent: number;
  batteryVoltage: number;
  batteryClass: string;
  systemActive: boolean;
  fogClass: string;
  rrClass: string;
  showChargeBolt: boolean;
  spinMachine: boolean;
};

function getSimView(
  keyOn: boolean,
  engineOn: boolean,
  loadMode: LoadMode,
): SimView {
  if (!keyOn) {
    return {
      status: "System Off",
      statusClass: "from-zinc-700 text-zinc-300",
      batteryPercent: 100,
      batteryVoltage: 12.6,
      batteryClass: "bg-emerald-500",
      systemActive: false,
      fogClass: "text-zinc-500",
      rrClass: "border-zinc-600",
      showChargeBolt: false,
      spinMachine: false,
    };
  }

  if (!engineOn) {
    if (loadMode === "system") {
      return {
        status: "Battery Discharging Slowly",
        statusClass:
          "border border-amber-500/50 from-amber-900/40 text-amber-300",
        batteryPercent: 80,
        batteryVoltage: 12.4,
        batteryClass: "bg-amber-500",
        systemActive: true,
        fogClass: "text-zinc-500",
        rrClass: "border-zinc-600",
        showChargeBolt: false,
        spinMachine: false,
      };
    }
    return {
      status: "Battery Rapidly Discharging",
      statusClass: "border border-red-500/50 from-red-900/40 text-red-300",
      batteryPercent: 40,
      batteryVoltage: 11.5,
      batteryClass: "bg-red-500",
      systemActive: true,
      fogClass: "text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]",
      rrClass: "border-zinc-600",
      showChargeBolt: false,
      spinMachine: false,
    };
  }

  if (loadMode === "system") {
    return {
      status: "Battery Charging",
      statusClass:
        "border border-emerald-500/50 from-emerald-500/40 text-emerald-300",
      batteryPercent: 100,
      batteryVoltage: 14.2,
      batteryClass: "bg-emerald-500",
      systemActive: true,
      fogClass: "text-zinc-500",
      rrClass: "border-emerald-400 shadow-[0_0_15px_rgba(251,191,36,0.4)]",
      showChargeBolt: true,
      spinMachine: true,
    };
  }

  if (loadMode === "normal") {
    return {
      status: "Battery Charging || System Normal",
      statusClass:
        "border border-emerald-500/50 from-emerald-500/40 text-emerald-300",
      batteryPercent: 90,
      batteryVoltage: 13.8,
      batteryClass: "bg-emerald-500",
      systemActive: true,
      fogClass: "text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]",
      rrClass: "border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)]",
      showChargeBolt: true,
      spinMachine: true,
    };
  }

  return {
    status: "Battery Discharging || System Overload",
    statusClass: "border border-red-500/50 from-red-900/40 text-red-300",
    batteryPercent: 60,
    batteryVoltage: 12.1,
    batteryClass: "bg-red-500",
    systemActive: true,
    fogClass: "text-red-400 drop-shadow-[0_0_12px_rgba(248,113,113,0.7)]",
    rrClass: "border-red-500 shadow-[0_0_16px_rgba(239,68,68,0.45)]",
    showChargeBolt: false,
    spinMachine: true,
  };
}

export default function Step2ElectricalEducation() {
  const [keyOn, setKeyOn] = useState(true);
  const [engineOn, setEngineOn] = useState(true);
  const [loadMode, setLoadMode] = useState<LoadMode>("normal");

  const view = useMemo(
    () => getSimView(keyOn, engineOn, loadMode),
    [keyOn, engineOn, loadMode],
  );

  const activeFlows = useMemo<FlowSegment[]>(() => {
    if (!keyOn) return [];

    if (!engineOn) {
      if (loadMode === "system") {
        return [
          { path: "battery-system", color: "#f59e0b", count: 3, dur: 2.4 },
        ];
      }
      return [
        { path: "battery-system", color: "#ef4444", count: 6, dur: 1.3 },
        { path: "battery-fog", color: "#ef4444", count: 6, dur: 1.3 },
      ];
    }

    if (loadMode === "system") {
      return [
        { path: "engine-alt", color: "#f59e0b", count: 4, dur: 1.6 },
        { path: "alt-rr", color: "#f59e0b", count: 4, dur: 1.6 },
        { path: "rr-battery", color: "#22c55e", count: 4, dur: 1.9 },
        { path: "battery-system", color: "#f59e0b", count: 4, dur: 1.8 },
      ];
    }

    if (loadMode === "normal") {
      return [
        { path: "engine-alt", color: "#f59e0b", count: 4, dur: 2 },
        { path: "alt-rr", color: "#f59e0b", count: 4, dur: 2 },
        { path: "rr-battery", color: "#22c55e", count: 2, dur: 2 },
        { path: "battery-system", color: "#f59e0b", count: 4, dur: 1.7 },
        { path: "battery-fog", color: "#f59e0b", count: 4, dur: 1.8 },
      ];
    }

    return [
      { path: "engine-alt", color: "#f59e0b", count: 5, dur: 1.5 },
      { path: "alt-rr", color: "#f59e0b", count: 5, dur: 1.5 },
      { path: "rr-battery", color: "#f59e0b", count: 5, dur: 1.5 },
      { path: "battery-system", color: "#ef4444", count: 8, dur: 1.35 },
      { path: "battery-fog", color: "#ef4444", count: 6, dur: 1.4 },
    ];
  }, [engineOn, keyOn, loadMode]);

  const onKeyToggle = () => {
    const next = !keyOn;
    setKeyOn(next);
    if (!next) {
      setEngineOn(false);
      setLoadMode("normal");
    }
  };

  const onEngineToggle = () => {
    if (!keyOn) return;
    setEngineOn((prev) => !prev);
  };

  const onModeChange = (mode: LoadMode) => {
    if (!keyOn) return;
    setLoadMode(mode);
  };

  return (
    <section className="">
      <div className="pb-4 ">
        <h2 className="text-2xl text-center leading-tight font-black tracking-tight">
          How Motorcycle Power <br />
          <span className="text-primary">Actually</span> Works
        </h2>
      </div>

      <div className="relative rounded-3xl border border-border-dark bg-surface-dark">
        <div className="sticky top-0 z-9 bg-[#1c1a14] flex flex-col justify-between gap-2 border-b border-border-dark p-4 rounded-3xl ">
          <p className="text-[10px] text-center font-bold tracking-[0.16em] text-white/60 uppercase">
            Electrical Flow Simulator
          </p>
          <p
            className={`rounded-full text-center px-2 py-1 text-[10px]  font-bold tracking-wide uppercase  bg-linear-to-r  to-transparent ${view.statusClass}`}
          >
            {view.status}
          </p>
        </div>

        <div className="relative mx-auto my-4 h-[50vh] w-[320px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,rgba(0,0,0,0)_70%)] md:h-118 md:w-105">
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <path id="engine-alt" d="M27 8 H73" />
              <path id="alt-rr" d="M80 12 V40" />
              <path id="rr-battery" d="M73 40 H27" />
              <path id="battery-system" d="M20 45 V56 H78 V70" />
              <path id="battery-fog" d="M20 45 V82 H28" />
            </defs>

            <g fill="none" strokeWidth="0.7" stroke="rgba(255,255,255,0.18)">
              <use href="#engine-alt" />
              <use href="#alt-rr" />
              <use href="#rr-battery" />
              <use href="#battery-system" />
              <use href="#battery-fog" />
            </g>

            {activeFlows.map((flow) =>
              Array.from({ length: flow.count }).map((_, idx) => (
                <circle key={`${flow.path}-${idx}`} r="0.8" fill={flow.color}>
                  <animateMotion
                    dur={`${flow.dur}s`}
                    repeatCount="indefinite"
                    begin={`${(idx / flow.count) * flow.dur}s`}
                  >
                    <mpath href={`#${flow.path}`} />
                  </animateMotion>
                </circle>
              )),
            )}
          </svg>

          <div className="absolute top-[10%] left-[20%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-zinc-600 bg-zinc-800">
              <svg
                className={`h-10 w-10 text-zinc-400 ${view.spinMachine ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
                <path
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <span className="text-[10px] font-bold text-white/60 uppercase">
              Engine
            </span>
          </div>

          <div className="absolute top-[10%] left-[80%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-zinc-600 bg-zinc-800">
              <svg
                className={`h-8 w-8 text-zinc-400 ${view.spinMachine ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <span className="text-[10px] font-bold text-white/60 uppercase">
              Alternator
            </span>
          </div>

          <div className="absolute top-[40%] left-[20%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1">
            <div className="relative flex h-16 w-14 flex-col items-center rounded border-2 border-zinc-600 bg-zinc-800 p-2">
              <div className="absolute -top-1 h-2 w-full rounded-sm bg-zinc-700"></div>
              <div
                className={`mt-auto w-full rounded-sm transition-all duration-500 ${view.batteryClass}`}
                style={{ height: `${view.batteryPercent}%` }}
              />
              <span className="absolute text-[9px] font-bold text-white">
                {view.batteryVoltage.toFixed(1)}V
              </span>
              {view.showChargeBolt && (
                <span className="absolute -right-2 -top-2 rounded-full bg-yellow-500/20 p-1 text-yellow-400">
                  <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
                    <path d="M7 2V13H10V22L17 10H13L17 2H7Z" />
                  </svg>
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold text-white/60 uppercase">
              Battery
            </span>
          </div>

          <div className="absolute top-[40%] left-[80%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1">
            <div
              className={`flex h-14 w-14 flex-col items-center justify-center space-y-1 rounded border-2 bg-zinc-800 transition-all ${view.rrClass}`}
            >
              <div className="h-1 w-8 rounded-full bg-zinc-600"></div>
              <div className="h-1 w-8 rounded-full bg-zinc-600"></div>
              <div className="h-1 w-8 rounded-full bg-zinc-600"></div>
            </div>
            <span className="text-[10px] font-bold text-white/60 uppercase">
              R/R Unit
            </span>
          </div>

          <div className="absolute top-[70%] left-[78%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1">
            <div className="flex h-12 w-16 items-center justify-center rounded-md border-2 border-zinc-600 bg-zinc-800">
              <div className="grid grid-cols-3 gap-1">
                <div className="h-2 w-2 rounded-full bg-zinc-700"></div>
                <div
                  className={`h-2 w-2 rounded-full ${view.systemActive ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]" : "bg-zinc-700"}`}
                ></div>
                <div className="h-2 w-2 rounded-full bg-zinc-700"></div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-white/60 uppercase">
              ECU/SYS
            </span>
          </div>

          <div
            data-testid="fog-light"
            className="absolute top-[85%] left-[35%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-zinc-600 bg-zinc-800">
              <svg
                className={`h-6 w-6 transition-colors ${view.fogClass}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859C13.487 12.333 14 11.233 14 10a4 4 0 00-8 0c0 1.233.513 2.333 1.523 3.141.269.213.462.519.477.859h4z" />
              </svg>
            </div>
            <span className="text-[10px] font-bold text-white/60 uppercase">
              Fog Lights
            </span>
          </div>
        </div>

        <div
          data-testid="vehicle-control"
          className="sticky bottom-12 border-t rounded-b-3xl border-border-dark bg-[#1a1a1a] p-4"
        >
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 ">
            <div className="flex flex-col items-center justify-center">
              <span className="mb-2 text-[10px] font-bold text-zinc-500 uppercase">
                Vehicle Key
              </span>
              <button
                type="button"
                onClick={onKeyToggle}
                className={`cursor-pointer flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${keyOn ? "border-amber-400 bg-zinc-800 text-amber-300" : "border-zinc-700 bg-zinc-800 text-zinc-500"}`}
                aria-label="Toggle vehicle key"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </button>
            </div>

            <div className="flex flex-col items-center justify-center">
              <span className="mb-2 text-[10px] font-bold text-zinc-500 uppercase">
                Engine
              </span>
              <button
                type="button"
                onClick={onEngineToggle}
                disabled={!keyOn}
                className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${!keyOn ? "cursor-not-allowed border-zinc-800 bg-zinc-900 text-zinc-700" : engineOn ? "cursor-pointer border-amber-400 bg-zinc-800 text-amber-300" : "cursor-pointer border-zinc-700 bg-zinc-800 text-zinc-500"}`}
                aria-label="Toggle engine state"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </button>
            </div>

            <div className="flex flex-col col-span-2 items-center justify-center">
              <span className="mb-2 text-[10px] font-bold text-zinc-500 uppercase">
                Load Mode
              </span>
              <div className="flex w-full justify-around gap-2 flex-row">
                <button
                  type="button"
                  disabled={!keyOn}
                  onClick={() => onModeChange("system")}
                  className={`flex-1 rounded border py-2 px-4 text-[9px] font-bold ${keyOn ? (loadMode === "system" ? "cursor-pointer border-blue-500/50 bg-blue-500/20 text-blue-200" : "cursor-pointer border-zinc-700 bg-zinc-800 text-zinc-400") : "cursor-not-allowed"}`}
                >
                  SYSTEM
                </button>
                <button
                  type="button"
                  disabled={!keyOn}
                  onClick={() => onModeChange("normal")}
                  className={`flex-1 rounded border py-2 px-4 text-[9px] font-bold ${keyOn ? (loadMode === "normal" ? "cursor-pointer border-amber-500/50 bg-amber-500/20 text-amber-200" : "cursor-pointer border-zinc-700 bg-zinc-800 text-zinc-400") : "cursor-not-allowed"}`}
                >
                  NORMAL
                </button>
                <button
                  type="button"
                  disabled={!keyOn}
                  onClick={() => onModeChange("excessive")}
                  className={`flex-1 rounded border py-2 px-4 text-[9px] font-bold ${keyOn ? (loadMode === "excessive" ? "cursor-pointer border-red-500/50 bg-red-500/20 text-red-200" : "cursor-pointer border-zinc-700 bg-zinc-800 text-zinc-400") : "cursor-not-allowed"}`}
                >
                  EXCESSIVE
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*
      <p className="text-sm italic text-white/60">
        We analyzed real motorcycle electrical data to build this tool for
        riders.
      </p> */}
    </section>
  );
}
