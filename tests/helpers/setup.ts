/**
 * Global vitest setup file.
 *
 * Extends `expect` with @testing-library/jest-dom matchers so that all tests
 * can use `.toBeInTheDocument()`, `.toHaveTextContent()`, etc. without manual
 * imports.
 *
 * Runs before every test file via `vitest.config.ts → test.setupFiles`.
 */
import "@testing-library/jest-dom/vitest";
