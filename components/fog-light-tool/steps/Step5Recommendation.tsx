import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { AnimatePresence, motion, type Transition } from "framer-motion";
import { toBlob } from "html-to-image";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { rankRidingStyleLights } from "../logic/ridingStyleRecommendations";
import type { FogLight, Step5Props } from "../types";
import { ElectricalCapacityBar } from "../ui";

function withUtmSource(url: string) {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("utm_source", "moto_tool");
    return parsed.toString();
  } catch {
    return url;
  }
}

function toFogLabel(fog: Step5Props["state"]["fogFrequency"]) {
  if (!fog) return "-";
  if (fog === "frequently") return "High (Weekly)";
  if (fog === "occasionally") return "Medium";
  return "Low";
}

function toSpeedLabel(speed: Step5Props["state"]["speed"]) {
  if (!speed) return "-";
  if (speed === "100-140") return "100-140 km/h";
  return `${speed} km/h`;
}

function toTerrainLabel(terrain: Step5Props["state"]["terrain"]) {
  if (!terrain) return "-";
  const map = {
    city: "City / Urban",
    highway: "Highway / Touring",
    mixed: "Mixed / Touring",
    hilly: "Hilly / Curves",
  } as const;
  return map[terrain] ?? "-";
}

function getCruisingSpeed(name: string) {
  const key = name.toLowerCase();
  if (key.includes("x1")) return "Upto 100 km/h";
  if (key.includes("x2")) return "Upto 140 km/h";
  return "-";
}

function computeReportStats({
  state,
  featured,
  capacity,
}: {
  state: Step5Props["state"];
  featured: FogLight;
  capacity: Step5Props["capacity"];
}) {
  const usedWatts = Math.max(0, capacity.stockLoad + state.existingLoad);
  const availableWatts = Math.max(0, Math.floor(capacity.recommendedMax));
  const dangerWatts = Math.max(
    0,
    capacity.alternatorOutput -
      capacity.stockLoad -
      state.existingLoad -
      capacity.recommendedMax,
  );
  const scale = Math.max(
    1,
    capacity.alternatorOutput,
    usedWatts + availableWatts + dangerWatts,
  );
  const usedPct = (usedWatts / scale) * 100;
  const availablePct = (availableWatts / scale) * 100;
  const dangerPct = (dangerWatts / scale) * 100;

  const lightUse = Math.max(0, Math.floor(featured.loadWatts));
  const lightUseInsideAvailable = Math.min(availableWatts, lightUse);
  const lightOverlayPct = (lightUseInsideAvailable / scale) * 100;
  const status =
    lightUse > availableWatts
      ? "Overloaded"
      : lightUse === availableWatts && lightUse > 0
        ? "Near Limit"
        : "Safe";
  const statusColor =
    status === "Overloaded"
      ? "#f87171"
      : status === "Near Limit"
        ? "#fcd34d"
        : "#34d399";
  const safeMargin = Math.max(0, availableWatts - lightUse);

  return {
    availableWatts,
    availablePct,
    dangerPct,
    dangerWatts,
    lightOverlayPct,
    lightUse,
    safeMargin,
    status,
    statusColor,
    usedPct,
    usedWatts,
  };
}

const reportTextStyle = {
  color: "#8ea0b8",
  fontSize: 12,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
};

const HiddenReportCard = forwardRef<
  HTMLDivElement,
  {
    state: Step5Props["state"];
    featured: FogLight;
    capacity: Step5Props["capacity"];
  }
