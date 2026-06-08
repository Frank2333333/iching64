# Vitest Unit Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a formal Vitest unit test baseline for divination validation helpers and hexagram data invariants.

**Architecture:** Keep tests close to the modules they cover. Use Vitest only, with no jsdom, React Testing Library, or browser automation in this phase. Migrate the existing ad hoc Node validation script into a TypeScript Vitest test and remove the old script.

**Tech Stack:** React 19, TypeScript 5.9, Vite 7, Vitest.

---

## File Structure

- Modify: `package.json`
  - Add `test` and `test:watch` scripts.
  - Add `vitest` to `devDependencies` through npm.
- Modify: `package-lock.json`
  - Let npm update the lockfile when installing Vitest.
- Create: `src/pages/divinationValidation.test.ts`
  - Unit tests for `isThreeDigitNumberInput` and `formatThreeDigitNumber`.
- Create: `src/data/guaxiang.test.ts`
  - Invariant tests for the 64 hexagram data and helper lookup functions.
- Delete: `scripts/divination-validation.test.mjs`
  - Remove the old ad hoc script after equivalent Vitest coverage exists.

---

### Task 1: Add Vitest And Test Scripts

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Install Vitest**

Run:

```powershell
npm.cmd install --save-dev vitest
```

Expected:

- Exit code `0`
- `package.json` includes `vitest` under `devDependencies`
- `package-lock.json` includes Vitest packages

- [ ] **Step 2: Add npm test scripts**

Modify `package.json` scripts so the scripts block contains:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

Preserve the existing script values for `dev`, `build`, `lint`, and `preview`.

- [ ] **Step 3: Run the empty test command**

Run:

```powershell
npm.cmd test -- --passWithNoTests
```

Expected:

- Exit code `0`
- Vitest starts successfully
- Vitest reports no test files yet, or reports no tests found while accepting `--passWithNoTests`

- [ ] **Step 4: Commit dependency and script setup**

Run:

```powershell
git -c safe.directory=C:/Users/win/Desktop/IChing64/iching64 add package.json package-lock.json
git -c safe.directory=C:/Users/win/Desktop/IChing64/iching64 commit -m "test: add vitest runner"
```

Expected:

- Commit succeeds
- Working tree has no changes from this task

---

### Task 2: Migrate Divination Validation Tests

**Files:**
- Create: `src/pages/divinationValidation.test.ts`
- Delete: `scripts/divination-validation.test.mjs`

- [ ] **Step 1: Create the Vitest validation test file**

Create `src/pages/divinationValidation.test.ts` with:

```ts
import { describe, expect, it } from 'vitest';
import { formatThreeDigitNumber, isThreeDigitNumberInput } from './divinationValidation';

describe('isThreeDigitNumberInput', () => {
  it.each(['000', '001', '099', '100', '999'])('accepts %s as a three-digit number', value => {
    expect(isThreeDigitNumberInput(value)).toBe(true);
  });

  it.each(['', '0', '00', '1000', '-001', '12.3', 'abc', ' 123', '123 '])(
    'rejects %s as a three-digit number',
    value => {
      expect(isThreeDigitNumberInput(value)).toBe(false);
    }
  );
});

describe('formatThreeDigitNumber', () => {
  it.each([
    [0, '000'],
    [1, '001'],
    [99, '099'],
    [999, '999'],
  ])('formats %i as %s', (value, expected) => {
    expect(formatThreeDigitNumber(value)).toBe(expected);
  });
});
```

- [ ] **Step 2: Run the focused validation test**

Run:

```powershell
npm.cmd test -- src/pages/divinationValidation.test.ts
```

Expected:

- Exit code `0`
- Tests for `isThreeDigitNumberInput` pass
- Tests for `formatThreeDigitNumber` pass

- [ ] **Step 3: Remove the old ad hoc validation script**

Delete:

```text
scripts/divination-validation.test.mjs
```

- [ ] **Step 4: Run the full test suite**

Run:

```powershell
npm.cmd test
```

Expected:

- Exit code `0`
- Vitest reports `src/pages/divinationValidation.test.ts` passing

- [ ] **Step 5: Commit validation test migration**

Run:

```powershell
git -c safe.directory=C:/Users/win/Desktop/IChing64/iching64 add src/pages/divinationValidation.test.ts scripts/divination-validation.test.mjs
git -c safe.directory=C:/Users/win/Desktop/IChing64/iching64 commit -m "test: migrate divination validation to vitest"
```

Expected:

- Commit succeeds
- Old script is removed from git
- New Vitest validation test is tracked

---

### Task 3: Add Hexagram Data Invariant Tests

**Files:**
- Create: `src/data/guaxiang.test.ts`

- [ ] **Step 1: Create the data invariant test file**

Create `src/data/guaxiang.test.ts` with:

