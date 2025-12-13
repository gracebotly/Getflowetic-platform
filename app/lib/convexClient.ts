
import { ConvexReactClient } from 'convex/react';

// Read Convex URL from environment
const convexUrl = import.meta.env.VITE_CONVEX_URL || 'http://localhost:3210';

// Create and export the Convex client
export const convex = new ConvexReactClient(convexUrl);
