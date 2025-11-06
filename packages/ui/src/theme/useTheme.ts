// Re-export implementations from the TSX file to avoid JSX parsing errors in .ts
// Explicitly reference the .tsx implementation to avoid resolving back to this file.
export { KomabiThemeProvider, useKomabiTheme } from './useTheme.tsx';