```ts
import { describe, expect, it } from 'vitest';
import { getGuaById, getGuaByName, liuShiSiGua } from './guaxiang';

describe('liuShiSiGua data invariants', () => {
  const ids = liuShiSiGua.map(gua => gua.id);
  const idSet = new Set(ids);

  it('contains exactly 64 hexagrams', () => {
    expect(liuShiSiGua).toHaveLength(64);
  });

  it('uses unique ids covering 1 through 64', () => {
    expect(idSet.size).toBe(64);
    expect([...idSet].sort((a, b) => a - b)).toEqual(
      Array.from({ length: 64 }, (_, index) => index + 1)
    );
  });

  it('defines exactly six ordered lines for every hexagram', () => {
    for (const gua of liuShiSiGua) {
      expect(gua.yaos, `hexagram ${gua.id} should have six lines`).toHaveLength(6);
      expect(gua.yaos.map(yao => yao.position), `hexagram ${gua.id} line positions`).toEqual([
        1,
        2,
        3,
        4,
        5,
        6,
      ]);
    }
  });

  it('uses only supported yinYang values', () => {
    for (const gua of liuShiSiGua) {
      for (const yao of gua.yaos) {
        expect(['yin', 'yang'], `hexagram ${gua.id} line ${yao.position}`).toContain(yao.yinYang);
      }
    }
  });

  it('references existing hexagram ids in relationship fields', () => {
    for (const gua of liuShiSiGua) {
      expect(idSet.has(gua.duiGua), `hexagram ${gua.id} duiGua ${gua.duiGua}`).toBe(true);
      expect(idSet.has(gua.zongGua), `hexagram ${gua.id} zongGua ${gua.zongGua}`).toBe(true);
      expect(idSet.has(gua.huGua), `hexagram ${gua.id} huGua ${gua.huGua}`).toBe(true);

      for (const relatedId of gua.guaBian) {
        expect(idSet.has(relatedId), `hexagram ${gua.id} guaBian ${relatedId}`).toBe(true);
      }
    }
  });
});

describe('hexagram lookup helpers', () => {
  it('finds an existing hexagram by id', () => {
    const firstGua = liuShiSiGua[0];

    expect(getGuaById(firstGua.id)).toBe(firstGua);
  });

  it('returns undefined for a missing id', () => {
    expect(getGuaById(0)).toBeUndefined();
    expect(getGuaById(65)).toBeUndefined();
  });

  it('finds an existing hexagram by full name or Chinese name', () => {
    const firstGua = liuShiSiGua[0];

    expect(getGuaByName(firstGua.name)).toBe(firstGua);
    expect(getGuaByName(firstGua.chineseName)).toBe(firstGua);
  });

  it('returns undefined for a missing name', () => {
    expect(getGuaByName('__missing_hexagram__')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the focused data test**

Run:

```powershell
npm.cmd test -- src/data/guaxiang.test.ts
```

Expected:

- Exit code `0`
- Hexagram count, id, line, relationship, and lookup helper tests pass

- [ ] **Step 3: Run the full test suite**

Run:

```powershell
npm.cmd test
```

Expected:

- Exit code `0`
- Both `src/pages/divinationValidation.test.ts` and `src/data/guaxiang.test.ts` pass

- [ ] **Step 4: Commit data invariant tests**

Run:

```powershell
git -c safe.directory=C:/Users/win/Desktop/IChing64/iching64 add src/data/guaxiang.test.ts
git -c safe.directory=C:/Users/win/Desktop/IChing64/iching64 commit -m "test: add hexagram data invariants"
```

Expected:

- Commit succeeds
- Data invariant test is tracked

---

### Task 4: Final Verification

**Files:**
- No new files expected

- [ ] **Step 1: Run all unit tests**

Run:

```powershell
npm.cmd test
```

Expected:

- Exit code `0`
- Vitest reports all test files passing

- [ ] **Step 2: Run production build**

Run:

```powershell
npm.cmd run build
```

Expected:

- Exit code `0`
- TypeScript build passes
- Vite production build completes and writes `dist/`

- [ ] **Step 3: Check git status**

Run:

```powershell
git -c safe.directory=C:/Users/win/Desktop/IChing64/iching64 status --short --branch
```

Expected:

- Branch is `codex`
- No uncommitted changes remain from implementation

- [ ] **Step 4: Report lint status without treating it as part of this phase**

Do not run `npm.cmd run lint` as a required gate for this plan.
The current branch already has unrelated ESLint failures documented during discussion.
If lint is run anyway, report its actual output and do not claim this phase made lint clean.

---

## Self-Review

- Spec coverage: The plan adds Vitest, creates the two required test files, migrates validation assertions, removes the old Node script, and verifies with `npm test` and `npm run build`.
- Placeholder scan: No `TBD`, `TODO`, or unspecified test content remains.
- Type consistency: Test imports match existing exports from `src/pages/divinationValidation.ts` and `src/data/guaxiang.ts`.
