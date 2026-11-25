import 'vitest';

declare module 'vitest' {
  export interface ProvidedContext {
    /** URI MongoDB v pamäti (globalSetup integračných testov) */
    mongoUri: string;
  }
}
