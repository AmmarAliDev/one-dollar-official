# Features Layer

Use `src/features` for domain-specific modules such as catalog, cart, checkout, and admin tools.

## Convention
- Keep UI, validation, and service helpers close to the feature that owns them.
- Export only stable public APIs from each feature folder.
- Avoid cross-feature imports unless routed through shared contracts in `src/lib`, `src/config`, or `src/types`.
