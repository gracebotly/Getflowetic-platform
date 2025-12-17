import { json } from '@remix-run/node';
import { createScopedLogger } from '~/utils/logger';
import { MCPService } from '~/lib/services/mcpService';

function toSerializable(serverTools: any) {
  const out: Record<string, any> = {};
  for (const [name, server] of Object.entries(serverTools)) {
    if ((server as any).status === 'available') {
      const tools = Object.fromEntries(
        Object.entries((server as any).tools).map(([toolName, toolDef]) => {
          const clean: Record<string, unknown> = {};
          for (const [k, v] of Object.entries(toolDef as Record<string, unknown>)) {
            if (typeof v !== 'function') clean[k] = v;
          }
          return [toolName, clean];
        })
      );
      out[name] = {
        status: 'available',
        tools,
        config: (server as any).config,
      };
    } else {
      out[name] = {
        status: 'unavailable',
        error: (server as any).error,
        config: (server as any).config,
      };
    }
  }
  return out;
}

const logger = createScopedLogger('api.mcp-check');

export async function loader() {
  try {
    const mcpService = MCPService.getInstance();
    const serverTools = await mcpService.checkServersAvailabilities();

    return json(toSerializable(serverTools));
  } catch (error) {
    logger.error('Error checking MCP servers:', error);
    return json({ error: 'Failed to check MCP servers' }, { status: 500 });
  }
}
