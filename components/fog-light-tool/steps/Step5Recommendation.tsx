import { AnimatePresence, motion, type Transition } from "framer-motion";
import { useMutation } from "convex/react";
import { toBlob } from "html-to-image";
import Image from "next/image";
import { useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { FogLight, Step5Props } from "../types";

function luxToNumber(lux: string) {
  return Number(lux.replace(/[^0-9]/g, "")) || 0;
}

function withUtmSource(url: string) {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("utm_source", "moto_tool");
    return parsed.toString();
  } catch {
    return url;
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function rankRidingStyleLights(
  lights: FogLight[],
  speed: string,
  terrain: string,
  fog: string,
) {
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
      luxToNumber(a.lux) *
        speedWeight[speed] *
        terrainWeight[terrain] *
        fogWeight[fog] -
      a.loadWatts * 10;
    const bScore =
      luxToNumber(b.lux) *
        speedWeight[speed] *
        terrainWeight[terrain] *
        fogWeight[fog] -
      b.loadWatts * 10;
    return bScore - aScore;
  });
}

function toFogLabel(fog: Step5Props["state"]["fogFrequency"]) {
  if (fog === "frequently") return "High (Weekly)";
  if (fog === "occasionally") return "Medium";
  return "Low";
}

function toSpeedLabel(speed: Step5Props["state"]["speed"]) {
  if (speed === "110+") return "110+ km/h";
  return `${speed} km/h`;
}

function toTerrainLabel(terrain: Step5Props["state"]["terrain"]) {
  const map = {
    city: "City / Urban",
    highway: "Highway / Touring",
    mixed: "Mixed / Touring",
    hilly: "Hilly / Curves",
  } as const;
  return map[terrain];
}

