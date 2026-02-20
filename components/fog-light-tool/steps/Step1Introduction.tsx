import { Risk } from "../ui";

export default function Step1Introduction({
  onPrimaryAction,
}: {
  onPrimaryAction: () => void;
}) {
  return (
    <section className="relative overflow-hidden pb-4">
      <h1 className="mb-4 text-4xl leading-tight font-black tracking-tight">
        Stop Overloading Your{" "}
        <span className="text-primary italic">Motorcycle.</span>
      </h1>
      <p className="mb-2 text-base font-medium text-white/90">
        Most riders choose fog lights based on watts, not electrical capacity.
      </p>
      <p className="mb-8 border-l-2 border-primary py-1 pl-4 text-sm italic text-white/60">
        Your battery does not generate power. Your alternator does.
      </p>
      <div className="mb-8 grid grid-cols-1 gap-3">
        <Risk
          icon="battery_alert"
          color="text-red-500"
          text="Battery drain during idle"
        />
        <Risk
          icon="thermostat"
          color="text-orange-500"
          text="Regulator overheating"
        />
        <Risk
          icon="error"
          color="text-primary"
          text="Stator damage (Permanent)"
        />
        <Risk icon="bolt" color="text-blue-400" text="Voltage instability" />
      </div>
      <button
        className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary py-4 text-base font-black text-background-dark shadow-lg shadow-primary/20 transition-all active:scale-[0.98]  fixed right-0 bottom-1 left-0 mb-4 mx-2"
        onClick={onPrimaryAction}
      >
        Check Your Safe Watt Capacity
        <span className="material-symbols-outlined">arrow_forward</span>
      </button>
    </section>
  );
}
