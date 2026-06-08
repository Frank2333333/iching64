# Vitest Unit Tests Design

Date: 2026-06-08

## Goal

Introduce a formal unit test baseline for the current `codex` branch using Vitest.
This first phase focuses on fast regression tests for pure logic and data invariants.
It does not add React DOM tests, browser automation, or end-to-end tests.

## Scope

Add Vitest as the test runner and expose two npm scripts:

- `npm test`: run tests once with `vitest run`
- `npm run test:watch`: run Vitest in watch mode

Create two test files:

- `src/pages/divinationValidation.test.ts`
- `src/data/guaxiang.test.ts`

Remove the existing ad hoc script `scripts/divination-validation.test.mjs` after its assertions are migrated into Vitest.

## Test Coverage

### Divination Validation

`src/pages/divinationValidation.test.ts` will cover:

- `isThreeDigitNumberInput`
  - valid inputs: `000`, `001`, `099`, `100`, `999`
  - invalid inputs: empty string, `0`, `00`, `1000`, `-001`, `12.3`, `abc`, leading space, trailing space
- `formatThreeDigitNumber`
  - `0 -> 000`
  - `1 -> 001`
  - `99 -> 099`
  - `999 -> 999`

### Hexagram Data Invariants

`src/data/guaxiang.test.ts` will cover:

- `liuShiSiGua` contains exactly 64 entries
- every hexagram id is unique
- ids cover the full range from 1 through 64
- each hexagram has exactly 6 lines
- each line position is 1 through 6 in order
- each line `yinYang` value is either `yin` or `yang`
- `duiGua`, `zongGua`, and `huGua` reference existing hexagram ids
- every id in `guaBian` references an existing hexagram id
- `getGuaById` returns a known hexagram for a valid id and `undefined` for a missing id
- `getGuaByName` returns a known hexagram for a valid name and `undefined` for a missing name

## Non-Goals

This phase will not:

- add React Testing Library
- add jsdom
- test rendered UI text
- test alerts, animations, routing, or browser behavior
- change business logic unless an existing bug is exposed by the tests
- fix unrelated ESLint errors

## Rationale

The current branch has a small ad hoc Node script for divination input validation but no formal `npm test` entry point.
Vitest fits the Vite and TypeScript stack, keeps the first test layer lightweight, and gives the project a clean place to expand later.

The first tests intentionally target pure functions and static data because they are stable, fast, and high value for regression prevention.
UI-level testing should be added later only after the unit baseline is established.

## Verification

After implementation, run:

- `npm test`
- `npm run build`

`npm run lint` may still fail because the current branch already has unrelated ESLint issues in existing files.
Lint cleanup is outside this phase.
