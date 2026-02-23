"use client";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import fogLightsDataset from "@/data_manual/fog_lights_dataset.json";
import { ConvexHttpClient } from "convex/browser";
import { useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { clamp } from "./fog-light-tool/data";
import {
  BIKE_CACHE_MAX_AGE_MS,
  clearStoredToolState,
  readBikeCache,
  readStoredToolState,
  readStoredVisitorId,
  writeBikeCache,
  writeStoredToolState,
  writeStoredVisitorId,
} from "./fog-light-tool/indexed-db";
import Step1Introduction from "./fog-light-tool/steps/Step1Introduction";
import Step2ElectricalEducation from "./fog-light-tool/steps/Step2ElectricalEducation";
import Step3ElectricalCapacity from "./fog-light-tool/steps/Step3ElectricalCapacity";
import Step4RidingPattern from "./fog-light-tool/steps/Step4RidingPattern";
import Step5Recommendation from "./fog-light-tool/steps/Step5Recommendation";
import type { Bike, FogLight, ToolState } from "./fog-light-tool/types";

const DEFAULT_LOCAL_STATE: Omit<ToolState, "make" | "model" | "year"> = {
  step: 1,
  recommendationMode: "style",
  recommendationIndex: 0,
  visitorId: "",
  existingLoad: 0,
  fogFrequency: "",
  speed: "",
  terrain: "",
  wearsGlasses: false,
  leftEye: "",
  rightEye: "",
  beamColor: "amber",
  checkedUsage: false,
};

function clampStep(value: number): 1 | 2 | 3 | 4 | 5 {
  if (value <= 1) return 1;
  if (value >= 5) return 5;
  return value as 1 | 2 | 3 | 4 | 5;
}

function createVisitorId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `visitor-${Date.now()}`;
}

