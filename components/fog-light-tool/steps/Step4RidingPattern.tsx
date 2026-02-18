import { AnimatePresence, motion } from "framer-motion";
import { OptionButton, PillButton } from "../ui";
import type { Step4Props } from "../types";

export default function Step4RidingPattern({ state, setState, canRevealResults }: Step4Props) {
  if (!canRevealResults) {
    return null;
  }

  return (
    <>
      <section className="space-y-8">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <span className="h-6 w-1.5 rounded-full bg-primary"></span>
          Riding Conditions
        </h2>
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold">
              <span className="material-symbols-outlined text-base text-primary">foggy</span>
              Fog Frequency
            </label>
            <div className="rounded-full bg-surface-dark p-1">
              <div className="grid grid-cols-3 gap-1">
                <button
                  className="relative rounded-full px-3 py-2.5 text-sm font-black"
                  onClick={() => void setState({ fogFrequency: "frequently" })}
                >
                  {state.fogFrequency === "frequently" && (
                    <motion.span
                      layoutId="fog-frequency-pill"
                      className="absolute inset-0 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 450, damping: 36 }}
                    />
                  )}
                  <span className={`relative z-10 ${state.fogFrequency === "frequently" ? "text-background-dark" : "text-white/65"}`}>
                    Frequently
                  </span>
                </button>
                <button
                  className="relative rounded-full px-3 py-2.5 text-sm font-black"
                  onClick={() => void setState({ fogFrequency: "occasionally" })}
                >
                  {state.fogFrequency === "occasionally" && (
                    <motion.span
                      layoutId="fog-frequency-pill"
                      className="absolute inset-0 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 450, damping: 36 }}
                    />
                  )}
                  <span className={`relative z-10 ${state.fogFrequency === "occasionally" ? "text-background-dark" : "text-white/65"}`}>
                    Occasionally
                  </span>
                </button>
                <button
                  className="relative rounded-full px-3 py-2.5 text-sm font-black"
                  onClick={() => void setState({ fogFrequency: "no" })}
                >
                  {state.fogFrequency === "no" && (
                    <motion.span
                      layoutId="fog-frequency-pill"
                      className="absolute inset-0 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 450, damping: 36 }}
                    />
                  )}
                  <span className={`relative z-10 ${state.fogFrequency === "no" ? "text-background-dark" : "text-white/65"}`}>
                    No
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold">
              <span className="material-symbols-outlined text-base text-primary">speed</span>
              Average Riding Speed
            </label>
            <div className="grid grid-cols-2 gap-2">
              <OptionButton active={state.speed === "0-50"} onClick={() => void setState({ speed: "0-50" })} label="0-50 km/h" />
              <OptionButton active={state.speed === "50-80"} onClick={() => void setState({ speed: "50-80" })} label="50-80 km/h" />
              <OptionButton active={state.speed === "80-110"} onClick={() => void setState({ speed: "80-110" })} label="80-110 km/h" />
              <OptionButton active={state.speed === "110+"} onClick={() => void setState({ speed: "110+" })} label="110+ km/h" />
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold">
              <span className="material-symbols-outlined text-base text-primary">alt_route</span>
              Primary Terrain
            </label>
            <div className="grid grid-cols-2 gap-2">
              <PillButton icon="location_city" active={state.terrain === "city"} label="City" onClick={() => void setState({ terrain: "city" })} />
              <PillButton icon="directions_car" active={state.terrain === "highway"} label="Highway" onClick={() => void setState({ terrain: "highway" })} />
              <PillButton icon="shuffle" active={state.terrain === "mixed"} label="Mixed" onClick={() => void setState({ terrain: "mixed" })} />
              <PillButton icon="terrain" active={state.terrain === "hilly"} label="Hilly" onClick={() => void setState({ terrain: "hilly" })} />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <motion.div
          className="overflow-hidden rounded-xl border border-border-dark bg-surface-dark"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.7 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="flex w-full items-center justify-between p-4 text-left">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">eyeglasses_2</span>
              <span className="font-bold">Do You Wear Glasses for Distance?</span>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase ${state.wearsGlasses ? "border-primary bg-primary/10 text-primary" : "border-border-dark text-white/60"}`}
                onClick={() => void setState({ wearsGlasses: true })}
                whileTap={{ scale: 0.97 }}
                animate={{ scale: state.wearsGlasses ? 1.03 : 1 }}
                transition={{ duration: 0.18 }}
              >
                Yes
              </motion.button>
              <motion.button
                className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase ${!state.wearsGlasses ? "border-primary bg-primary/10 text-primary" : "border-border-dark text-white/60"}`}
                onClick={() => void setState({ wearsGlasses: false })}
                whileTap={{ scale: 0.97 }}
                animate={{ scale: !state.wearsGlasses ? 1.03 : 1 }}
                transition={{ duration: 0.18 }}
              >
                No
              </motion.button>
            </div>
          </div>
          <AnimatePresence initial={false}>
            {state.wearsGlasses && (
              <motion.div
                key="glasses-fields"
                className="space-y-4 px-4 pb-6"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <p className="text-xs text-white/60">
                  Distance vision affects how your eyes perceive light patterns. Provide your power
                  for an optimized beam angle recommendation.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/40 uppercase">Left Eye (OS)</label>
                    <input
                      className="w-full rounded-lg border border-border-dark bg-background-dark px-3 py-2 text-sm focus:border-primary focus:ring-primary"
                      placeholder="-1.25"
                      type="text"
                      value={state.leftEye}
                      onChange={(event) => void setState({ leftEye: event.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/40 uppercase">Right Eye (OD)</label>
                    <input
                      className="w-full rounded-lg border border-border-dark bg-background-dark px-3 py-2 text-sm focus:border-primary focus:ring-primary"
                      placeholder="-1.50"
                      type="text"
                      value={state.rightEye}
                      onChange={(event) => void setState({ rightEye: event.target.value })}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>
    </>
  );
}
