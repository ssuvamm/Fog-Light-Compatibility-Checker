import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const fogLightValidator = v.object({
  id: v.string(),
  name: v.string(),
  loadWatts: v.number(),
  lux: v.string(),
  imageUrl: v.string(),
  rating: v.number(),
  shopUrl: v.string(),
});

export const listFogLights = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("fogLights").collect();
    return rows
      .map((row) => ({
        id: row.id,
        name: row.name,
        loadWatts: row.loadWatts,
        lux: row.lux,
        imageUrl: row.imageUrl,
        rating: row.rating,
        shopUrl: row.shopUrl,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const replaceFogLights = mutation({
  args: {
    fogLights: v.array(fogLightValidator),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("fogLights").collect();
    await Promise.all(existing.map((row) => ctx.db.delete(row._id)));
    await Promise.all(
      args.fogLights.map((fogLight) => ctx.db.insert("fogLights", fogLight)),
    );
    return { inserted: args.fogLights.length, deleted: existing.length };
  },
});