function buildReportHtml({
  reportCode,
  state,
  featured,
  remainingWatts,
}: {
  reportCode: string;
  state: Step5Props["state"];
  featured: FogLight;
  remainingWatts: number;
}) {
  const now = new Date();
  const dateText = now.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  const availableOverhead = Math.max(0, Math.floor(remainingWatts));
  const capacityUtilization = Math.min(
    100,
    Math.max(
      0,
      Math.round((featured.loadWatts / (availableOverhead + featured.loadWatts)) * 100),
    ),
  );
  const safeMargin = Math.max(0, availableOverhead - featured.loadWatts);
  const status = safeMargin > 0 ? "Optimal" : "Near Limit";

  return `
  <div style="width:640px;background:#07090d;color:#f5f7fb;font-family:Arial,sans-serif;padding:20px;line-height:1.25">
    <div style="border:1px solid #23262f;border-radius:18px;background:linear-gradient(180deg,#151821,#0d0f15);padding:18px">
      <div style="font-size:14px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.16em">Your Lumevo Report Card</div>
      <div style="margin-top:8px;font-size:13px;color:#9aa4b2">ID: #${escapeHtml(reportCode)} • ${escapeHtml(dateText)}</div>
      <div style="margin-top:12px;display:inline-block;padding:6px 10px;border-radius:999px;background:#072d1b;border:1px solid #0f5e36;color:#20df8f;font-size:12px;font-weight:700;letter-spacing:0.08em">ANALYSIS COMPLETE</div>
      <div style="margin-top:14px;border:1px solid #2a2f3a;border-radius:14px;padding:12px;background:#171b24">
        <div style="font-size:12px;color:#8ea0b8;letter-spacing:0.12em;text-transform:uppercase">Motorcycle Summary</div>
        <div style="margin-top:10px;display:flex;gap:24px">
          <div><div style="font-size:12px;color:#8ea0b8">Make</div><div style="font-size:30px;font-weight:800">${escapeHtml(state.make || "-")}</div></div>
          <div><div style="font-size:12px;color:#8ea0b8">Model</div><div style="font-size:30px;font-weight:800">${escapeHtml(state.model || "-")}</div></div>
          <div><div style="font-size:12px;color:#8ea0b8">Year</div><div style="font-size:30px;font-weight:800">${state.year || "-"}</div></div>
        </div>
      </div>
      <div style="margin-top:14px;border:1px solid #2a2f3a;border-radius:14px;padding:12px;background:#171b24">
        <div style="display:flex;justify-content:space-between;align-items:flex-end">
          <div style="font-size:12px;color:#8ea0b8;letter-spacing:0.12em;text-transform:uppercase">Electrical Health Analysis</div>
          <div style="font-size:24px;color:#f9be16;font-weight:800">Status: ${escapeHtml(status)}</div>
        </div>
        <div style="margin-top:8px;display:flex;justify-content:space-between">
          <div style="font-size:24px">Capacity Utilization</div>
          <div style="font-size:24px;font-weight:800">${capacityUtilization}% <span style="color:#8ea0b8;font-weight:500">/ 100%</span></div>
        </div>
        <div style="margin-top:8px;height:16px;border-radius:999px;background:#232938;overflow:hidden">
          <div style="height:16px;width:${capacityUtilization}%;background:#f9be16"></div>
        </div>
        <div style="margin-top:4px;display:flex;justify-content:space-between;font-size:12px;color:#f9be16;font-weight:700">
          <span>CURRENT LOAD</span>
          <span>AVAILABLE OVERHEAD (${availableOverhead}W)</span>
        </div>
        <div style="margin-top:12px;display:flex;gap:10px">
          <div style="flex:1;border:1px solid #2a2f3a;border-radius:12px;padding:10px;background:#141922">
            <div style="font-size:12px;color:#8ea0b8;text-transform:uppercase;letter-spacing:0.08em">Alternator Output</div>
            <div style="font-size:28px;font-weight:800">${Math.max(0, availableOverhead + 100)}W</div>
          </div>
          <div style="flex:1;border:1px solid #2a2f3a;border-radius:12px;padding:10px;background:#141922">
            <div style="font-size:12px;color:#8ea0b8;text-transform:uppercase;letter-spacing:0.08em">Safe Margin</div>
            <div style="font-size:28px;font-weight:800;color:#f9be16">${safeMargin}W</div>
          </div>
        </div>
      </div>
      <div style="margin-top:14px;display:flex;gap:10px">
        <div style="flex:1;border:1px solid #2a2f3a;border-radius:14px;padding:12px;background:#171b24">
          <div style="font-size:12px;color:#8ea0b8;text-transform:uppercase;letter-spacing:0.08em">Fog Frequency</div>
          <div style="margin-top:6px;font-size:28px;font-weight:800">${escapeHtml(toFogLabel(state.fogFrequency))}</div>
        </div>
        <div style="flex:1;border:1px solid #2a2f3a;border-radius:14px;padding:12px;background:#171b24">
          <div style="font-size:12px;color:#8ea0b8;text-transform:uppercase;letter-spacing:0.08em">Average Speed</div>
          <div style="margin-top:6px;font-size:28px;font-weight:800">${escapeHtml(toSpeedLabel(state.speed))}</div>
        </div>
      </div>
      <div style="margin-top:10px;border:1px solid #2a2f3a;border-radius:14px;padding:12px;background:#171b24">
        <div style="font-size:12px;color:#8ea0b8;text-transform:uppercase;letter-spacing:0.08em">Terrain Choice</div>
        <div style="margin-top:6px;font-size:28px;font-weight:800">${escapeHtml(toTerrainLabel(state.terrain))}</div>
      </div>
      <div style="margin-top:14px;border:1px solid #f9be16;border-radius:14px;padding:12px;background:#171b24">
        <div style="font-size:12px;color:#8ea0b8;letter-spacing:0.12em;text-transform:uppercase">Recommended Light</div>
        <div style="margin-top:10px;display:flex;justify-content:center">
          <img src="${escapeHtml(featured.imageUrl)}" style="width:250px;height:250px;object-fit:contain;border-radius:14px" />
        </div>
        <div style="margin-top:10px;font-size:46px;font-weight:900;text-align:center">${escapeHtml(featured.name)}</div>
        <div style="margin-top:8px;text-align:center;color:#9aa4b2;font-size:24px">Engineered for ${escapeHtml(state.make || "your bike")} with optimized electrical safety.</div>
        <div style="margin-top:12px;border-top:1px solid #2a2f3a;padding-top:10px">
          <div style="display:flex;justify-content:space-between;font-size:22px"><span style="color:#8ea0b8">Peak Brightness</span><span style="font-weight:800">${escapeHtml(featured.lux)}</span></div>
          <div style="display:flex;justify-content:space-between;font-size:22px;margin-top:6px"><span style="color:#8ea0b8">Power Consumption</span><span style="font-weight:800">${featured.loadWatts}W / Pair</span></div>
          <div style="display:flex;justify-content:space-between;font-size:22px;margin-top:6px"><span style="color:#8ea0b8">Weather Rating</span><span style="font-weight:800">IP68 Certified</span></div>
        </div>
      </div>
    </div>
  </div>`;
}

