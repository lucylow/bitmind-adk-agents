// src/tool-registry.ts
export type ToolRisk = "LOW" | "MEDIUM" | "HIGH";

export type ToolMeta = {
  name: string;
  risk: ToolRisk;
  description?: string;
  version?: string;
};

const registry = new Map<string, ToolMeta>();

export function registerTool(meta: ToolMeta) {
  registry.set(meta.name, meta);
}

export function getToolMeta(name: string): ToolMeta | undefined {
  return registry.get(name);
}

export function listTools(): ToolMeta[] {
  return Array.from(registry.values());
}

