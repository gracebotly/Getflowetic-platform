// Environment variable types for Cloudflare and standard environments
declare global {
  interface Env {
    // GitHub Bug Report
    GITHUB_BUG_REPORT_TOKEN?: string;
    BUG_REPORT_REPO?: string;
    
    // AI Provider Keys
    OPENAI_API_KEY?: string;
    ANTHROPIC_API_KEY?: string;
    GROQ_API_KEY?: string;
    
    // Add other environment variables your app uses
    [key: string]: string | undefined;
  }
  
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}

// Cloudflare context type
export interface CloudflareContext {
  cloudflare?: {
    env?: Env;
    cf?: any;
    ctx?: any;
  };
}

export {};