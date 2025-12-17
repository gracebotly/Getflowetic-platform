import { type ActionFunctionArgs } from '@remix-run/node';
import { createScopedLogger } from '~/utils/logger';
import { MCPService, type MCPConfig } from '~/lib/services/mcpService';

function toSerializable(serverTools: any) {
  const out: Record<string, any> = {};
  for (const [name, server] of Object.entries(serverTools)) {
    if ((server as any).status === 'available') {
      // Remove functions (like execute) and any non-serializable parts
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

const logger = createScopedLogger('api.mcp-update-config');

export async function action({ request }: ActionFunctionArgs) {
  try {
    const mcpConfig = (await request.json()) as MCPConfig;

    if (!mcpConfig || typeof mcpConfig !== 'object') {
      return Response.json({ error: 'Invalid MCP servers configuration' }, { status: 400 });
    }

    const mcpService = MCPService.getInstance();
    const serverTools = await mcpService.updateConfig(mcpConfig);

    return Response.json(toSerializable(serverTools));
  } catch (error) {
    logger.error('Error updating MCP config:', error);
    return Response.json({ error: 'Failed to update MCP config' }, { status: 500 });
  }
}
