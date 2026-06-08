import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const sourceFile = 'src/pages/divinationValidation.ts';
const sourceUrl = new URL(`../${sourceFile}`, import.meta.url);
const sourceText = await readFile(sourceUrl, 'utf8');
const { outputText } = ts.transpileModule(sourceText, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
  },
});

const moduleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`;
const { formatThreeDigitNumber, isThreeDigitNumberInput } = await import(moduleUrl);

for (const value of ['000', '001', '099', '100', '999']) {
  assert.equal(isThreeDigitNumberInput(value), true, `${value} should be valid`);
}

for (const value of ['', '0', '00', '1000', '-001', '12.3', 'abc', ' 123', '123 ']) {
  assert.equal(isThreeDigitNumberInput(value), false, `${value} should be invalid`);
}

assert.equal(formatThreeDigitNumber(0), '000');
assert.equal(formatThreeDigitNumber(1), '001');
assert.equal(formatThreeDigitNumber(99), '099');
assert.equal(formatThreeDigitNumber(999), '999');

console.log('divination input validation passed');
