export default function Step2ElectricalEducation() {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs font-black tracking-[0.18em] text-primary uppercase">Lesson</p>
        <h2 className="text-3xl leading-tight font-black tracking-tight">
          How Motorcycle Power <span className="text-primary">Actually</span> Works
        </h2>
        <p className="max-w-md text-base leading-relaxed text-white/70">
          Understanding the flow of energy from your engine to your electronics is key to preventing a dead battery.
        </p>
      </div>

      <div className="rounded-3xl border border-border-dark bg-surface-dark p-5">
        <div className="space-y-6">
          <div className="relative flex gap-4">
            <div className="flex w-14 shrink-0 justify-center">
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary bg-background-dark">
                  <span className="material-symbols-outlined text-2xl text-primary">cyclone</span>
                </div>
                <div className="absolute top-14 left-1/2 h-10 w-0.5 -translate-x-1/2 bg-primary/70"></div>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black">Alternator</h3>
              <p className="text-base text-white/70">Produces raw AC power as the engine spins.</p>
            </div>
          </div>

          <div className="relative flex gap-4">
            <div className="flex w-14 shrink-0 justify-center">
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border-dark bg-background-dark">
                  <span className="material-symbols-outlined text-2xl text-white/70">
                    tune
                  </span>
                </div>
                <div className="absolute top-14 left-1/2 h-10 w-0.5 -translate-x-1/2 bg-border-dark"></div>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black">Regulator / Rectifier</h3>
              <p className="text-base text-white/70">Converts AC to DC and caps voltage at ~14.4V.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="rounded-2xl border border-border-dark bg-background-dark p-4 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/20">
                <span className="material-symbols-outlined text-blue-400">lightbulb</span>
              </div>
              <h4 className="text-2xl font-black">System</h4>
              <p className="text-sm text-white/60">Lights &amp; Ignition</p>
            </div>
            <div className="rounded-2xl border border-primary/40 bg-primary/10 p-4 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                <span className="material-symbols-outlined text-primary">battery_charging_full</span>
              </div>
              <h4 className="text-2xl font-black">Storage</h4>
              <p className="text-sm text-white/60">Battery Reservoir</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-primary p-6 text-background-dark">
        <p className="mb-2 text-xl font-black">Key Takeaway</p>
        <p className="text-sm leading-relaxed">
          The alternator produces power based on RPM. Contrary to popular belief, the <span className="underline">battery only stores charge</span> for starting and buffer.
        </p>
      </div>

      <p className="text-sm italic text-white/60">
        We analyzed real motorcycle electrical data to build this tool for riders.
      </p>
    </section>
  );
}
