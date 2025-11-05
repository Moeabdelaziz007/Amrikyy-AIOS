// Simple MCP resolver mock service
// This module provides a function to resolve a library name to a mock Context7-compatible library doc.

export async function resolveLibraryId(libraryName: string) {
  // In production this would call a real resolver or a registry.
  // For now return a deterministic mock result.
  const id = `/${libraryName.toLowerCase().replace(/[^a-z0-9]/g, '')}/docs`;
  return {
    libraryName,
    context7CompatibleLibraryID: id,
    description: `Mock docs for ${libraryName}`,
    updatedAt: new Date().toISOString(),
    docs: {
      summary: `This is a mocked documentation entry for ${libraryName}.`,
      examples: [
        { title: 'Usage', code: `import { example } from '${libraryName}';` }
      ]
    }
  };
}
