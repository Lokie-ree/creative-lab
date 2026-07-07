# Module copy locations (Creative Lab)

Use this list to find existing patterns before adding new strings.

| Module | Primary copy file |
|--------|-------------------|
| Sinewaves | `src/components/modules/sinewaves/sinewaves-copy.ts` |
| Rigid motions | `src/components/modules/rigid-motions/rigid-motions-copy.ts` |
| Vector transforms | `src/components/modules/vector-transforms/vector-transforms-copy.ts` |
| Dilations | `src/components/modules/dilations/dilations-copy.ts` |
| Pythagorean theorem | `src/components/modules/pythagorean-theorem/pythagorean-copy.ts` |

The two geometry modules (dilations, pythagorean-theorem) are the best voice references for new predict-and-reveal modules.

**Shared UI**

- `src/components/feedback/FeedbackBanner.tsx` — progressive / inline feedback
- `src/components/celebration/DiscoveryTab.tsx` — celebration discovery framing (“You built:” / stats / earned formulas)
- `src/components/celebration/BehindThisTab.tsx` — celebration “Behind this” design decisions. Every completed module needs a branch in **both** tabs; copy belongs in the module’s `-copy.ts`, imported by the tab (see rigid-motions), not inline JSX.

**Discovery-first context**

- `docs/philosophy.md` — pedagogy principles
- `docs/product.md` — product stance and validation

**Search**

- `rg "PROMPT_TEXT|Feedback|stage" src/components/modules/<module>/` — common copy export names vary by module; search the module folder for `*copy*.ts` first.
