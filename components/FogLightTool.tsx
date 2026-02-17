"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import {
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";

type Bike = {
  make: string;
  models: {
    name: string;
    years: {
      year: number;
      alternatorOutput: number;
      stockLoad: number;
    }[];
  }[];
};

type FogLight = {
  id: string;
  name: string;
  loadWatts: number;
  lumens: string;
  imageUrl: string;
  rating: number;
};

const STATIC_BIKES: Bike[] = [
  {
    make: "BMW Motorrad",
    models: [
      {
        name: "R1250GS",
        years: [
          { year: 2023, alternatorOutput: 510, stockLoad: 340 },
          { year: 2024, alternatorOutput: 520, stockLoad: 345 },
        ],
      },
    ],
  },
  {
    make: "Honda",
    models: [
      {
        name: "Africa Twin",
        years: [
          { year: 2023, alternatorOutput: 490, stockLoad: 330 },
          { year: 2024, alternatorOutput: 500, stockLoad: 335 },
        ],
      },
    ],
  },
  {
    make: "KTM",
    models: [
      {
        name: "1290 Super Adventure",
        years: [
          { year: 2023, alternatorOutput: 480, stockLoad: 320 },
          { year: 2024, alternatorOutput: 485, stockLoad: 325 },
        ],
      },
    ],
  },
  {
    make: "Kawasaki",
    models: [
      {
        name: "Versys 1000",
        years: [
          { year: 2023, alternatorOutput: 470, stockLoad: 315 },
          { year: 2024, alternatorOutput: 475, stockLoad: 320 },
        ],
      },
    ],
  },
];

const STATIC_FOG_LIGHTS: FogLight[] = [
  {
    id: "x1-plus-pro",
    name: "X1 Plus Pro",
    loadWatts: 40,
    lumens: "8,500 LM",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDJvrdeQpDjQLtrTWi2vpG7YSo2wpjuHRwdKz3Y0OwZVtyGbAlZIIciF_a492zSj22WvLhCEN6DWxAHzlnebtm6eGOQFowebe7SLyP2ACPoeCG9Wh7dzYczYX5_ExYDivN6O4EK3ZTDvUiKitkGSYhji0qWk99P5mcgBUfEZSlIjxGvfeWEcD6aNsyBeunXvI02UWKuZDqFeRA9-2ta8N36y1CD-Ab3BNZbqzT6mAIObhoHn8MlTgdGsSnH6QOvQz4chBwPk1wr12pP",
    rating: 4.5,
  },
];

const fogParser = parseAsStringLiteral(["frequently", "occasionally", "no"]);
const speedParser = parseAsStringLiteral([
  "0-50",
  "50-80",
  "80-110",
  "110+",
]);
const terrainParser = parseAsStringLiteral(["city", "highway", "mixed", "hilly"]);
const beamParser = parseAsStringLiteral(["amber", "white"]);

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function makeVisitorId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `visitor-${Date.now()}`;
}

