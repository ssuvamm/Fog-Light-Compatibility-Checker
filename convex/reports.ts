import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const saveVisitorReport = mutation({
  args: {
    visitorId: v.string(),
    html: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("reports", {
      visitorId: args.visitorId,
      html: args.html,
      createdAt: Date.now(),
    });
    return { id };
  },
});
