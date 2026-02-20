import { motion } from "framer-motion";

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

export function LoadStatusBar({
  availableWatts,
  usageWatts,
}: {
  availableWatts: number;
  usageWatts: number;
}) {
  const available = Math.max(0, Math.floor(availableWatts));
  const usage = Math.max(0, Math.floor(usageWatts));
  const usageInAvailablePct =
    available > 0 ? Math.min(100, (usage / available) * 100) : usage > 0 ? 100 : 0;
  const overloadPct =
    available > 0
      ? Math.max(0, Math.min(100, ((usage - available) / available) * 100))
      : usage > 0
        ? 100
        : 0;
  const status =
    usage > available ? "Overloaded" : usage === available ? "Near Limit" : "Safe";
  const statusClass =
    status === "Overloaded"
      ? "text-red-400"
      : status === "Near Limit"
        ? "text-amber-300"
        : "text-emerald-400";

  return (
    <div className="space-y-2 rounded-xl border border-border-dark bg-background-dark/70 p-3">
      <div className="flex items-center justify-between text-[10px] font-bold uppercase">
        <span>Load Status</span>
        <span className={statusClass}>{status}</span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="absolute inset-0 bg-emerald-400"
          title={`Available power: ${available}W`}
        />
        {overloadPct > 0 && (
          <div
            className="absolute top-0 right-0 h-full bg-red-500"
            style={{ width: `${overloadPct}%` }}
            title={`Excess over available: ${Math.max(0, usage - available)}W`}
          />
        )}
        <div
          className="absolute top-0 left-0 h-full bg-primary shadow-[0_0_12px_rgba(249,190,22,0.7)]"
          style={{ width: `${usageInAvailablePct}%` }}
          title={`This light usage: ${usage}W`}
        />
      </div>
      <div className="flex items-center justify-between text-[10px] font-bold text-white/65 uppercase">
        <span>Available: {available}W</span>
        <span>This light: {usage}W</span>
      </div>
    </div>
  );
}
