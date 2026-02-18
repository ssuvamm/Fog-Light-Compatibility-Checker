import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CapacityCell } from "../ui";
import type { Step3Props } from "../types";

export default function Step3ElectricalCapacity({
  state,
  setState,
  bikes,
  models,
  years,
  isVehicleConfigured,
  canRevealResults,
  capacity,
  electricalCapacityRef,
}: Step3Props) {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestMake, setRequestMake] = useState("");
  const [requestModel, setRequestModel] = useState("");
  const [requestYear, setRequestYear] = useState("");

  const requestText = useMemo(() => {
    return encodeURIComponent(
      `Hi, I can't find my motorcycle in the tool.\nMake: ${requestMake || "-"}\nModel: ${requestModel || "-"}\nProduction Year: ${requestYear || "-"}`,
    );
  }, [requestMake, requestModel, requestYear]);

  return (
    <>
      <section className="space-y-6" id="configure-your-vehicle">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <span className="h-6 w-1.5 rounded-full bg-primary"></span>
          Know Your Motorcycle Capacity
        </h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="Make"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/60"
            >
              Motorcycle Make
            </label>
            <select
              id="Make"
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
              {bikes.map((bike) => (
                <option value={bike.make} key={bike.make}>
                  {bike.make}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="model"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/60"
              >
                Model
              </label>
              <select
                id="model"
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
              <label
                htmlFor="year"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/60"
              >
                Year
              </label>
              <select
                id="year"
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
          <div className="flex justify-end">
            <button
              className="cursor-pointer text-sm font-bold text-primary underline underline-offset-4 hover:text-primary/80"
              onClick={() => setIsRequestModalOpen(true)}
            >
              Can&apos;t find your motorcycle?
            </button>
          </div>

          <div className="space-y-2 pt-2">
            <label
              htmlFor="existingLoad"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/60"
            >
              Existing Accessory Load (Watts)
            </label>
            <input
              id="existingLoad"
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
            <p className="rounded-lg border border-amber-300 bg-amber-200 p-3 text-sm  text-black/80">
              Note: If you already have auxiliary lights or accessories
              installed, enter their total power consumption.
            </p>
          </div>
          <button
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary py-3 text-base font-black text-background-dark shadow-lg shadow-primary/20 transition-all disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]"
            disabled={!isVehicleConfigured}
            onClick={() => void setState({ checkedUsage: true })}
          >
            Check Usage
            <span className="material-symbols-outlined">bolt</span>
          </button>

          {!isVehicleConfigured && (
            <p className="text-[11px] text-white/50">
              Select make, model, and year to unlock the rest of the tool.
            </p>
          )}
        </div>

        {canRevealResults && (
          <div
            className="glass-card relative overflow-hidden rounded-xl border-l-4 border-l-primary p-6"
            id="your-electrical-capacity"
            ref={electricalCapacityRef}
          >
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <span className="material-symbols-outlined text-8xl">
                analytics
              </span>
            </div>
            <h3 className="mb-4 text-xs font-black tracking-widest text-primary uppercase">
              Your Electrical Capacity
            </h3>
            <div className="grid grid-cols-2 gap-y-6">
              <CapacityCell
                label="Alternator Output"
                value={capacity.alternatorOutput}
                approx={capacity.alternatorOutputApprox}
              />
              <CapacityCell
                label="Stock Load"
                value={capacity.stockLoad}
                approx={capacity.stockLoadApprox}
              />
              <CapacityCell
                label="Safe Margin"
                value={capacity.safeMargin}
                primary
                signed
                approx={capacity.safeMarginApprox}
              />
              <CapacityCell
                label="Recommended Max"
                value={capacity.recommendedMax}
                approx={capacity.recommendedMaxApprox}
              />
            </div>
            <div className="mt-6 border-t border-border-dark pt-4">
              <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase">
                <span>Load Status</span>
                <span
                  className={
                    capacity.loadPercent <= 70
                      ? "text-primary"
                      : "text-orange-400"
                  }
                >
                  {capacity.status}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(capacity.loadPercent)}%` }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                />
              </div>
            </div>
          </div>
        )}
      </section>

      <AnimatePresence>
        {isRequestModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="mx-auto h-full w-full max-w-xl overflow-y-auto rounded-2xl border border-border-dark bg-background-dark"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between border-b border-border-dark px-4 py-4">
                <button
                  className="cursor-pointer rounded-full p-2 text-white/80 hover:bg-white/5"
                  onClick={() => setIsRequestModalOpen(false)}
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h3 className="text-2xl font-black">
                  Can&apos;t Find Your Bike?
                </h3>
                <div className="w-10" />
              </div>

              <div className="space-y-6 p-5">
                <div className="space-y-3 text-center">
                  <div className="flex items-center justify-center gap-4 text-left">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-primary/40 bg-primary/15">
                      <span className="material-symbols-outlined text-5xl text-primary">
                        two_wheeler
                      </span>
                    </div>
                    <h4 className="text-xl font-black leading-tight">
                      We&apos;re constantly adding new models.
                    </h4>
                  </div>
                  <p className="text-sm text-white/65">
                    Our database grows every day with technical specs for new
                    motorcycles. If your model isn&apos;t listed, let us know
                    and we&apos;ll prioritize adding it for you.
                  </p>
                </div>

                <div className="rounded-3xl border border-border-dark bg-surface-dark p-5">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black tracking-[0.14em] text-primary uppercase mb-2 block">
                        Motorcycle Make
                      </label>
                      <input
                        className="w-full rounded-xl border border-border-dark bg-background-dark px-4 py-3 text-white placeholder:text-white/35"
                        placeholder="e.g. Honda, Yamaha, BMW"
                        value={requestMake}
                        onChange={(event) => setRequestMake(event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black tracking-[0.14em] text-primary uppercase mb-2 block">
                        Model Name
                      </label>
                      <input
                        className="w-full rounded-xl border border-border-dark bg-background-dark px-4 py-3 text-white placeholder:text-white/35"
                        placeholder="e.g. Africa Twin, R1, GS 1250"
                        value={requestModel}
                        onChange={(event) =>
                          setRequestModel(event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black tracking-[0.14em] text-primary uppercase mb-2 block">
                        Production Year
                      </label>
                      <input
                        className="w-full rounded-xl border border-border-dark bg-background-dark px-4 py-3 text-white placeholder:text-white/35"
                        placeholder="YYYY"
                        value={requestYear}
                        onChange={(event) => setRequestYear(event.target.value)}
                      />
                    </div>
                    <p className="text-center text-sm italic text-white/50">
                      * Technical requests are usually processed within 24-48
                      hours.
                    </p>
                  </div>
                </div>

                <a
                  href={`https://wa.me/919875646946?text=${requestText}&utm_source=moto_tool`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-4 text-xl font-black text-white text-center shadow-lg shadow-[#25D366]/30"
                >
                  Request Addition via WhatsApp
                </a>
                <button
                  className="mx-auto block cursor-pointer text-lg text-white/60 hover:text-white"
                  onClick={() => setIsRequestModalOpen(false)}
                >
                  ← Back to Capacity Tool
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
