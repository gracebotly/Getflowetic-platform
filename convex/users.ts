// convex/users.ts
// User management with WorkOS authentication integration

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Sync WorkOS user to Convex
 * Called when user first logs in or opens Control Panel
 * Creates new user or updates existing user
 */
export const syncUser = mutation({
  args: {
    workosId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosId", args.workosId))
      .first();

    if (existing) {
      // Update user info if changed
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
      });
      
      return {
        userId: existing._id,
        isNewUser: false,
      };
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      workosId: args.workosId,
      email: args.email,
      name: args.name,
      createdAt: Date.now(),
    });

    // Create default user settings
    await ctx.db.insert("userSettings", {
      userId,
      theme: "system",
      providers: {},
      editor: {
        fontSize: 14,
        tabSize: 2,
        wordWrap: true,
        minimap: true,
      },
      ai: {
        defaultProvider: "anthropic",
        defaultModel: "claude-sonnet-4",
        maxTokens: 8000,
        temperature: 0.7,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return {
      userId,
      isNewUser: true,
    };
  },
});

/**
 * Get user by WorkOS ID
 * Used to retrieve Convex user from WorkOS session
 */
export const getByWorkosId = query({
  args: { workosId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosId", args.workosId))
      .first();
  },
});

/**
 * Get user by email
 * Fallback lookup method
 */
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

/**
 * Get user's settings
 */
export const getSettings = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

/**
 * Update user settings
 */
export const updateSettings = mutation({
  args: {
    userId: v.id("users"),
    settings: v.object({
      theme: v.optional(v.union(v.literal('light'), v.literal('dark'), v.literal('system'))),
      providers: v.optional(v.any()),
      editor: v.optional(v.any()),
      ai: v.optional(v.any()),
    }),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!existing) {
      throw new Error("User settings not found");
    }

    await ctx.db.patch(existing._id, {
      ...args.settings,
      updatedAt: Date.now(),
    });

    return existing._id;
  },
});
