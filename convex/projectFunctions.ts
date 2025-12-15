import { v } from 'convex/values';
import { MutationCtx, QueryCtx } from './_generated/server';
import { getUserId } from './helpers';

export async function createProject(
  ctx: MutationCtx,
  name: string,
  description?: string
) {
  const userId = await getUserId(ctx);
  if (!userId) throw new Error('Unauthorized');

  const now = Date.now();

  return await ctx.db.insert('projects', {
    userId,
    name,
    description,
    files: {
      'README.md': `# ${name}\n\nWelcome to your new project!`,
      'index.html': '<!DOCTYPE html>\n<html>\n<head>\n  <title>My App</title>\n</head>\n<body>\n  <div id="root"></div>\n</body>\n</html>',
      'package.json': JSON.stringify({
        name: name.toLowerCase().replace(/\s+/g, '-'),
        version: '0.1.0',
        scripts: {
          dev: 'vite',
          build: 'tsc && vite build',
        },
      }, null, 2),
    },
    isRunning: false,
    createdAt: now,
    updatedAt: now,
  });
}

export async function getProjects(ctx: QueryCtx) {
  const userId = await getUserId(ctx);
  if (!userId) throw new Error('Unauthorized');

  return await ctx.db
    .query('projects')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .order('desc')
    .collect();
}

export async function getProject(ctx: QueryCtx, projectId: string) {
  const userId = await getUserId(ctx);
  if (!userId) throw new Error('Unauthorized');

  const project = await ctx.db.get(projectId as any);
  if (!project || project.userId !== userId) {
    throw new Error('Project not found');
  }

  return project;
}

export async function updateProject(
  ctx: MutationCtx,
  projectId: string,
  updates: {
    name?: string;
    description?: string;
    files?: Record<string, string>;
    isRunning?: boolean;
    currentFile?: string;
  }
) {
  const userId = await getUserId(ctx);
  if (!userId) throw new Error('Unauthorized');

  const project = await ctx.db.get(projectId as any);
  if (!project || project.userId !== userId) {
    throw new Error('Project not found');
  }

  await ctx.db.patch(projectId, {
    ...updates,
    updatedAt: Date.now(),
  });
}

export async function deleteProject(ctx: MutationCtx, projectId: string) {
  const userId = await getUserId(ctx);
  if (!userId) throw new Error('Unauthorized');

  const project = await ctx.db.get(projectId as any);
  if (!project || project.userId !== userId) {
    throw new Error('Project not found');
  }

  await ctx.db.delete(projectId);
}
