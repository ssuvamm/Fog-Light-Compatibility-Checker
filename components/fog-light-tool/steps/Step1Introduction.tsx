import { Risk } from "../ui";

export default function Step1Introduction({
  onPrimaryAction,
}: {
  onPrimaryAction: () => void;
}) {
  return (
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
      <button
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary py-4 text-lg font-black text-background-dark shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
        onClick={onPrimaryAction}
      >
        Check Your Safe Watt Capacity
        <span className="material-symbols-outlined">arrow_downward</span>
      </button>
    </section>
  );
}
