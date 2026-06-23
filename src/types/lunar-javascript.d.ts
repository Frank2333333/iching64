declare module 'lunar-javascript' {
  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;
    getLunar(): Lunar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
  }
  export class Lunar {
    static fromSolar(solar: Solar): Lunar;
    getYearGan(): string;
    getYearZhi(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getYearGanIndex(): number;
    getYearZhiIndex(): number;
    getMonthGanIndex(): number;
    getMonthZhiIndex(): number;
    getYearGanIndexExact(): number;
    getYearZhiIndexExact(): number;
    getMonthGanIndexExact(): number;
    getMonthZhiIndexExact(): number;
    getYearInGanZhi(): string;
    getMonthInGanZhi(): string;
    getDayInGanZhi(): string;
  }
}