>(function HiddenReportCard({ state, featured, capacity }, ref) {
  const {
    availablePct,
    availableWatts,
    dangerPct,
    dangerWatts,
    lightOverlayPct,
    lightUse,
    safeMargin,
    status,
    statusColor,
    usedPct,
    usedWatts,
  } = computeReportStats({ state, featured, capacity });

  return (
    <div
      ref={ref}
      style={{
        width: 640,
        background: "#07090d",
        color: "#f5f7fb",
        fontFamily: "Arial,sans-serif",
        padding: 20,
        lineHeight: 1.25,
      }}
    >
      <div
        style={{
          border: "1px solid #23262f",
          borderRadius: 18,
          background: "linear-gradient(180deg,#151821,#0d0f15)",
          padding: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: 14,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.16em",
            }}
          >
            Your LuxFit Report Card
          </div>
          <div
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              background: "#072d1b",
              border: "1px solid #0f5e36",
              color: "#20df8f",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.08em",
            }}
          >
            ANALYSIS COMPLETE
          </div>
        </div>
        <div
          style={{
            marginTop: 14,
            border: "1px solid #2a2f3a",
            borderRadius: 14,
            padding: 12,
            background: "#171b24",
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "#8ea0b8",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Motorcycle Summary
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 24 }}>
            <div>
              <div style={{ fontSize: 12, color: "#8ea0b8" }}>Make</div>
              <div style={{ fontSize: 30, fontWeight: 800 }}>
                {state.make || "-"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#8ea0b8" }}>Model</div>
              <div style={{ fontSize: 30, fontWeight: 800 }}>
                {state.model || "-"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#8ea0b8" }}>Year</div>
              <div style={{ fontSize: 30, fontWeight: 800 }}>
                {state.year || "-"}
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: 14,
            border: "1px solid #2a2f3a",
            borderRadius: 14,
            padding: 12,
            background: "#171b24",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "#8ea0b8",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Electrical Health Analysis
            </div>
            <div style={{ fontSize: 24, color: statusColor, fontWeight: 800 }}>
              Status: {status}
            </div>
          </div>
          <div
            style={{
              marginTop: 10,
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            <span>Load Status</span>
          </div>
          <div
            style={{
              marginTop: 8,
              position: "relative",
              height: 16,
              borderRadius: 999,
              background: "rgba(255,255,255,0.1)",
              overflow: "hidden",
            }}
          >
            {usedPct > 0 && (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  height: "100%",
                  width: `${usedPct}%`,
                  background: "rgba(245,158,11,0.75)",
                }}
              />
            )}
            {availablePct > 0 && (
              <div
                style={{
                  position: "absolute",
                  left: `${usedPct}%`,
                  top: 0,
                  height: "100%",
                  width: `${availablePct}%`,
                  background: "#34d399",
                }}
              />
            )}
            {dangerPct > 0 && (
              <div
                style={{
                  position: "absolute",
                  left: `${usedPct + availablePct}%`,
                  top: 0,
                  height: "100%",
                  width: `${dangerPct}%`,
                  background: "#ef4444",
                }}
              />
            )}
            {lightOverlayPct > 0 && (
              <div
                style={{
                  position: "absolute",
                  left: `${usedPct}%`,
                  top: 0,
                  height: "100%",
                  width: `${lightOverlayPct}%`,
                  border: "1px solid rgba(254,240,138,0.9)",
                  background: "rgba(253,224,71,0.95)",
                }}
              />
            )}
          </div>
          <div
            style={{
              marginTop: 8,
              display: "flex",
              gap: 10,
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            <span style={{ color: "#f59e0b" }}>
              Used: {Math.floor(usedWatts)}W
            </span>
            <span style={{ color: "rgba(253,224,71,0.95)" }}>
              {featured?.name || "Featured"} Light Load: {lightUse}W
            </span>
            <span style={{ color: "#34d399" }}>
              Available after light: {Math.floor(availableWatts - lightUse)}W
            </span>
            <span style={{ color: "#ef4444" }}>
              Danger: {Math.floor(dangerWatts)}W
            </span>
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
            <div
              style={{
                flex: 1,
                border: "1px solid #2a2f3a",
                borderRadius: 12,
                padding: 10,
                background: "#141922",
              }}
            >
              <div style={reportTextStyle}>Alternator Output</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>
                {Math.max(0, Math.floor(capacity.alternatorOutput))}W
              </div>
            </div>
            <div
              style={{
                flex: 1,
                border: "1px solid #2a2f3a",
                borderRadius: 12,
                padding: 10,
                background: "#141922",
              }}
            >
              <div style={reportTextStyle}>
                {featured?.name || "Featured"} Light Load
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#facc15" }}>
                {lightUse}W
              </div>
            </div>
            <div
              style={{
                flex: 1,
                border: "1px solid #2a2f3a",
                borderRadius: 12,
                padding: 10,
                background: "#141922",
              }}
            >
              <div style={reportTextStyle}>Safe Margin</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#f9be16" }}>
                {safeMargin}W
              </div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
          <div
            style={{
              flex: 1,
              border: "1px solid #2a2f3a",
              borderRadius: 14,
              padding: 12,
              background: "#171b24",
            }}
          >
            <div style={reportTextStyle}>Fog Frequency</div>
            <div style={{ marginTop: 6, fontSize: 28, fontWeight: 800 }}>
              {toFogLabel(state.fogFrequency)}
            </div>
          </div>
          <div
            style={{
              flex: 1,
              border: "1px solid #2a2f3a",
              borderRadius: 14,
              padding: 12,
              background: "#171b24",
            }}
          >
            <div style={reportTextStyle}>Average Speed</div>
            <div style={{ marginTop: 6, fontSize: 28, fontWeight: 800 }}>
              {toSpeedLabel(state.speed)}
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: 10,
            border: "1px solid #2a2f3a",
            borderRadius: 14,
            padding: 12,
            background: "#171b24",
          }}
        >
          <div style={reportTextStyle}>Terrain Choice</div>
          <div style={{ marginTop: 6, fontSize: 28, fontWeight: 800 }}>
            {toTerrainLabel(state.terrain)}
          </div>
        </div>
        <div
          style={{
            marginTop: 14,
            border: "1px solid #f9be16",
            borderRadius: 14,
            padding: 12,
            background: "#171b24",
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "#8ea0b8",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Recommended Light
          </div>
          <div
            style={{ marginTop: 10, display: "flex", justifyContent: "center" }}
          >
            <img
              src={featured.imageUrl}
              alt={featured.name}
              style={{
                width: 250,
                height: 250,
                objectFit: "contain",
                borderRadius: 14,
              }}
            />
          </div>
          <div
            style={{
              marginTop: 10,
              fontSize: 46,
              fontWeight: 900,
              textAlign: "center",
            }}
          >
            {featured.name}
          </div>
          <div
            style={{
              marginTop: 8,
              textAlign: "center",
              color: "#9aa4b2",
              fontSize: 24,
            }}
          >
            Engineered for {state.make || "your bike"}{" "}
            {state.model || "your bike"} with optimized electrical safety.
          </div>
          <div
            style={{
              marginTop: 12,
              borderTop: "1px solid #2a2f3a",
              paddingTop: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 22,
              }}
            >
              <span style={{ color: "#8ea0b8" }}>Peak Brightness</span>
              <span style={{ fontWeight: 800 }}>{featured.lux}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 22,
                marginTop: 6,
              }}
            >
              <span style={{ color: "#8ea0b8" }}>Power Consumption</span>
              <span style={{ fontWeight: 800 }}>
                {featured.loadWatts}W / Pair
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 22,
                marginTop: 6,
              }}
            >
              <span style={{ color: "#8ea0b8" }}>Weather Rating</span>
              <span style={{ fontWeight: 800 }}>IP68 Certified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default function Step5Recommendation({
  state,
  setState,
  canRevealResults,
  fogLights,
  capacity,
  reportId,
  setReportId,
}: Step5Props) {
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);
  const [activeReportAction, setActiveReportAction] = useState<
    "share" | "whatsapp" | null
  >(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const preloadedImageUrlsRef = useRef<Set<string>>(new Set());
  const saveVisitorReport = useMutation(api.reports.saveVisitorReport);

  const budget = Math.max(0, Math.floor(capacity.recommendedMax));
  const fittingLights = fogLights
    .filter((light) => light.loadWatts <= budget)
    .sort((a, b) => b.rating - a.rating);
  const ridingStyleLights = rankRidingStyleLights(fogLights, {
    terrain: state.terrain,
    speed: state.speed,
    wearsGlasses: state.wearsGlasses,
    leftEye: state.leftEye,
    rightEye: state.rightEye,
  });
  const list =
    state.recommendationMode === "capacity" ? fittingLights : ridingStyleLights;
  const boundedIndex = Math.min(
    Math.max(state.recommendationIndex ?? 0, 0),
    Math.max(list.length - 1, 0),
  );
  const featured = list[boundedIndex] ?? fogLights[0] ?? null;
  const swipeTransition: Transition = {
    type: "spring",
    stiffness: 180,
    damping: 26,
    mass: 0.8,
  };
  // const swipeTransition: Transition = {
  //   type: "tween",
  //   duration: 0.38,
  //   ease: [0.33, 1, 0.68, 1], // smooth deceleration curve
  // };
  const swipeVariants = {
    enter: (direction: 1 | -1) => ({
      x: direction * 24,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: 1 | -1) => ({
      x: direction * -24,
      opacity: 0,
    }),
  };
  const preloadReportImage = useCallback(async (url: string) => {
    if (!url || preloadedImageUrlsRef.current.has(url)) return;

    await new Promise<void>((resolve) => {
      const image = new window.Image();
      let settled = false;
      const settle = () => {
        if (settled) return;
        settled = true;
        resolve();
      };

      image.crossOrigin = "anonymous";
      image.decoding = "async";
      image.onload = settle;
      image.onerror = settle;
      image.src = url;

      if (image.complete) settle();
    });

    preloadedImageUrlsRef.current.add(url);
  }, []);

  useEffect(() => {
    void preloadReportImage(featured?.imageUrl ?? "");
  }, [featured?.imageUrl, preloadReportImage]);

  if (!canRevealResults) {
    return null;
  }
  if (!featured) {
    return (
      <section className="space-y-5 pt-2">
        <h2 className="text-4xl font-black tracking-tight">
          Recommended For You
        </h2>
        <div className="rounded-2xl border border-border-dark bg-surface-dark p-4 text-sm text-white/70">
          No lights available right now. Please try again in a moment.
        </div>
      </section>
    );
  }
  const recommendedLightUrl = withUtmSource(featured.shopUrl);

  const createReportFile = async () => {
    if (!featured) throw new Error("No light available for report.");
    await preloadReportImage(featured.imageUrl);
    const resolvedReportId =
      reportId ||
      String(
        (
          await saveVisitorReport({
            visitorId: state.visitorId,
            html: reportRef.current?.outerHTML ?? "",
            toolState: {
              ...state,
              step: 5,
              recommendationIndex: boundedIndex,
            },
            capacity,
            featuredLight: featured,
          })
        ).id,
      );
    if (!reportId) {
      await setReportId(resolvedReportId);
    }

    const reportNode = reportRef.current;
    if (!reportNode) throw new Error("Report renderer unavailable.");

    const blob = await toBlob(reportNode, {
      pixelRatio: window.devicePixelRatio > 1 ? 1.2 : 1,
      cacheBust: true,
      backgroundColor: "#07090d",
      skipFonts: true,
      type: "image/jpeg",
      quality: 0.92,
    });
    if (!blob) throw new Error("Failed to generate report image.");

    const reportCode =
      resolvedReportId.replace(/[^a-zA-Z0-9_-]/g, "").slice(-12) ||
      `${new Date().getFullYear()}-${state.visitorId.slice(0, 6)}`;
    const reportUrl = new URL(window.location.href);
    reportUrl.searchParams.set("report", resolvedReportId);

    return {
      reportCode,
      file: new File([blob], `luxFit-report-${reportCode}.jpg`, {
        type: "image/jpeg",
      }),
      shareText: `LuxFit report for ${state.make} ${state.model} (${state.year})`,
      reportUrl: reportUrl.toString(),
    };
  };

  const onShareReport = async () => {
    if (activeReportAction) return;
    setActiveReportAction("share");
    try {
      const { file } = await createReportFile();

      if (
        navigator.canShare &&
        navigator.canShare({ files: [file] }) &&
        navigator.share
      ) {
        await navigator.share({
          title: "LuxFit Report",
          text: `Checked my fog light requirement ✅\nThis actually looks legit for my ride 🏍️\nBro, run yours too 👇\n${window.location.hostname}`,
          files: [file],
        });
      } else {
        const fileUrl = URL.createObjectURL(file);
        const anchor = document.createElement("a");
        anchor.href = fileUrl;
        anchor.download = file.name;
        anchor.click();
        URL.revokeObjectURL(fileUrl);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setActiveReportAction(null);
    }
  };

  const onShareWhatsapp = async () => {
    if (activeReportAction) return;
    setActiveReportAction("whatsapp");
    try {
      const { file, shareText, reportUrl } = await createReportFile();
      const whatsappText = `${shareText}\n${reportUrl}`;
      const whatsappUrl = withUtmSource(
        `https://wa.me/919875646946?text=${encodeURIComponent(whatsappText)}`,
      );

      // if (
      //   navigator.canShare &&
      //   navigator.canShare({ files: [file] }) &&
      //   navigator.share
      // ) {
      //   await navigator.share({
      //     title: "LuxFit by Lumevo Report",
      //     text: whatsappText,
      //     files: [file],
      //   });
      // } else {
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      // }
    } catch (error) {
      console.error(error);
    } finally {
      setActiveReportAction(null);
    }
  };

  return (
    <section className="space-y-5 pt-2 pb-20">
      {/* <div className="flex items-center justify-between">
        <p className="text-xs font-black tracking-[0.18em] text-primary uppercase">
          Final Step
        </p>
        <p className="text-sm text-white/70">Step 5 of 5</p>
      </div>
      <div className="h-2 w-full rounded-full bg-border-dark">
        <div className="h-full w-full rounded-full bg-primary" />
      </div> */}

      <h2 className="text-3xl font-black tracking-tight">
        Recommended For You
      </h2>

      <div className="rounded-full bg-surface-dark p-1">
        <div className="grid grid-cols-2 gap-1">
          <button
            className="relative rounded-full px-4 py-2.5 text-sm font-black"
            onClick={() => {
              setSlideDirection(-1);
              void setState({
                recommendationMode: "style",
                recommendationIndex: 0,
              });
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
              className={`relative text-xs z-10 ${state.recommendationMode === "style" ? "text-background-dark" : "text-white/65"}`}
            >
              Based on Riding Style
            </span>
          </button>
          <button
            className="relative rounded-full px-4 py-2.5 text-sm font-black"
            onClick={() => {
              setSlideDirection(1);
              void setState({
                recommendationMode: "capacity",
                recommendationIndex: 0,
              });
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
              className={`relative text-xs z-10 ${state.recommendationMode === "capacity" ? "text-background-dark" : "text-white/65"}`}
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
              <AnimatePresence
                initial={false}
                custom={slideDirection}
                mode="popLayout"
              >
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
                    {state.recommendationMode === "style" &&
                      boundedIndex === 0 && (
                        <div className="absolute top-4 right-4 z-3 rounded-full bg-primary px-3 py-1 text-[10px] font-black text-background-dark uppercase">
                          Best suited for you & your riding style
                        </div>
                      )}
                    <div className="relative h-56 w-full">
                      <img
                        alt={featured.name}
                        className="h-full w-full object-contain"
                        src={featured.imageUrl}
                        width={620}
                        height={340}
                      />
                    </div>
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="space-y-2 flex flex-col">
                      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
                        <span className="material-symbols-outlined text-sm text-emerald-400">
                          verified
                        </span>
                        <span className="text-xs font-bold text-emerald-300">
                          Maintains Cruising Speed:{" "}
                          {getCruisingSpeed(featured.name)}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1">
                        <span className="material-symbols-outlined text-sm text-blue-300">
                          cloud
                        </span>
                        <span className="text-xs font-bold text-blue-300">
                          Better Visibility in Rain & Foggy Conditions
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
                        <span className="material-symbols-outlined text-sm text-emerald-400">
                          brightness_4
                        </span>
                        <span className="text-xs font-bold text-emerald-300">
                          Zero Glare for Oncoming Traffic <br />
                          (100% Real Cutoff)
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1">
                        <span className="material-symbols-outlined text-sm text-blue-300">
                          power
                        </span>
                        <span className="text-xs font-bold  text-blue-300">
                          Most Power Efficient Light <br />
                          (1 Watt = upto 220 Lux Conversion)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 pb-3">
                    <div className="mb-6">
                      <ElectricalCapacityBar
                        alternatorOutput={capacity.alternatorOutput}
                        stockLoad={capacity.stockLoad}
                        existingLoad={state.existingLoad}
                        recommendedWatts={capacity.recommendedMax}
                          lightWatts={featured.loadWatts}
                          lightName={featured.name}
                      />
                    </div>
                  </div>
                  <a
                    href={recommendedLightUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-base font-black text-background-dark shadow-xl shadow-primary/30 transition-all hover:brightness-110 active:scale-95"
                  >
                    Buy Now
                    <span className="material-symbols-outlined">
                      arrow_forward
                    </span>
                  </a>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-black tracking-[0.18em] text-white/55 uppercase">
                Recommended Light {boundedIndex + 1} of {list.length}
              </p>
              <div className="flex items-center gap-2 rounded-2xl bg-surface-dark p-1">
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white/70 disabled:opacity-35"
                  // disabled={boundedIndex === 0}
                  onClick={() => {
                    setSlideDirection(-1);
                    void setState({ recommendationIndex: boundedIndex > 0 ? boundedIndex - 1 : list.length - 1 });
                  }}
                  aria-label="Previous recommendation"
                >
                  <span className="material-symbols-outlined">
                    chevron_left
                  </span>
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
                    <AnimatePresence
                      initial={false}
                      custom={slideDirection}
                      mode="popLayout"
                    >
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
                  // disabled={boundedIndex >= list.length - 1}
                  onClick={() => {
                    setSlideDirection(1);
                    void setState({ recommendationIndex: boundedIndex < list.length - 1 ? boundedIndex + 1 : 0 });
                  }}
                  aria-label="Next recommendation"
                >
                  <span className="material-symbols-outlined">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>

            <div className="overflow-hidden">
              <AnimatePresence
                initial={false}
                custom={slideDirection}
                mode="popLayout"
              >
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
                    <SpecTile
                      icon="wb_sunny"
                      label="Light Intensity"
                      value={featured.lux}
                    />
                    <SpecTile
                      icon="speed"
                      label="Cruising Speed"
                      value={getCruisingSpeed(featured.name)}
                    />
                    <SpecTile
                      icon="thermostat"
                      label="Color Temp"
                      value="3000K/ 6000K"
                    />
                    <SpecTile
                      icon="water_drop"
                      label="Waterproof"
                      value="IP68 Rating"
                    />
                    <SpecTile
                      icon="schedule"
                      label="Lifespan"
                      value="50,000+ Hrs"
                    />
                    <SpecTile
                      icon="construction"
                      label="Housing Material"
                      value="Aviation Alum."
                    />
                    <SpecTile
                      icon="bolt"
                      label="Voltage Range"
                      value="9V - 24V DC"
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-black px-4 pb-4 max-w-xl mx-auto">
              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  onClick={() => void onShareReport()}
                  disabled={activeReportAction !== null}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-sky-500/50 bg-sky-950/40 py-3.5 text-sm font-bold text-sky-300 shadow-lg shadow-sky-500/10 transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-base">
                    ios_share
                  </span>
                  {activeReportAction === "share"
                    ? "Preparing..."
                    : "Share Report"}
                </button>
                <button
                  onClick={() => void onShareWhatsapp()}
                  disabled={activeReportAction !== null}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-500/50 bg-emerald-950/40 py-3.5 text-sm font-bold text-emerald-400 shadow-lg shadow-emerald-500/10 transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 48 48"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g
                      id="Icons"
                      stroke="none"
                      strokeWidth="1"
                      fill="none"
                      fillRule="evenodd"
                    >
                      <g
                        id="Color-"
                        transform="translate(-700.000000, -360.000000)"
                        fill="#67C15E"
                      >
                        <path
                          d="M723.993033,360 C710.762252,360 700,370.765287 700,383.999801 C700,389.248451 701.692661,394.116025 704.570026,398.066947 L701.579605,406.983798 L710.804449,404.035539 C714.598605,406.546975 719.126434,408 724.006967,408 C737.237748,408 748,397.234315 748,384.000199 C748,370.765685 737.237748,360.000398 724.006967,360.000398 L723.993033,360.000398 L723.993033,360 Z M717.29285,372.190836 C716.827488,371.07628 716.474784,371.034071 715.769774,371.005401 C715.529728,370.991464 715.262214,370.977527 714.96564,370.977527 C714.04845,370.977527 713.089462,371.245514 712.511043,371.838033 C711.806033,372.557577 710.056843,374.23638 710.056843,377.679202 C710.056843,381.122023 712.567571,384.451756 712.905944,384.917648 C713.258648,385.382743 717.800808,392.55031 724.853297,395.471492 C730.368379,397.757149 732.00491,397.545307 733.260074,397.27732 C735.093658,396.882308 737.393002,395.527239 737.971421,393.891043 C738.54984,392.25405 738.54984,390.857171 738.380255,390.560912 C738.211068,390.264652 737.745308,390.095816 737.040298,389.742615 C736.335288,389.389811 732.90737,387.696673 732.25849,387.470894 C731.623543,387.231179 731.017259,387.315995 730.537963,387.99333 C729.860819,388.938653 729.198006,389.89831 728.661785,390.476494 C728.238619,390.928051 727.547144,390.984595 726.969123,390.744481 C726.193254,390.420348 724.021298,389.657798 721.340985,387.273388 C719.267356,385.42535 717.856938,383.125756 717.448104,382.434484 C717.038871,381.729275 717.405907,381.319529 717.729948,380.938852 C718.082653,380.501232 718.421026,380.191036 718.77373,379.781688 C719.126434,379.372738 719.323884,379.160897 719.549599,378.681068 C719.789645,378.215575 719.62006,377.735746 719.450874,377.382942 C719.281687,377.030139 717.871269,373.587317 717.29285,372.190836 Z"
                          id="Whatsapp"
                        ></path>
                      </g>
                    </g>
                  </svg>
                  {activeReportAction === "whatsapp"
                    ? "Saving Report"
                    : "Save Report"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="pointer-events-none fixed -top-2499.75 -left-2499.75">
        <HiddenReportCard
          ref={reportRef}
          state={state}
          featured={featured}
          capacity={capacity}
        />
      </div>
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
      <span className="material-symbols-outlined mb-2 text-primary">
        {icon}
      </span>
      <p className="text-xs font-bold uppercase text-white/45">{label}</p>
      <p className="mt-2 text-xl font-black">{value}</p>
    </div>
  );
}
