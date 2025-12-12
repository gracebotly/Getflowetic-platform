// convex/clients.ts
// Client management queries and mutations for Getflowetic Control Panel

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// List all clients for a user
export const list = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("clients")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Create new client
export const create = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    email: v.string(),
    subdomain: v.string(),
    industry: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check subdomain availability
    const existing = await ctx.db
      .query("clients")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", args.subdomain))
      .first();

    if (existing) {
      throw new Error("Subdomain already taken");
    }

    // Generate webhook URL
    const webhookUrl = `https://api.getflowetic.com/webhooks/${args.subdomain}`;

    const clientId = await ctx.db.insert("clients", {
      userId: args.userId,
      name: args.name,
      email: args.email,
      subdomain: args.subdomain,
      status: "not-connected",
      dashboardCount: 0,
      activeDashboards: 0,
      magicLinkCount: 0,
      industry: args.industry,
      notes: args.notes,
      webhookUrl,
      createdAt: new Date().toISOString(),
    });

    return clientId;
  },
});

// Get client by ID
export const get = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.clientId);
  },
});
