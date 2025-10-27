export interface MarketIndex {
    name: string;
    value: number;
    change: number;
}

export interface WatchlistItem {
    ticker: string;
    name: string;
    price: number;
    change: number;
}

export const marketIndices: MarketIndex[] = [
    { name: 'S&P 500', value: 5433.74, change: -0.51 },
    { name: 'NASDAQ', value: 17689.36, change: -0.79 },
    { name: 'DOW JONES', value: 38589.16, change: -0.65 },
];

export const defaultWatchlist: WatchlistItem[] = [
    { ticker: 'TSLA', name: 'Tesla, Inc.', price: 182.47, change: -2.44 },
    { ticker: 'BTC', name: 'Bitcoin', price: 68420.69, change: 2.5 },
    { ticker: 'ETH', name: 'Ethereum', price: 3450.12, change: -1.2 },
];
