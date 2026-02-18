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
      <span className="text-sm font-medium">{text}</span>
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
