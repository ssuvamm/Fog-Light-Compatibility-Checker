"use client";

import { api } from "@/convex/_generated/api";
import fogLightsDataset from "@/data_manual/fog_lights_dataset.json";
import { ConvexHttpClient } from "convex/browser";
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

const STEP_TITLES: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "Moto Light",
  2: "Electrical Basics",
  3: "Capacity Setup",
  4: "Riding Pattern",
  5: "Recommendation",
};

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
          setQueryState({ make: "", model: "", year: 0 }),
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
  const isRidingPatternComplete = Boolean(
    typedState.fogFrequency && typedState.speed && typedState.terrain,
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
        <div className="text-center">
          <p className="text-lg font-bold">{STEP_TITLES[currentStep]}</p>
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
            <span className="material-symbols-outlined text-[20px]">
              restart_alt
            </span>
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
