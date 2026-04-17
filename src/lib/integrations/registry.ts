import type { ProviderDefinition } from "./types";
import { githubProviderDefinition } from "./github";
import { buildMockProviderDefinitions } from "./mock";

const providers: ProviderDefinition<unknown>[] = [
  githubProviderDefinition as unknown as ProviderDefinition<unknown>,
  ...(buildMockProviderDefinitions() as unknown as ProviderDefinition<unknown>[]),
];

export function listProviderDefinitions(): ProviderDefinition<unknown>[] {
  return providers;
}

export function getProviderDefinition(key: string): ProviderDefinition<unknown> | undefined {
  return providers.find((p) => p.key === key);
}
