// convex/schema.ts
// Complete schema for bolt-chef + Getflowetic integration
// Safe migration: Keeps all vibe coder tables, adds Getflowetic tables

import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // ========================================
  // AUTHENTICATION & USER MANAGEMENT
  // ========================================
  
  users: defineTable({
    email: v.string(),
    name: v.string(),
    workosId: v.string(),              // ✨ NEW: Links to WorkOS user ID
    createdAt: v.number(),
  })
    .index('by_email', ['email'])
    .index('by_workos_id', ['workosId']) // ✨ NEW: Query by WorkOS ID
    .index('by_createdAt', ['createdAt']),

  userSettings: defineTable({
    userId: v.id('users'),
    theme: v.union(v.literal('light'), v.literal('dark'), v.literal('system')),
    providers: v.record(v.string(), v.object({
      apiKey: v.optional(v.string()),
      enabled: v.boolean(),
      models: v.object({
        default: v.string(),
        available: v.array(v.string()),
      }),
    })),
    editor: v.object({
      fontSize: v.number(),
      tabSize: v.number(),
      wordWrap: v.boolean(),
      minimap: v.boolean(),
    }),
    ai: v.object({
      defaultProvider: v.string(),
      defaultModel: v.string(),
      maxTokens: v.number(),
      temperature: v.number(),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user', ['userId']),

  // ========================================
  // BOLT-CHEF TABLES (Vibe Coder - DO NOT MODIFY)
  // ========================================
  
  projects: defineTable({
    userId: v.id('users'),
    name: v.string(),
    description: v.optional(v.string()),
    files: v.record(v.string(), v.string()),  // fileName → fileContent
    isRunning: v.boolean(),
    currentFile: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_user_createdAt', ['userId', 'createdAt']),

  chats: defineTable({
    projectId: v.id('projects'),
    title: v.string(),
    provider: v.string(),
    model: v.string(),
    messages: v.array(v.object({
      role: v.union(v.literal('user'), v.literal('assistant'), v.literal('system')),
      content: v.string(),
      timestamp: v.number(),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_project', ['projectId'])
    .index('by_project_updatedAt', ['projectId', 'updatedAt']),

  fileLocks: defineTable({
    projectId: v.id('projects'),
    filePath: v.string(),
    userId: v.id('users'),
    userName: v.string(),
    timestamp: v.number(),
  })
    .index('by_project', ['projectId'])
    .index('by_file', ['projectId', 'filePath']),

  // ========================================
  // GETFLOWETIC TABLES (Control Panel)
  // ========================================

  // CLIENTS - Agency's customers (e.g., "ABC Dental")
  clients: defineTable({
    userId: v.id('users'),               // Owner (agency from WorkOS)
    name: v.string(),                    // "ABC Dental"
    email: v.string(),                   // "contact@abcdental.com"
    subdomain: v.string(),               // "abc-dental" (unique)
    status: v.union(
      v.literal('connected'),
      v.literal('not-connected'),
      v.literal('schema-changed'),
      v.literal('error')
    ),
    statusMessage: v.optional(v.string()),
    lastConnected: v.optional(v.string()),
    dashboardCount: v.number(),          // Derived count for UI
    activeDashboards: v.number(),        // Derived count for UI
    magicLinkCount: v.number(),          // Derived count for UI
    industry: v.optional(v.string()),    // "Healthcare", "Real Estate", etc.
    notes: v.optional(v.string()),
    connectionType: v.optional(v.string()), // "Vapi", "Retell", "Webhook"
    webhookUrl: v.optional(v.string()),  // Generated webhook URL
    totalRecords: v.optional(v.number()),
    createdAt: v.string(),               // ISO timestamp
  })
    .index('by_user', ['userId'])
    .index('by_subdomain', ['subdomain']),

  // MAGIC LINKS - Passwordless access for end clients
  magicLinks: defineTable({
    clientId: v.id('clients'),
    label: v.optional(v.string()),       // "Main Dashboard Access"
    url: v.string(),                     // Full URL with token
    created: v.string(),                 // ISO timestamp
    expires: v.optional(v.string()),     // ISO timestamp or null (never expires)
    lastUsed: v.optional(v.string()),    // ISO timestamp
    usageCount: v.number(),
    isRevoked: v.optional(v.boolean()),
  })
    .index('by_client', ['clientId'])
    .index('by_url', ['url']),           // Quick token lookup

  // DATA CONNECTIONS - Webhook & API integrations
  dataConnections: defineTable({
    clientId: v.id('clients'),
    name: v.optional(v.string()),        // "Main Vapi Connection"
    type: v.union(
      v.literal('webhook'),              // Universal webhook
      v.literal('vapi'),                 // Native Vapi API
      v.literal('retell'),               // Native Retell API
      v.literal('voiceflow')             // Native Voiceflow API
    ),
    
    // For webhook connections
    webhookUrl: v.string(),              // Generated unique URL
    webhookSecret: v.optional(v.string()),
    
    // For native API connections
    apiKey: v.optional(v.string()),      // Encrypted API key
    platform: v.optional(v.string()),    // Platform name
    apiEndpoint: v.optional(v.string()), // API base URL
    
    // Connection status
    status: v.union(
      v.literal('active'),
      v.literal('inactive'),
      v.literal('error')
    ),
    lastDataReceived: v.optional(v.string()),
    totalRecords: v.number(),
    createdAt: v.string(),
    
    // Auto-detected schema
    schema: v.optional(v.object({
      version: v.string(),
      fields: v.array(v.object({
        name: v.string(),
        type: v.string(),
        description: v.optional(v.string()),
      })),
      lastUpdated: v.string(),
    })),
    
    // Health metrics
    health: v.optional(v.object({
      webhooksReceived24h: v.number(),
      successRate: v.number(),
      failedCount: v.number(),
    })),
  })
    .index('by_client', ['clientId'])
    .index('by_webhook_url', ['webhookUrl']),

  // DASHBOARDS - Generated and deployed dashboards
  dashboards: defineTable({
    clientId: v.id('clients'),
    name: v.string(),                    // "Call Analytics Dashboard"
    template: v.string(),                // Template ID/name used
    url: v.optional(v.string()),         // Deployed URL
    status: v.union(
      v.literal('deployed'),
      v.literal('draft'),
      v.literal('needs-update'),         // Schema changed
      v.literal('error'),
      v.literal('paused'),
      v.literal('archived')
    ),
    createdAt: v.string(),
    lastUpdated: v.string(),
    message: v.optional(v.string()),     // Status message
    code: v.optional(v.string()),        // Generated React code
  })
    .index('by_client', ['clientId'])
    .index('by_status', ['status']),

  // WEBHOOK LOGS - Debugging and monitoring
  webhookLogs: defineTable({
    clientId: v.id('clients'),
    dataConnectionId: v.id('dataConnections'),
    payload: v.any(),                    // Raw webhook payload
    processed: v.boolean(),
    status: v.union(
      v.literal('success'),
      v.literal('error')
    ),
    errorMessage: v.optional(v.string()),
    timestamp: v.string(),
  })
    .index('by_client', ['clientId'])
    .index('by_connection', ['dataConnectionId'])
    .index('by_timestamp', ['timestamp']),

  // WHITE LABEL SETTINGS - Agency branding
  whiteLabelSettings: defineTable({
    userId: v.id('users'),               // Per agency
    logoUrl: v.optional(v.string()),     // Uploaded logo URL
    primaryColor: v.optional(v.string()), // Hex color #6366f1
    secondaryColor: v.optional(v.string()),
    footerText: v.optional(v.string()),  // Custom footer
    customDomain: v.optional(v.string()), // Business plan feature
    updatedAt: v.string(),
  })
    .index('by_user', ['userId']),

  // DASHBOARD TEMPLATES - Your 14 pre-built templates
  dashboardTemplates: defineTable({
    name: v.string(),                    // "Voice AI Call Analytics"
    category: v.string(),                // "Voice AI Analytics"
    description: v.string(),
    thumbnail: v.optional(v.string()),   // Preview image URL
    requiredFields: v.array(v.object({
      name: v.string(),                  // "call_identifier"
      alternatives: v.array(v.string()), // ["call_id", "id", "callId"]
      type: v.string(),                  // "string", "number"
      required: v.boolean(),
    })),
    code: v.string(),                    // Template React code
    previewUrl: v.optional(v.string()),
    usageCount: v.number(),              // Track popularity
    isActive: v.boolean(),               // Enable/disable templates
    createdAt: v.string(),
  })
    .index('by_category', ['category'])
    .index('by_usage', ['usageCount']),

  // INTERACTIONS - Processed webhook data (calls, chats, events)
  interactions: defineTable({
    clientId: v.id('clients'),
    dataConnectionId: v.id('dataConnections'),
    rawData: v.any(),                    // Original payload
    normalized: v.object({
      interactionId: v.string(),
      type: v.string(),                  // "call", "chat", "workflow"
      timestamp: v.number(),
      duration: v.optional(v.number()),
      status: v.string(),
      cost: v.optional(v.number()),
      metadata: v.any(),
    }),
    searchableText: v.optional(v.string()), // For search/filtering
    receivedAt: v.number(),
  })
    .index('by_client', ['clientId'])
    .index('by_connection', ['dataConnectionId'])
    .index('by_timestamp', ['normalized.timestamp']),
});
