import { handlers } from "@/auth";

// Expose Auth.js GET and POST handlers for the [...nextauth] catch-all route.
// Auth.js handles: sign-in, sign-out, callback, CSRF token, and session endpoints.
export const { GET, POST } = handlers;
