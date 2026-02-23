import { motion } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useState } from "react";

export function Risk({
  icon,
  color,
  text,
}: {
  icon: string;
  color: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border-dark bg-surface-dark p-3">
      <span className={`material-symbols-outlined ${color}`}>{icon}</span>
      <span className="text-xs font-medium">{text}</span>
    </div>
  );
}

export function PowerNode({
  icon,
  label,
  active = false,
}: {
  icon: string;
  label: string;
  active?: boolean;
}) {
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

export function OptionButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={`rounded-lg border py-3 px-2 text-xs font-bold transition-colors duration-200 ${active ? "border-primary bg-primary/10 text-primary" : "border-border-dark text-white/60"}`}
      whileTap={{ scale: 0.97 }}
      animate={{ scale: active ? 1.02 : 1, y: active ? -1 : 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      {label}
    </motion.button>
  );
}

export function PillButton({
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
    <motion.button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs transition-colors duration-200 ${active ? "border-primary bg-primary font-black text-background-dark" : "border-border-dark font-bold text-white/90"}`}
      whileTap={{ scale: 0.97 }}
      animate={{ scale: active ? 1.02 : 1, y: active ? -1 : 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <span className="material-symbols-outlined text-[16px]">{icon}</span>
      {label}
    </motion.button>
  );
}

export function CapacityCell({
  label,
  value,
  primary,
  signed,
  approx,
}: {
  label: string;
  value: number;
  primary?: boolean;
  signed?: boolean;
  approx?: boolean;
}) {
  const renderedValue = signed ? (value >= 0 ? `+${value}` : value) : value;
  return (
    <div>
      <p className="mb-1 text-[10px] font-bold text-white/40 uppercase">{label}</p>
      <p className={`text-xl font-black ${primary ? "text-primary" : ""}`}>
        {approx ? "~" : ""}
        {renderedValue}{" "}
        <span className="text-sm font-normal text-white/60">Watts</span>
      </p>
    </div>
  );
}

export function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border-dark bg-background-dark p-3 text-center">
      <p className="text-[9px] font-bold text-white/40 uppercase">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}

export function SpecCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[9px] font-bold text-white/40 uppercase">{label}</span>
      <span className="text-xs font-semibold">{value}</span>
    </div>
  );
}

function TooltipContent({ text }: { text: string }) {
  return (
    <Tooltip.Portal>
      <Tooltip.Content
        side="top"
        sideOffset={6}
        className="z-50 rounded-md border border-white/15 bg-background-dark/95 px-2 py-1 text-[10px] font-bold text-white shadow-lg"
      >
        {text}
      </Tooltip.Content>
    </Tooltip.Portal>
  );
}

export function ElectricalCapacityBar({
  alternatorOutput,
  stockLoad,
  existingLoad,
  recommendedWatts,
  lightWatts,
  statusLabel,
  lightName,
}: {
  alternatorOutput: number;
  stockLoad: number;
  existingLoad: number;
  recommendedWatts: number;
  lightWatts?: number;
  statusLabel?: string;
  lightName?: string;
}) {
  const [activeTooltip, setActiveTooltip] = useState<
    "used" | "available" | "danger" | "light" | null
  >(null);
  const usedWatts = Math.max(0, stockLoad + existingLoad);
  const availableWatts = Math.max(0, recommendedWatts);
  const dangerWatts = Math.max(
    15,
    alternatorOutput - stockLoad - existingLoad - recommendedWatts,
  );
  const scale = Math.max(
    1,
    alternatorOutput,
    usedWatts + availableWatts + dangerWatts,
  );

  const usedPct = (usedWatts / scale) * 100;
  const availablePct = (availableWatts / scale) * 100;
  const dangerPct = (dangerWatts / scale) * 100;

  const lightUse = Math.max(0, Math.floor(lightWatts ?? 0));
  const lightUseInsideAvailable = Math.min(availableWatts, lightUse);
  const lightOverlayPct = (lightUseInsideAvailable / scale) * 100;
  const lightStatus =
    lightUse > availableWatts
      ? "Overloaded"
      : lightUse === availableWatts && lightUse > 0
        ? "Near Limit"
        : "Safe";
  const status = statusLabel ?? lightStatus;
  const statusClass = status.toLowerCase().includes("over")
    ? "text-red-400"
    : status.toLowerCase().includes("near")
      ? "text-amber-300"
      : status.toLowerCase().includes("safe")
        ? "text-emerald-400"
        : "text-primary";

  return (
    <Tooltip.Provider delayDuration={100}>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase">
          <span>Load Status</span>
          <span className={statusClass}>{status}</span>
        </div>
        <div className="relative h-3 w-full cursor-pointer overflow-hidden rounded-full bg-white/10">
          {usedPct > 0 && (
            <Tooltip.Root
              open={activeTooltip === "used"}
              onOpenChange={(open) => setActiveTooltip(open ? "used" : null)}
            >
              <Tooltip.Trigger asChild>
                <div
                  className="absolute top-0 left-0 h-full cursor-help rounded-l-full bg-amber-500/70"
                  style={{ width: `${usedPct}%` }}
                  aria-label="Power used details"
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    setActiveTooltip((prev) =>
                      prev === "used" ? null : "used",
                    )
                  }
                />
              </Tooltip.Trigger>
              <TooltipContent
                text={`System + existing load: ${Math.floor(usedWatts)}W`}
              />
            </Tooltip.Root>
          )}
          {availablePct > 0 && (
            <Tooltip.Root
              open={activeTooltip === "available"}
              onOpenChange={(open) =>
                setActiveTooltip(open ? "available" : null)
              }
            >
              <Tooltip.Trigger asChild>
                <div
                  className="absolute top-0 h-full cursor-help bg-emerald-400"
                  style={{ left: `${usedPct}%`, width: `${availablePct}%` }}
                  aria-label="Available power details"
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    setActiveTooltip((prev) =>
                      prev === "available" ? null : "available",
                    )
                  }
                />
              </Tooltip.Trigger>
              <TooltipContent
                text={`Available power: ${Math.floor(availableWatts)}W`}
              />
            </Tooltip.Root>
          )}
          {dangerPct > 0 && (
            <Tooltip.Root
              open={activeTooltip === "danger"}
              onOpenChange={(open) => setActiveTooltip(open ? "danger" : null)}
            >
              <Tooltip.Trigger asChild>
                <div
                  className="absolute top-0 h-full cursor-help rounded-r-full bg-red-500"
                  style={{
                    left: `${usedPct + availablePct}%`,
                    width: `${dangerPct}%`,
                  }}
                  aria-label="Danger zone details"
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    setActiveTooltip((prev) =>
                      prev === "danger" ? null : "danger",
                    )
                  }
                />
              </Tooltip.Trigger>
              <TooltipContent
                text={`Danger zone: ${Math.floor(dangerWatts)}W`}
              />
            </Tooltip.Root>
          )}
          {lightOverlayPct > 0 && (
            <Tooltip.Root
              open={activeTooltip === "light"}
              onOpenChange={(open) => setActiveTooltip(open ? "light" : null)}
            >
              <Tooltip.Trigger asChild>
                <div
                  className="absolute top-0 h-full cursor-help border border-yellow-100/90 bg-yellow-300/95 shadow-[0_0_22px_rgba(250,204,21,0.95)]"
                  style={{ left: `${usedPct}%`, width: `${lightOverlayPct}%` }}
                  aria-label="This light usage details"
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    setActiveTooltip((prev) =>
                      prev === "light" ? null : "light",
                    )
                  }
                />
              </Tooltip.Trigger>
              <TooltipContent text={`${lightName || "This"} light load: ${lightUse}W`} />
            </Tooltip.Root>
          )}
        </div>
      </div>
    </Tooltip.Provider>
  );
}
