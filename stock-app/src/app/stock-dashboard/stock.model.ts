export interface Stock {
  symbol: string;
  name: string;
  price: number;
  previousPrice: number;
  dailyHigh: number;
  dailyLow: number;
  weekHigh52: number;
  weekLow52: number;
  active: boolean;
}

export type PriceDirection = 'up' | 'down' | 'neutral';