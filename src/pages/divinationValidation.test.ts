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
