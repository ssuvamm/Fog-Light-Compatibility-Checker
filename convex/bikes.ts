import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const bikeYearValidator = v.object({
  year: v.number(),
  alternatorOutput: v.number(),
  alternatorOutputApprox: v.optional(v.boolean()),
  stockLoad: v.number(),
  stockLoadApprox: v.optional(v.boolean()),
  manualUrl: v.optional(v.string()),
});

const bikeValidator = v.object({
  make: v.string(),
  models: v.array(
    v.object({
      name: v.string(),
      years: v.array(bikeYearValidator),
    }),
  ),
});

function trimRequired(value: string, field: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${field} is required.`);
  }
  return trimmed;
}

function trimOptionalUrl(url?: string) {
  const trimmed = url?.trim();
  return trimmed ? trimmed : undefined;
}

async function requireAuth(ctx: { auth: { getUserIdentity: () => Promise<unknown> } }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated.");
  }
}

export const listBikes = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("bikes").withIndex("by_make").collect();
    return rows.map((row) => ({
      make: row.make,
      models: row.models,
    }));
  },
});

export const listDashboardData = query({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);

    const makes = await ctx.db.query("bikes").withIndex("by_make").collect();
    const rows: Array<{
      makeId: typeof makes[number]["_id"];
      make: string;
      model: string;
      year: number;
      alternatorOutput: number;
      alternatorOutputApprox: boolean;
      stockLoad: number;
      stockLoadApprox: boolean;
      manualUrl?: string;
    }> = [];

    for (const makeDoc of makes) {
      const models = [...makeDoc.models].sort((a, b) => a.name.localeCompare(b.name));
      for (const model of models) {
        const years = [...model.years].sort((a, b) => b.year - a.year);
        for (const yearData of years) {
          rows.push({
            makeId: makeDoc._id,
            make: makeDoc.make,
            model: model.name,
            year: yearData.year,
            alternatorOutput: yearData.alternatorOutput,
            alternatorOutputApprox: !!yearData.alternatorOutputApprox,
            stockLoad: yearData.stockLoad,
            stockLoadApprox: !!yearData.stockLoadApprox,
            manualUrl: yearData.manualUrl,
          });
        }
      }
    }

    return {
      makes: makes.map((makeDoc) => ({
        id: makeDoc._id,
        make: makeDoc.make,
        models: makeDoc.models.map((model) => model.name).sort((a, b) => a.localeCompare(b)),
      })),
      rows,
    };
  },
});

export const createMake = mutation({
  args: {
    make: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const make = trimRequired(args.make, "Make");
    const existing = await ctx.db.query("bikes").collect();
    if (existing.some((row) => row.make.toLowerCase() === make.toLowerCase())) {
      throw new Error("Make already exists.");
    }

    const id = await ctx.db.insert("bikes", { make, models: [] });
    return { id };
  },
});

export const createModel = mutation({
  args: {
    makeId: v.id("bikes"),
    modelName: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const makeDoc = await ctx.db.get(args.makeId);
    if (!makeDoc) {
      throw new Error("Make not found.");
    }

    const modelName = trimRequired(args.modelName, "Model");
    if (
      makeDoc.models.some(
        (model) => model.name.toLowerCase() === modelName.toLowerCase(),
      )
    ) {
      throw new Error("Model already exists for this make.");
    }

    const nextModels = [...makeDoc.models, { name: modelName, years: [] }].sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    await ctx.db.patch(args.makeId, { models: nextModels });
    return { ok: true };
  },
});

export const createYear = mutation({
  args: {
    makeId: v.id("bikes"),
    modelName: v.string(),
    year: v.number(),
    alternatorOutput: v.number(),
    alternatorOutputApprox: v.boolean(),
    stockLoad: v.number(),
    stockLoadApprox: v.boolean(),
    manualUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const makeDoc = await ctx.db.get(args.makeId);
    if (!makeDoc) {
      throw new Error("Make not found.");
    }

    const modelName = trimRequired(args.modelName, "Model");
    const modelIndex = makeDoc.models.findIndex(
      (model) => model.name.toLowerCase() === modelName.toLowerCase(),
    );
    if (modelIndex === -1) {
      throw new Error("Model not found for this make.");
    }

    const nextModels = [...makeDoc.models];
    const model = { ...nextModels[modelIndex], years: [...nextModels[modelIndex].years] };
    if (model.years.some((entry) => entry.year === args.year)) {
      throw new Error("Year already exists for this make and model.");
    }

    model.years.push({
      year: args.year,
      alternatorOutput: args.alternatorOutput,
      alternatorOutputApprox: args.alternatorOutputApprox,
      stockLoad: args.stockLoad,
      stockLoadApprox: args.stockLoadApprox,
      manualUrl: trimOptionalUrl(args.manualUrl),
    });
    model.years.sort((a, b) => b.year - a.year);

    nextModels[modelIndex] = model;
    await ctx.db.patch(args.makeId, { models: nextModels });
    return { ok: true };
  },
});

export const updateYear = mutation({
  args: {
    makeId: v.id("bikes"),
    sourceModelName: v.string(),
    sourceYear: v.number(),
    make: v.string(),
    modelName: v.string(),
    year: v.number(),
    alternatorOutput: v.number(),
    alternatorOutputApprox: v.boolean(),
    stockLoad: v.number(),
    stockLoadApprox: v.boolean(),
    manualUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const makeDoc = await ctx.db.get(args.makeId);
    if (!makeDoc) {
      throw new Error("Make not found.");
    }

    const make = trimRequired(args.make, "Make");
    const modelName = trimRequired(args.modelName, "Model");
    const sourceModelName = trimRequired(args.sourceModelName, "Source model");

    const conflicts = await ctx.db.query("bikes").collect();
    const hasConflictingMake = conflicts.some(
      (row) => row._id !== args.makeId && row.make.toLowerCase() === make.toLowerCase(),
    );
    if (hasConflictingMake) {
      throw new Error("Another make already uses this name.");
    }

    const nextModels = makeDoc.models.map((model) => ({
      ...model,
      years: [...model.years],
    }));

    const sourceModelIndex = nextModels.findIndex(
      (model) => model.name.toLowerCase() === sourceModelName.toLowerCase(),
    );
    if (sourceModelIndex === -1) {
      throw new Error("Source model not found.");
    }

    const sourceModel = nextModels[sourceModelIndex];
    const sourceYearIndex = sourceModel.years.findIndex(
      (entry) => entry.year === args.sourceYear,
    );
    if (sourceYearIndex === -1) {
      throw new Error("Source year not found.");
    }

    sourceModel.years.splice(sourceYearIndex, 1);

    let targetModelIndex = nextModels.findIndex(
      (model) => model.name.toLowerCase() === modelName.toLowerCase(),
    );
    if (targetModelIndex === -1) {
      nextModels.push({ name: modelName, years: [] });
      targetModelIndex = nextModels.length - 1;
    } else {
      nextModels[targetModelIndex] = {
        ...nextModels[targetModelIndex],
        years: [...nextModels[targetModelIndex].years],
      };
    }

    const targetModel = nextModels[targetModelIndex];
    if (targetModel.years.some((entry) => entry.year === args.year)) {
      throw new Error("Target model already has this year.");
    }

    targetModel.years.push({
      year: args.year,
      alternatorOutput: args.alternatorOutput,
      alternatorOutputApprox: args.alternatorOutputApprox,
      stockLoad: args.stockLoad,
      stockLoadApprox: args.stockLoadApprox,
      manualUrl: trimOptionalUrl(args.manualUrl),
    });

    for (const model of nextModels) {
      model.years.sort((a, b) => b.year - a.year);
    }

    const cleanedModels = nextModels
      .filter((model) => model.years.length > 0 || model.name.toLowerCase() !== sourceModelName.toLowerCase())
      .sort((a, b) => a.name.localeCompare(b.name));

    await ctx.db.patch(args.makeId, {
      make,
      models: cleanedModels,
    });

    return { ok: true };
  },
});

export const replaceBikes = mutation({
  args: {
    bikes: v.array(bikeValidator),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("bikes").collect();
    await Promise.all(existing.map((row) => ctx.db.delete(row._id)));
    await Promise.all(args.bikes.map((bike) => ctx.db.insert("bikes", bike)));
    return { inserted: args.bikes.length, deleted: existing.length };
  },
});
