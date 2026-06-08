export function isThreeDigitNumberInput(value: string): boolean {
  return /^[0-9]{3}$/.test(value);
}

export function formatThreeDigitNumber(value: number): string {
  return value.toString().padStart(3, '0');
}
