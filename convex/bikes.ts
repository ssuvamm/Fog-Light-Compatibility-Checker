import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const bikeValidator = v.object({
  make: v.string(),
  models: v.array(
    v.object({
      name: v.string(),
      years: v.array(
        v.object({
          year: v.number(),
          alternatorOutput: v.number(),
          alternatorOutputApprox: v.optional(v.boolean()),
          stockLoad: v.number(),
          stockLoadApprox: v.optional(v.boolean()),
          manualUrl: v.optional(v.string()),
        }),
      ),
    }),
  ),
});

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
