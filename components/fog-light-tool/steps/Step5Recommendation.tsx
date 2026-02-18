import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import type { FogLight, Step5Props } from "../types";

function lumensToNumber(lumens: string) {
  return Number(lumens.replace(/[^0-9]/g, "")) || 0;
}

function rankRidingStyleLights(lights: FogLight[], speed: string, terrain: string, fog: string) {
  const speedWeight: Record<string, number> = {
    "0-50": 0.8,
    "50-80": 1,
    "80-110": 1.2,
    "110+": 1.35,
  };
  const terrainWeight: Record<string, number> = {
    city: 0.85,
    highway: 1.2,
    mixed: 1,
    hilly: 1.1,
  };
  const fogWeight: Record<string, number> = {
    no: 0.9,
    occasionally: 1,
    frequently: 1.15,
  };

  return [...lights].sort((a, b) => {
    const aScore =
      lumensToNumber(a.lumens) * speedWeight[speed] * terrainWeight[terrain] * fogWeight[fog] -
      a.loadWatts * 10;
    const bScore =
      lumensToNumber(b.lumens) * speedWeight[speed] * terrainWeight[terrain] * fogWeight[fog] -
      b.loadWatts * 10;
    return bScore - aScore;
  });
}

export default function Step5Recommendation({
  state,
  setState,
  canRevealResults,
  fogLights,
  remainingWatts,
}: Step5Props) {
  if (!canRevealResults) {
    return null;
  }

  const budget = Math.max(0, Math.floor(remainingWatts));
  const fittingLights = fogLights
    .filter((light) => light.loadWatts <= budget)
    .sort((a, b) => b.rating - a.rating);
  const ridingStyleLights = rankRidingStyleLights(
    fogLights,
    state.speed,
    state.terrain,
    state.fogFrequency,
  );
  const list = state.recommendationMode === "capacity" ? fittingLights : ridingStyleLights;
  const boundedIndex = Math.min(Math.max(state.recommendationIndex ?? 0, 0), Math.max(list.length - 1, 0));
  const featured = list[boundedIndex] ?? fogLights[0];

  return (
    <section className="space-y-5 pt-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black tracking-[0.18em] text-primary uppercase">Final Step</p>
        <p className="text-sm text-white/70">Step 5 of 5</p>
      </div>
      <div className="h-2 w-full rounded-full bg-border-dark">
        <div className="h-full w-full rounded-full bg-primary" />
      </div>

      <h2 className="text-4xl font-black tracking-tight">Recommended For You</h2>

      <div className="rounded-full bg-surface-dark p-1">
        <div className="grid grid-cols-2 gap-1">
          <button
            className="relative rounded-full px-4 py-2.5 text-sm font-black"
            onClick={() => void setState({ recommendationMode: "style", recommendationIndex: 0 })}
          >
            {state.recommendationMode === "style" && (
              <motion.span
                layoutId="recommendation-mode-pill"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 450, damping: 36 }}
              />
            )}
            <span className={`relative z-10 ${state.recommendationMode === "style" ? "text-background-dark" : "text-white/65"}`}>
              Based on Riding Style
            </span>
          </button>
          <button
            className="relative rounded-full px-4 py-2.5 text-sm font-black"
            onClick={() => void setState({ recommendationMode: "capacity", recommendationIndex: 0 })}
          >
            {state.recommendationMode === "capacity" && (
              <motion.span
                layoutId="recommendation-mode-pill"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 450, damping: 36 }}
              />
            )}
            <span className={`relative z-10 ${state.recommendationMode === "capacity" ? "text-background-dark" : "text-white/65"}`}>
              Based on Capacity
            </span>
          </button>
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${state.recommendationMode}-${featured.id}-${boundedIndex}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {list.length === 0 && state.recommendationMode === "capacity" ? (
            <div className="rounded-2xl border border-border-dark bg-surface-dark p-4 text-sm text-white/70">
              No lights fit the remaining budget ({budget}W).
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-[1.5rem] border border-border-dark bg-surface-dark">
                <div className="relative border-b border-border-dark bg-background-dark p-4">
                  <div className="absolute top-4 right-4 rounded-full bg-primary px-3 py-1 text-[10px] font-black text-background-dark uppercase">
                    Premium
                  </div>
                  <div className="relative h-56 w-full">
                    <Image
                      alt={featured.name}
                      className="h-full w-full object-contain"
                      src={featured.imageUrl}
                      width={620}
                      height={340}
                    />
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-4xl leading-none font-black uppercase">{featured.name}</h3>
                      <p className="mt-2 text-2xl text-white/70">Adaptive LED Illumination System</p>
                    </div>
                    <p className="text-right text-4xl leading-none font-black text-primary">
                      {lumensToNumber(featured.lumens).toLocaleString()}
                      <br />
                      LM
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
                      <span className="material-symbols-outlined text-sm text-emerald-400">verified</span>
                      <span className="text-xs font-bold text-emerald-300">Electrical Safety Approved</span>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1">
                      <span className="material-symbols-outlined text-sm text-blue-300">cloud</span>
                      <span className="text-xs font-bold text-blue-300">All-Weather Optimized</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black tracking-[0.18em] text-white/55 uppercase">
                  Recommended Light
                </p>
                <div className="flex items-center gap-2 rounded-2xl bg-surface-dark p-1">
                  <button
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-white/70 disabled:opacity-35"
                    disabled={boundedIndex === 0}
                    onClick={() => void setState({ recommendationIndex: boundedIndex - 1 })}
                    aria-label="Previous recommendation"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button
                    className="min-w-0 flex-1 rounded-xl px-3 py-2 text-center text-sm font-black text-primary"
                    onClick={() =>
                      void setState({
                        recommendationIndex: boundedIndex < list.length - 1 ? boundedIndex + 1 : 0,
                      })
                    }
                    title="Click to cycle recommendations"
                  >
                    {featured.name} ({featured.loadWatts}W)
                  </button>
                  <button
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-white/70 disabled:opacity-35"
                    disabled={boundedIndex >= list.length - 1}
                    onClick={() => void setState({ recommendationIndex: boundedIndex + 1 })}
                    aria-label="Next recommendation"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-border-dark bg-surface-dark p-4">
                <p className="text-[10px] font-black tracking-[0.18em] text-white/55 uppercase">
                  Technical Specifications
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <SpecTile icon="wb_sunny" label="Luminous Flux" value={featured.lumens} />
                  <SpecTile icon="thermostat" label="Color Temp" value="3000K/6000K" />
                  <SpecTile icon="water_drop" label="Waterproof" value="IP68 Rating" />
                  <SpecTile icon="schedule" label="Lifespan" value="50,000+ Hrs" />
                  <SpecTile icon="construction" label="Housing Material" value="Aviation Alum." />
                  <SpecTile icon="bolt" label="Voltage Range" value="9V - 32V DC" />
                </div>
              </div>

              <div className="space-y-3 border-t border-border-dark pt-4">
                <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-2xl font-black text-background-dark shadow-xl shadow-primary/30 transition-all hover:brightness-110 active:scale-95">
                  View Recommended Light
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
                <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-500/50 bg-emerald-950/40 py-3.5 text-2xl font-bold text-emerald-400 shadow-lg shadow-emerald-500/10 transition-all hover:brightness-110 active:scale-95">
                  Send Config via WhatsApp
                </button>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

function SpecTile({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border-dark bg-surface-dark p-3.5">
      <span className="material-symbols-outlined mb-2 text-primary">{icon}</span>
      <p className="text-xs font-bold uppercase text-white/45">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}