export default function FogLightTool() {
  const [queryState, setQueryState] = useQueryStates(
    {
      make: parseAsString.withDefault(""),
      model: parseAsString.withDefault(""),
      year: parseAsInteger.withDefault(0),
      report: parseAsString.withDefault(""),
    },
    {
      history: "replace",
      shallow: true,
      clearOnDefault: true,
    },
  );
  const [localState, setLocalState] = useState(DEFAULT_LOCAL_STATE);
  const [isLocalStateHydrated, setIsLocalStateHydrated] = useState(false);
  const [bikeSource, setBikeSource] = useState<Bike[]>([]);
  const electricalCapacityRef = useRef<HTMLDivElement>(null);
  const hydratedReportIdRef = useRef<string | null>(null);
  const reportDocument = useQuery(
    api.reports.getReportById,
    queryState.report ? { id: queryState.report as Id<"reports"> } : "skip",
  );

  const typedState = useMemo<ToolState>(
    () => ({
      ...localState,
      make: queryState.make,
      model: queryState.model,
      year: queryState.year,
    }),
    [localState, queryState.make, queryState.model, queryState.year],
  );

  const currentStep = clampStep(typedState.step || 1);
  // const liveFogLights = useQuery(api.fogLights.listFogLights);
  // const fogLightSource = useMemo(() => liveFogLights ?? [], [liveFogLights]);
  const fogLightSource = useMemo(() => fogLightsDataset as FogLight[], []);

  useEffect(() => {
    let isCancelled = false;
    const bootstrapLocalState = async () => {
      try {
        const [storedState, storedVisitorId] = await Promise.all([
          readStoredToolState(),
          readStoredVisitorId(),
        ]);
        const visitorId = storedVisitorId || createVisitorId();
        if (!storedVisitorId) {
          await writeStoredVisitorId(visitorId);
        }
        if (isCancelled) return;
        setLocalState({
          ...DEFAULT_LOCAL_STATE,
          ...storedState,
          visitorId,
          step: clampStep(storedState?.step ?? DEFAULT_LOCAL_STATE.step),
        });
      } catch (error) {
        console.error("Failed to hydrate local tool state.", error);
        if (isCancelled) return;
        const visitorId = createVisitorId();
        setLocalState({ ...DEFAULT_LOCAL_STATE, visitorId });
      } finally {
        if (!isCancelled) {
          setIsLocalStateHydrated(true);
        }
      }
    };
    void bootstrapLocalState();
    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isLocalStateHydrated) return;
    void writeStoredToolState(localState).catch((error) => {
      console.error("Failed to persist local tool state.", error);
    });
  }, [isLocalStateHydrated, localState]);

  useEffect(() => {
    if (!isLocalStateHydrated) return;
    if (!queryState.report) {
      hydratedReportIdRef.current = null;
      return;
    }
    if (reportDocument === undefined) return;
    if (!reportDocument?.toolState) return;
    if (hydratedReportIdRef.current === queryState.report) return;
    hydratedReportIdRef.current = queryState.report;

    const reportState = reportDocument.toolState;
    void setQueryState({
      make: reportState.make,
      model: reportState.model,
      year: reportState.year,
      report: queryState.report,
    });
    setLocalState((previous) => ({
      ...previous,
      step: 5,
      recommendationMode: reportState.recommendationMode,
      recommendationIndex: reportState.recommendationIndex,
      visitorId:
        reportState.visitorId || previous.visitorId || createVisitorId(),
      existingLoad: reportState.existingLoad,
      fogFrequency: reportState.fogFrequency,
      speed: reportState.speed,
      terrain: reportState.terrain,
      wearsGlasses: reportState.wearsGlasses,
      leftEye: reportState.leftEye,
      rightEye: reportState.rightEye,
      beamColor: reportState.beamColor,
      checkedUsage: reportState.checkedUsage,
    }));
  }, [isLocalStateHydrated, queryState.report, reportDocument, setQueryState]);

  useEffect(() => {
    let isCancelled = false;
    const loadBikeData = async () => {
      try {
        const cached = await readBikeCache();
        if (cached?.bikes?.length && !isCancelled) {
          setBikeSource(cached.bikes);
        }

        const isStale =
          !cached || Date.now() - cached.fetchedAt >= BIKE_CACHE_MAX_AGE_MS;
        if (!isStale) return;

        const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
        if (!convexUrl) return;

        const client = new ConvexHttpClient(convexUrl);
        const freshBikes = await client.query(api.bikes.listBikes, {});
        if (isCancelled) return;

        setBikeSource(freshBikes);
        await writeBikeCache({
          fetchedAt: Date.now(),
          bikes: freshBikes,
          version: 0,
        });
      } catch (error) {
        console.error("Failed to load bike cache.", error);
      }
    };
    void loadBikeData();
    return () => {
      isCancelled = true;
    };
  }, []);

  const setState = useCallback(
    async (values: Partial<ToolState> | null) => {
      if (values === null) {
        const visitorId = typedState.visitorId || createVisitorId();
        const resetState = { ...DEFAULT_LOCAL_STATE, visitorId };
        setLocalState(resetState);
        await Promise.all([
          clearStoredToolState(),
          setQueryState({ make: "", model: "", year: 0, report: "" }),
        ]);
        return;
      }

      const queryPatch: Partial<{
        make: string;
        model: string;
        year: number;
      }> = {};
      if (values.make !== undefined) queryPatch.make = values.make;
      if (values.model !== undefined) queryPatch.model = values.model;
      if (values.year !== undefined) queryPatch.year = values.year;

      if (Object.keys(queryPatch).length > 0) {
        await setQueryState(queryPatch);
      }

      setLocalState((prev) => {
        const next = { ...prev };
        if (values.step !== undefined) next.step = clampStep(values.step);
        if (values.recommendationMode !== undefined) {
          next.recommendationMode = values.recommendationMode;
        }
        if (values.recommendationIndex !== undefined) {
          next.recommendationIndex = values.recommendationIndex;
        }
        if (values.visitorId !== undefined) next.visitorId = values.visitorId;
        if (values.existingLoad !== undefined) {
          next.existingLoad = values.existingLoad;
        }
        if (values.fogFrequency !== undefined) {
          next.fogFrequency = values.fogFrequency;
        }
        if (values.speed !== undefined) next.speed = values.speed;
        if (values.terrain !== undefined) next.terrain = values.terrain;
        if (values.wearsGlasses !== undefined) {
          next.wearsGlasses = values.wearsGlasses;
        }
        if (values.leftEye !== undefined) next.leftEye = values.leftEye;
        if (values.rightEye !== undefined) next.rightEye = values.rightEye;
        if (values.beamColor !== undefined) next.beamColor = values.beamColor;
        if (values.checkedUsage !== undefined) {
          next.checkedUsage = values.checkedUsage;
        }
        return next;
      });
    },
    [setQueryState, typedState.visitorId],
  );

  const models = useMemo(
    () =>
      bikeSource.find((bike) => bike.make === typedState.make)?.models ?? [],
    [bikeSource, typedState.make],
  );
  const years = useMemo(
    () => models.find((model) => model.name === typedState.model)?.years ?? [],
    [models, typedState.model],
  );

  const selectedYear = years.find(
    (entry) => entry.year === typedState.year,
  ) ?? {
    alternatorOutput: 510,
    alternatorOutputApprox: false,
    stockLoad: 340,
    stockLoadApprox: false,
  };
  const alternatorOutput = selectedYear.alternatorOutput;
  const alternatorOutputApprox = Boolean(selectedYear.alternatorOutputApprox);
  const stockLoad = selectedYear.stockLoad;
  const stockLoadApprox = Boolean(selectedYear.stockLoadApprox);
  const safeMargin = alternatorOutput - stockLoad - typedState.existingLoad;
  const derivedApprox = alternatorOutputApprox || stockLoadApprox;
  const recommendedMax = Math.max(0, Math.floor(safeMargin * 0.9));
  const loadPercent = clamp(
    ((stockLoad + typedState.existingLoad + Math.min(recommendedMax, 40)) /
      alternatorOutput) *
      100,
    0,
    100,
  );

  const status =
    loadPercent <= 70
      ? "Optimized"
      : loadPercent <= 90
        ? "Near Limit"
        : "Overloaded";
  const isVehicleConfigured = Boolean(
    typedState.make && typedState.model && typedState.year,
  );
  const canRevealResults = typedState.checkedUsage && isVehicleConfigured;

  useEffect(() => {
    if (currentStep < 3 || !canRevealResults) {
      return;
    }
    const id = requestAnimationFrame(() => {
      electricalCapacityRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
    return () => cancelAnimationFrame(id);
  }, [currentStep, canRevealResults]);

  const goToStep = (step: number) => void setState({ step: clampStep(step) });
  const setReportId = useCallback(
    async (reportId: string) => {
      await setQueryState({ report: reportId });
    },
    [setQueryState],
  );
  const isRidingPatternComplete = Boolean(
    typedState.fogFrequency && typedState.speed && typedState.terrain && typedState.wearsGlasses ? (typedState.leftEye && typedState.rightEye) : true,
  );
  const canGoNext =
    currentStep === 3
      ? canRevealResults
      : currentStep === 4
        ? isRidingPatternComplete
        : currentStep < 5;

  return (
    <main className="mx-auto min-h-screen w-full max-w-xl space-y-6 px-4 pt-6 ">
      <header className="relative flex items-center justify-center py-2">
        {currentStep === 5 && (
          <button
            onClick={() => {
              goToStep(4);
            }}
            className="absolute top-1/2 left-0 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl bg-white text-background-dark shadow-lg shadow-white/10 transition-all hover:brightness-110 active:scale-95"
            aria-label="Start over from step 1"
            title="Start over"
          >
            <span className="material-symbols-outlined text-[20px] font-bold">
              chevron_left
            </span>
            <p className="sr-only">Back</p>
          </button>
        )}
        <div className="text-center">
          <div className="relative flex gap-[4px]">
            <img
              src="/LuxFit logo.svg"
              alt="LuxFit by Lumevo Logo"
              width={130}
              height={32}
              className="mx-auto h-6 w-auto"
            />
            {/* <Image
              src="/Lumevo Logos RAW-2.svg"
              alt="Lumevo"
              width={96}
              height={28}
              className="-ml-1 h-5 w-auto mt-2"
              priority
            /> */}
            <span className="absolute right-0 -top-[75%] text-xs text-white/70">
              Beta
            </span>
          </div>
          <p className="text-xs text-white/50">Step {currentStep} of 5</p>
        </div>
        {currentStep === 5 && (
          <button
            onClick={() => {
              void setState(null);
            }}
            className="absolute top-1/2 right-0 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl bg-primary text-background-dark shadow-lg shadow-primary/10 transition-all hover:brightness-110 active:scale-95"
            aria-label="Start over from step 1"
            title="Start over"
          >
            <div className="flex flex-col items-center">
              <span className="material-symbols-outlined text-[20px]">
                restart_alt
              </span>
              <p className="text-xs text-center text-black/80">Redo</p>
            </div>
          </button>
        )}
      </header>

      <AnimatePresence mode="wait" initial={false}>
        <motion.section
          key={currentStep}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="space-y-12"
        >
          {currentStep === 1 && (
            <Step1Introduction onPrimaryAction={() => goToStep(2)} />
          )}
          {currentStep === 2 && <Step2ElectricalEducation />}
          {currentStep === 3 && (
            <Step3ElectricalCapacity
              state={typedState}
              setState={setState}
              bikes={bikeSource}
              models={models}
              years={years}
              isVehicleConfigured={isVehicleConfigured}
              canRevealResults={canRevealResults}
              electricalCapacityRef={electricalCapacityRef}
              capacity={{
                alternatorOutput,
                alternatorOutputApprox,
                stockLoad,
                stockLoadApprox,
                safeMargin,
                safeMarginApprox: derivedApprox,
                recommendedMax,
                recommendedMaxApprox: derivedApprox,
                loadPercent,
                status,
              }}
            />
          )}
          {currentStep === 4 && (
            <Step4RidingPattern
              state={typedState}
              setState={setState}
              canRevealResults={canRevealResults}
            />
          )}
          {currentStep === 5 && (
            <Step5Recommendation
              state={typedState}
              setState={setState}
              canRevealResults={canRevealResults}
              fogLights={fogLightSource}
              remainingWatts={safeMargin}
              capacity={{
                alternatorOutput,
                alternatorOutputApprox,
                stockLoad,
                stockLoadApprox,
                safeMargin,
                safeMarginApprox: derivedApprox,
                recommendedMax,
                recommendedMaxApprox: derivedApprox,
                loadPercent,
                status,
              }}
              reportId={queryState.report}
              setReportId={setReportId}
            />
          )}
        </motion.section>
      </AnimatePresence>

      {currentStep > 1 && currentStep < 5 && (
        <div className="fixed right-0 bottom-1 left-0 ">
          <div className="mx-auto flex w-full max-w-xl items-center gap-3 rounded-2xl p-4 ">
            <button
              className={`flex-1 rounded-xl border border-white/20 bg-background-dark/95 py-2 text-xs shadow-[0_14px_38px_rgba(0,0,0,0.5)] ${currentStep > 1 ? "cursor-pointer text-white" : "cursor-not-allowed text-white/30"}`}
              disabled={currentStep === 1}
              onClick={() => goToStep(currentStep - 1)}
            >
              Back{currentStep === 4 ? ": Edit Capacity" : ""}
            </button>
            <button
              className={`flex-1 rounded-xl border border-primary/50 py-2 text-xs font-black shadow-[0_14px_38px_rgba(0,0,0,0.5)] ${canGoNext ? "cursor-pointer bg-primary text-background-dark" : "cursor-not-allowed bg-primary/30 text-background-dark/60"}`}
              disabled={!canGoNext}
              onClick={() => goToStep(currentStep + 1)}
            >
              Next
              {currentStep === 2
                ? ": Check Capacity"
                : currentStep === 3
                  ? ": Riding Pattern"
                  : ""}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