export default function FogLightTool() {
  const [state, setState] = useQueryStates(
    {
      visitorId: parseAsString.withDefault(""),
      make: parseAsString.withDefault(""),
      model: parseAsString.withDefault(""),
      year: parseAsInteger.withDefault(0),
      existingLoad: parseAsInteger.withDefault(0),
      fogFrequency: fogParser.withDefault("frequently"),
      speed: speedParser.withDefault("50-80"),
      terrain: terrainParser.withDefault("highway"),
      wearsGlasses: parseAsBoolean.withDefault(false),
      leftEye: parseAsString.withDefault(""),
      rightEye: parseAsString.withDefault(""),
      beamColor: beamParser.withDefault("amber"),
    },
    {
      history: "replace",
      shallow: true,
      clearOnDefault: true,
    },
  );

  useEffect(() => {
    if (!state.visitorId) {
      void setState({ visitorId: makeVisitorId() });
    }
  }, [setState, state.visitorId]);

  // Convex-ready wiring (keep commented until backend shape is finalized).
  // import { useQuery } from "convex/react";
  // import { api } from "@/convex/_generated/api";
  // const bikes = useQuery(api.bikes.listAll) ?? [];
  // const fogLights = useQuery(api.fogLights.listAll) ?? [];
  // const bikeSource = bikes.length ? bikes : STATIC_BIKES;
  // const fogLightSource = fogLights.length ? fogLights : STATIC_FOG_LIGHTS;
  const bikeSource = STATIC_BIKES;
  const fogLightSource = STATIC_FOG_LIGHTS;

  const models = useMemo(
    () => bikeSource.find((bike) => bike.make === state.make)?.models ?? [],
    [bikeSource, state.make],
  );
  const years = useMemo(
    () => models.find((model) => model.name === state.model)?.years ?? [],
    [models, state.model],
  );

  const selectedYear = years.find((entry) => entry.year === state.year) ?? {
    alternatorOutput: 510,
    stockLoad: 340,
  };
  const selectedLight = fogLightSource[0];

  const alternatorOutput = selectedYear.alternatorOutput;
  const stockLoad = selectedYear.stockLoad;
  const safeMargin = alternatorOutput - stockLoad - state.existingLoad;
  const recommendedMax = Math.max(0, Math.floor(safeMargin * 0.35));
  const actualLoad = selectedLight.loadWatts;
  const loadPercent = clamp(
    ((stockLoad + state.existingLoad + actualLoad) / alternatorOutput) * 100,
    0,
    100,
  );

  const status = loadPercent <= 70 ? "Optimized" : loadPercent <= 90 ? "Near Limit" : "Overloaded";

  return (
    <>
      <nav className="fixed top-0 left-0 z-50 w-full border-b border-border-dark bg-background-dark/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              electric_bolt
            </span>
            <span className="text-sm font-bold uppercase italic tracking-tight">
              MotoLight <span className="text-primary">Tool</span>
            </span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Progress
            </span>
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-border-dark">
              <div className="progress-bar h-full bg-primary" style={{ width: "65%" }} />
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-xl space-y-12 px-4 pt-16 pb-20">
        <section className="relative overflow-hidden pt-8 pb-4">
          <div className="pointer-events-none absolute -top-10 -right-20 opacity-10">
            <span className="material-symbols-outlined text-[240px] text-primary">
              settings_backup_restore
            </span>
          </div>
          <h1 className="mb-4 text-4xl leading-tight font-black tracking-tight">
            Stop Overloading Your <span className="text-primary italic">Motorcycle.</span>
          </h1>
          <p className="mb-2 text-lg font-medium text-white/90">
            Most riders choose fog lights based on watts, not electrical capacity.
          </p>
          <p className="mb-8 border-l-2 border-primary py-1 pl-4 text-sm italic text-white/60">
            Your battery does not generate power. Your alternator does.
          </p>
          <div className="mb-8 grid grid-cols-1 gap-3">
            <Risk icon="battery_alert" color="text-red-500" text="Battery drain during idle" />
            <Risk icon="thermostat" color="text-orange-500" text="Regulator overheating" />
            <Risk icon="error" color="text-primary" text="Stator damage (Permanent)" />
            <Risk icon="bolt" color="text-blue-400" text="Voltage instability" />
          </div>
          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-lg font-black text-background-dark shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
            Check Your Safe Watt Capacity
            <span className="material-symbols-outlined">arrow_downward</span>
          </button>
        </section>

        <section className="space-y-6">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <span className="h-6 w-1.5 rounded-full bg-primary"></span>
            How Motorcycle Power Actually Works
          </h2>
          <div className="relative flex items-center justify-between py-8">
            <div className="absolute top-1/2 left-0 z-0 h-[2px] w-full -translate-y-1/2 bg-border-dark"></div>
            <PowerNode icon="cyclone" label="Alternator" active />
            <PowerNode icon="settings_input_component" label="Regulator" />
            <PowerNode icon="two_wheeler" label="System" active />
            <PowerNode icon="battery_charging_full" label="Storage" />
          </div>
          <p className="px-8 text-center text-xs text-white/50">
            The alternator must provide enough power for both the bike&apos;s essentials
            and your accessories. The battery is just the tank.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <span className="h-6 w-1.5 rounded-full bg-primary"></span>
            Configure Your Vehicle
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-white/60">
                Motorcycle Make
              </label>
              <select
                className="w-full rounded-xl border border-border-dark bg-surface-dark px-4 py-3 text-white focus:border-primary focus:ring-primary"
                value={state.make}
                onChange={(event) =>
                  void setState({
                    make: event.target.value,
                    model: "",
                    year: 0,
                  })
                }
              >
                <option value="">Select Manufacturer</option>
                {bikeSource.map((bike) => (
                  <option value={bike.make} key={bike.make}>
                    {bike.make}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/60">
                  Model
                </label>
                <select
                  className="w-full rounded-xl border border-border-dark bg-surface-dark px-4 py-3 text-white focus:border-primary focus:ring-primary"
                  value={state.model}
                  onChange={(event) =>
                    void setState({
                      model: event.target.value,
                      year: 0,
                    })
                  }
                >
                  <option value="">Model</option>
                  {models.map((model) => (
                    <option key={model.name} value={model.name}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/60">
                  Year
                </label>
                <select
                  className="w-full rounded-xl border border-border-dark bg-surface-dark px-4 py-3 text-white focus:border-primary focus:ring-primary"
                  value={state.year || ""}
                  onChange={(event) =>
                    void setState({
                      year: Number(event.target.value) || 0,
                    })
                  }
                >
                  <option value="">Year</option>
                  {years.map((yearData) => (
                    <option key={yearData.year} value={yearData.year}>
                      {yearData.year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-white/60">
                Existing Accessory Load (Watts)
              </label>
              <input
                className="w-full rounded-xl border border-border-dark bg-surface-dark px-4 py-3 text-white focus:border-primary focus:ring-primary"
                placeholder="0"
                type="number"
                min={0}
                value={state.existingLoad}
                onChange={(event) =>
                  void setState({
                    existingLoad: Math.max(0, Number(event.target.value) || 0),
                  })
                }
              />
              <p className="text-[10px] italic text-white/40">
                If you already have auxiliary lights or accessories installed, enter their total
                power consumption.
              </p>
            </div>
          </div>

          <div className="glass-card relative overflow-hidden rounded-xl border-l-4 border-l-primary p-6">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <span className="material-symbols-outlined text-8xl">analytics</span>
            </div>
            <h3 className="mb-4 text-xs font-black tracking-widest text-primary uppercase">
              Your Electrical Capacity
            </h3>
            <div className="grid grid-cols-2 gap-y-6">
              <CapacityCell label="Alternator Output" value={alternatorOutput} />
              <CapacityCell label="Stock Load" value={stockLoad} />
              <CapacityCell label="Safe Margin" value={safeMargin} primary signed />
              <CapacityCell label="Recommended Max" value={recommendedMax} />
            </div>
            <div className="mt-6 border-t border-border-dark pt-4">
              <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase">
                <span>Load Status</span>
                <span className={loadPercent <= 70 ? "text-primary" : "text-orange-400"}>
                  {status}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.round(loadPercent)}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <span className="h-6 w-1.5 rounded-full bg-primary"></span>
            Riding Conditions
          </h2>
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-bold">Fog Frequency</label>
              <div className="grid grid-cols-3 gap-2">
                <OptionButton
                  active={state.fogFrequency === "frequently"}
                  onClick={() => void setState({ fogFrequency: "frequently" })}
                  label="Frequently"
                />
                <OptionButton
                  active={state.fogFrequency === "occasionally"}
                  onClick={() => void setState({ fogFrequency: "occasionally" })}
                  label="Occasionally"
                />
                <OptionButton
                  active={state.fogFrequency === "no"}
                  onClick={() => void setState({ fogFrequency: "no" })}
                  label="No"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold">Average Riding Speed</label>
              <div className="grid grid-cols-2 gap-2">
                <OptionButton active={state.speed === "0-50"} onClick={() => void setState({ speed: "0-50" })} label="0-50 km/h" />
                <OptionButton active={state.speed === "50-80"} onClick={() => void setState({ speed: "50-80" })} label="50-80 km/h" />
                <OptionButton active={state.speed === "80-110"} onClick={() => void setState({ speed: "80-110" })} label="80-110 km/h" />
                <OptionButton active={state.speed === "110+"} onClick={() => void setState({ speed: "110+" })} label="110+ km/h" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold">Primary Terrain</label>
              <div className="flex flex-wrap gap-2">
                <PillButton
                  icon="location_city"
                  active={state.terrain === "city"}
                  label="City"
                  onClick={() => void setState({ terrain: "city" })}
                />
                <PillButton
                  icon="directions_car"
                  active={state.terrain === "highway"}
                  label="Highway"
                  onClick={() => void setState({ terrain: "highway" })}
                />
                <PillButton
                  icon="shuffle"
                  active={state.terrain === "mixed"}
                  label="Mixed"
                  onClick={() => void setState({ terrain: "mixed" })}
                />
                <PillButton
                  icon="terrain"
                  active={state.terrain === "hilly"}
                  label="Hilly"
                  onClick={() => void setState({ terrain: "hilly" })}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-border-dark bg-surface-dark transition-all">
            <button
              className="group flex w-full items-center justify-between p-4 text-left"
              onClick={() => void setState({ wearsGlasses: !state.wearsGlasses })}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">visibility</span>
                <span className="font-bold">Do You Wear Glasses for Distance?</span>
              </div>
              <span className="material-symbols-outlined transition-transform group-hover:translate-y-1">
                {state.wearsGlasses ? "expand_less" : "expand_more"}
              </span>
            </button>
            {state.wearsGlasses && (
              <div className="space-y-4 px-4 pb-6">
                <p className="text-xs text-white/60">
                  Distance vision affects how your eyes perceive light patterns. Provide your
                  power for an optimized beam angle recommendation.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/40 uppercase">
                      Left Eye (OS)
                    </label>
                    <input
                      className="w-full rounded-lg border border-border-dark bg-background-dark px-3 py-2 text-sm focus:border-primary focus:ring-primary"
                      placeholder="-1.25"
                      type="text"
                      value={state.leftEye}
                      onChange={(event) => void setState({ leftEye: event.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/40 uppercase">
                      Right Eye (OD)
                    </label>
                    <input
                      className="w-full rounded-lg border border-border-dark bg-background-dark px-3 py-2 text-sm focus:border-primary focus:ring-primary"
                      placeholder="-1.50"
                      type="text"
                      value={state.rightEye}
                      onChange={(event) => void setState({ rightEye: event.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="pt-4">
          <div className="relative overflow-hidden rounded-xl border-2 border-primary bg-gradient-to-br from-primary/20 to-surface-dark p-6 shadow-2xl">
            <div className="absolute top-0 right-0 rounded-bl-xl bg-primary px-4 py-1 text-[10px] font-black text-background-dark uppercase">
              Top Performance Choice
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-6">
                <div className="relative flex aspect-square w-1/2 items-center justify-center rounded-lg border border-border-dark bg-background-dark p-4">
                  <Image
                    alt="High performance LED fog light unit"
                    className="h-auto w-full object-contain"
                    src={selectedLight.imageUrl}
                    width={420}
                    height={420}
                  />
                </div>
                <div className="w-1/2 space-y-2">
                  <h3 className="text-2xl leading-none font-black uppercase italic">
                    X1 Plus <span className="text-primary">Pro</span>
                  </h3>
                  <p className="text-xs text-white/60">
                    Optimized for {state.speed.replace("-", " to ")} km/h {state.terrain} rides.
                  </p>
                  <div className="flex gap-1 pt-2">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <span className="material-symbols-outlined text-sm text-primary" key={index}>
                        {index < Math.floor(selectedLight.rating)
                          ? "star"
                          : index < selectedLight.rating
                            ? "star_half"
                            : "star_outline"}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase">Beam Color Toggle</span>
                  <div className="flex rounded-full border border-border-dark bg-background-dark p-1">
                    <button
                      className={`rounded-full px-4 py-1 text-[10px] font-black uppercase ${state.beamColor === "amber" ? "bg-primary text-background-dark" : "text-white/40"}`}
                      onClick={() => void setState({ beamColor: "amber" })}
                    >
                      Amber
                    </button>
                    <button
                      className={`rounded-full px-4 py-1 text-[10px] font-black uppercase ${state.beamColor === "white" ? "bg-primary text-background-dark" : "text-white/40"}`}
                      onClick={() => void setState({ beamColor: "white" })}
                    >
                      White
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <MetricCell label="Actual Load" value={`${actualLoad} Watts`} />
                  <MetricCell label="Lumens" value={selectedLight.lumens} />
                </div>
              </div>

              <div className="space-y-3 border-t border-border-dark/50 pt-2">
                <h4 className="text-[10px] font-black tracking-widest text-primary/80 uppercase">
                  Technical Specifications
                </h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <SpecCell label="Lumens" value={`${selectedLight.lumens} (Per Pair)`} />
                  <SpecCell label="Color Temp" value="3000K (Amber) / 6000K (White)" />
                  <SpecCell label="Waterproof Rating" value="IP67 Certified" />
                  <SpecCell label="Lifespan" value="50,000+ Hours" />
                  <SpecCell label="Material" value="Aviation-grade Aluminum" />
                  <SpecCell label="Operating Voltage" value="9V - 36V DC" />
                </div>
              </div>

              <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-lg font-black text-background-dark shadow-xl shadow-primary/30 transition-all hover:brightness-110 active:scale-95">
                View Recommended Light
                <span className="material-symbols-outlined">shopping_cart</span>
              </button>
              <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-bold text-white shadow-lg shadow-[#25D366]/20 transition-all hover:brightness-110 active:scale-95">
                Send Config to Lumevo via WhatsApp
              </button>
            </div>
          </div>
        </section>

        <footer className="space-y-4 py-10 text-center">
          <div className="flex justify-center gap-4 text-white/40">
            <span className="material-symbols-outlined">shield</span>
            <span className="material-symbols-outlined">verified_user</span>
            <span className="material-symbols-outlined">build</span>
          </div>
          <p className="text-[10px] tracking-[0.2em] text-white/30 uppercase">
            Engineering precision for every ride
          </p>
          <p className="text-[10px] text-white/20">Visitor ID: {state.visitorId || "..."}</p>
        </footer>
      </main>
    </>
  );
}

function Risk({ icon, color, text }: { icon: string; color: string; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border-dark bg-surface-dark p-3">
      <span className={`material-symbols-outlined ${color}`}>{icon}</span>
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}

function PowerNode({ icon, label, active = false }: { icon: string; label: string; active?: boolean }) {
  return (
    <div className="relative z-10 flex flex-col items-center gap-2">
      <div
        className={`flex items-center justify-center rounded-full bg-surface-dark ${active ? "size-12 border-2 border-primary" : "size-10 border border-border-dark"}`}
      >
        <span className={`material-symbols-outlined ${active ? "text-primary" : "text-white/60"}`}>
          {icon}
        </span>
      </div>
      <span className="text-center text-[10px] leading-none font-bold uppercase">{label}</span>
    </div>
  );
}

function OptionButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border py-3 px-2 text-xs font-bold ${active ? "border-primary bg-primary/10 text-primary" : "border-border-dark text-white/60"}`}
    >
      {label}
    </button>
  );
}

function PillButton({
  icon,
  active,
  label,
  onClick,
}: {
  icon: string;
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs ${active ? "border-primary bg-primary font-black text-background-dark" : "border-border-dark font-bold text-white/90"}`}
    >
      <span className="material-symbols-outlined text-[16px]">{icon}</span>
      {label}
    </button>
  );
}

function CapacityCell({
  label,
  value,
  primary,
  signed,
}: {
  label: string;
  value: number;
  primary?: boolean;
  signed?: boolean;
}) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-bold text-white/40 uppercase">{label}</p>
      <p className={`text-xl font-black ${primary ? "text-primary" : ""}`}>
        {signed ? (value >= 0 ? `+${value}` : value) : value}{" "}
        <span className="text-sm font-normal text-white/60">Watts</span>
      </p>
    </div>
  );
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border-dark bg-background-dark p-3 text-center">
      <p className="text-[9px] font-bold text-white/40 uppercase">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}

function SpecCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[9px] font-bold text-white/40 uppercase">{label}</span>
      <span className="text-xs font-semibold">{value}</span>
    </div>
  );
}
