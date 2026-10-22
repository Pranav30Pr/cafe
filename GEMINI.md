# Meeva Greens — Antigravity Agent Rules

## Governing Documents
Before designing, modifying, or implementing any features, the agent MUST review and adhere to the architectural decisions established in the following documents:
- [CAFE.md](file:///c:/Users/avani/OneDrive/Desktop/cafe/docs/CAFE.md): Cafe operational configuration, table mapping, hours, and seed catalog.
- [SPEC.md](file:///c:/Users/avani/OneDrive/Desktop/cafe/docs/SPEC.md): Functional specification, order lifecycle state machine, and feature boundaries.
- [ARCHITECTURE.md](file:///c:/Users/avani/OneDrive/Desktop/cafe/docs/ARCHITECTURE.md): Technical stack, directory layout, database schema, and server-side pricing rules.
- [DESIGN.md](file:///c:/Users/avani/OneDrive/Desktop/cafe/docs/DESIGN.md): Botanical aesthetic, design tokens, color palette, and mobile-first app shell standards.

## Core Directives
1. **Phased Execution**: Execute strictly one phase per instruction. Do not jump ahead into subsequent phases.
2. **Server-Side Pricing**: Never trust line-item totals or item prices sent from the client. All calculations occur server-side in `lib/pricing.ts`.
3. **Fiscal Configuration**: Maintain tax as a decoupled setting (default 0% GST until owner's CA confirms GSTIN).
4. **Table Sessions**: Dine-in orders are anchored to a singular active `table_session` with customer contact capture.
5. **Aesthetics & Performance**: Avoid generic templates. Adhere strictly to the botanical palette (`#1B382B`, `#4E7A63`, `#C4623F`, `#FBF9F4`) and native-app mobile UX.