export default function Step5Recommendation({
  state,
  setState,
  canRevealResults,
  fogLights,
  remainingWatts,
}: Step5Props) {
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);
  const [isSavingReport, setIsSavingReport] = useState(false);
  const reportRenderRef = useRef<HTMLDivElement>(null);
  const saveVisitorReport = useMutation(api.reports.saveVisitorReport);

  if (!canRevealResults) {
    return null;
  }
  if (fogLights.length === 0) {
    return (
      <section className="space-y-5 pt-2">
        <h2 className="text-4xl font-black tracking-tight">Recommended For You</h2>
        <div className="rounded-2xl border border-border-dark bg-surface-dark p-4 text-sm text-white/70">
          No lights available right now. Please try again in a moment.
        </div>
      </section>
    );
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
  const list =
    state.recommendationMode === "capacity" ? fittingLights : ridingStyleLights;
  const boundedIndex = Math.min(
    Math.max(state.recommendationIndex ?? 0, 0),
    Math.max(list.length - 1, 0),
  );
  const featured = list[boundedIndex] ?? fogLights[0];
  const swipeTransition: Transition = {
    type: "spring",
    stiffness: 420,
    damping: 38,
    mass: 0.7,
  };
  const swipeVariants = {
    enter: (direction: 1 | -1) => ({ x: direction * 52, opacity: 1 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: 1 | -1) => ({ x: direction * -52, opacity: 1 }),
  };
  const recommendedLightUrl = withUtmSource(featured.shopUrl);

  const onSaveReport = async () => {
    if (isSavingReport) return;
    setIsSavingReport(true);
    try {
      const reportCode = `${new Date().getFullYear()}-${state.visitorId.slice(0, 6)}`;
      const reportHtml = buildReportHtml({
        reportCode,
        state,
        featured,
        remainingWatts,
      });

      await saveVisitorReport({
        visitorId: state.visitorId,
        html: reportHtml,
      });

      const renderRoot = reportRenderRef.current;
      if (!renderRoot) throw new Error("Report renderer unavailable.");
      renderRoot.innerHTML = reportHtml;
      const node = renderRoot.firstElementChild as HTMLElement | null;
      if (!node) throw new Error("Failed to render report template.");

      const blob = await toBlob(node, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#07090d",
      });
      if (!blob) throw new Error("Failed to generate report image.");

      const file = new File([blob], `lumevo-report-${reportCode}.png`, {
        type: "image/png",
      });
      const shareText = `Lumevo report for ${state.make} ${state.model} (${state.year})`;
      const fallbackWhatsappUrl = withUtmSource(
        `https://wa.me/919875646946?text=${encodeURIComponent(
          `${shareText}\nAttached via Moto Tool.`,
        )}`,
      );

      if (
        navigator.canShare &&
        navigator.canShare({ files: [file] }) &&
        navigator.share
      ) {
        await navigator.share({
          title: "Lumevo Report",
          text: shareText,
          files: [file],
        });
      } else {
        window.open(fallbackWhatsappUrl, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSavingReport(false);
    }
  };

  return (
    <section className="space-y-5 pt-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black tracking-[0.18em] text-primary uppercase">
          Final Step
        </p>
        <p className="text-sm text-white/70">Step 5 of 5</p>
      </div>
      <div className="h-2 w-full rounded-full bg-border-dark">
        <div className="h-full w-full rounded-full bg-primary" />
      </div>

      <h2 className="text-3xl font-black tracking-tight">Recommended For You</h2>

      <div className="rounded-full bg-surface-dark p-1">
        <div className="grid grid-cols-2 gap-1">
          <button
            className="relative rounded-full px-4 py-2.5 text-sm font-black"
            onClick={() => {
              setSlideDirection(-1);
              void setState({ recommendationMode: "style", recommendationIndex: 0 });
            }}
          >
            {state.recommendationMode === "style" && (
              <motion.span
                layoutId="recommendation-mode-pill"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 450, damping: 36 }}
              />
            )}
            <span
              className={`relative z-10 ${state.recommendationMode === "style" ? "text-background-dark" : "text-white/65"}`}
            >
              Based on Riding Style
            </span>
          </button>
          <button
            className="relative rounded-full px-4 py-2.5 text-sm font-black"
            onClick={() => {
              setSlideDirection(1);
              void setState({ recommendationMode: "capacity", recommendationIndex: 0 });
            }}
          >
            {state.recommendationMode === "capacity" && (
              <motion.span
                layoutId="recommendation-mode-pill"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 450, damping: 36 }}
              />
            )}
            <span
              className={`relative z-10 ${state.recommendationMode === "capacity" ? "text-background-dark" : "text-white/65"}`}
            >
              Based on Capacity
            </span>
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {list.length === 0 && state.recommendationMode === "capacity" ? (
          <div className="rounded-2xl border border-border-dark bg-surface-dark p-4 text-sm text-white/70">
            No lights fit the remaining budget ({budget}W).
          </div>
        ) : (
          <>
            <div className="overflow-hidden">
              <AnimatePresence initial={false} custom={slideDirection} mode="popLayout">
                <motion.div
                  key={`top-${state.recommendationMode}-${featured?.id ?? "none"}-${boundedIndex}`}
                  custom={slideDirection}
                  variants={swipeVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={swipeTransition}
                  className="overflow-hidden rounded-3xl border border-border-dark bg-surface-dark"
                >
                  <div className="relative border-b border-border-dark bg-background-dark p-4">
                    <div className="absolute top-4 right-4 z-3 rounded-full bg-primary px-3 py-1 text-[10px] font-black text-background-dark uppercase">
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
                        <h3 className="text-2xl leading-none font-black uppercase">
                          {featured.name}
                        </h3>
                        <p className="mt-2 text-xl text-white/70">
                          Adaptive LED Illumination System
                        </p>
                      </div>
                      <p className="text-right text-2xl leading-none font-black text-primary">
                        {luxToNumber(featured.lux).toLocaleString()}
                        <br />
                        LUX
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
                        <span className="material-symbols-outlined text-sm text-emerald-400">
                          verified
                        </span>
                        <span className="text-xs font-bold text-emerald-300">
                          Electrical Safety Approved
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1">
                        <span className="material-symbols-outlined text-sm text-blue-300">
                          cloud
                        </span>
                        <span className="text-xs font-bold text-blue-300">
                          All-Weather Optimized
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-black tracking-[0.18em] text-white/55 uppercase">
                Recommended Light
              </p>
              <div className="flex items-center gap-2 rounded-2xl bg-surface-dark p-1">
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white/70 disabled:opacity-35"
                  disabled={boundedIndex === 0}
                  onClick={() => {
                    setSlideDirection(-1);
                    void setState({ recommendationIndex: boundedIndex - 1 });
                  }}
                  aria-label="Previous recommendation"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button
                  className="min-w-0 flex-1 rounded-xl px-3 py-2 text-center text-sm font-black text-primary"
                  onClick={() => {
                    setSlideDirection(1);
                    void setState({
                      recommendationIndex:
                        boundedIndex < list.length - 1 ? boundedIndex + 1 : 0,
                    });
                  }}
                  title="Click to cycle recommendations"
                >
                  <span className="relative block overflow-hidden">
                    <AnimatePresence initial={false} custom={slideDirection} mode="popLayout">
                      <motion.span
                        key={`label-${state.recommendationMode}-${featured?.id ?? "none"}-${boundedIndex}`}
                        custom={slideDirection}
                        variants={swipeVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={swipeTransition}
                        className="block truncate"
                      >
                        {featured.name} ({featured.loadWatts}W)
                      </motion.span>
                    </AnimatePresence>
                  </span>
                </button>
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white/70 disabled:opacity-35"
                  disabled={boundedIndex >= list.length - 1}
                  onClick={() => {
                    setSlideDirection(1);
                    void setState({ recommendationIndex: boundedIndex + 1 });
                  }}
                  aria-label="Next recommendation"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>

            <div className="overflow-hidden">
              <AnimatePresence initial={false} custom={slideDirection} mode="popLayout">
                <motion.div
                  key={`spec-${state.recommendationMode}-${featured?.id ?? "none"}-${boundedIndex}`}
                  custom={slideDirection}
                  variants={swipeVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={swipeTransition}
                  className="space-y-3 rounded-2xl border border-border-dark bg-surface-dark p-4"
                >
                  <p className="text-[10px] font-black tracking-[0.18em] text-white/55 uppercase">
                    Technical Specifications
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <SpecTile icon="wb_sunny" label="Light Intensity" value={featured.lux} />
                    <SpecTile icon="thermostat" label="Color Temp" value="3000K/ 6000K" />
                    <SpecTile icon="water_drop" label="Waterproof" value="IP68 Rating" />
                    <SpecTile icon="schedule" label="Lifespan" value="50,000+ Hrs" />
                    <SpecTile icon="construction" label="Housing Material" value="Aviation Alum." />
                    <SpecTile icon="bolt" label="Voltage Range" value="9V - 24V DC" />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="space-y-3 border-t border-border-dark pt-4">
              <a
                href={recommendedLightUrl}
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-xl font-black text-background-dark shadow-xl shadow-primary/30 transition-all hover:brightness-110 active:scale-95"
              >
                Buy Now
                <span className="material-symbols-outlined">arrow_forward</span>
              </a>
              <button
                onClick={() => void onSaveReport()}
                disabled={isSavingReport}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-500/50 bg-emerald-950/40 py-3.5 text-xl font-bold text-emerald-400 shadow-lg shadow-emerald-500/10 transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSavingReport ? "Generating Report..." : "Save My Report"}
              </button>
            </div>
          </>
        )}
      </div>
      <div ref={reportRenderRef} className="pointer-events-none fixed -top-[9999px] -left-[9999px]" />
    </section>
  );
}

function SpecTile({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border-dark bg-surface-dark p-3.5">
      <span className="material-symbols-outlined mb-2 text-primary">{icon}</span>
      <p className="text-xs font-bold uppercase text-white/45">{label}</p>
      <p className="mt-2 text-xl font-black">{value}</p>
    </div>
  );
}
