import React, { useState, useEffect } from 'react';
import { CryptoData } from '../types';

// Initial mock data for cryptocurrency tracking.
const initialCryptoData: CryptoData[] = [
    {
        id: 'btc',
        name: 'Bitcoin',
        ticker: 'BTC',
        icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25661/svg/color/btc.svg',
        price: 68420.69,
        change: 2.5,
        history: [67000, 67500, 67200, 68000, 68300, 68100, 68420],
    },
    {
        id: 'eth',
        name: 'Ethereum',
        ticker: 'ETH',
        icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25661/svg/color/eth.svg',
        price: 3450.12,
        change: -1.2,
        history: [3500, 3480, 3490, 3460, 3440, 3470, 3450],
    },
];

/**
 * Props for the Sparkline component.
 */
interface SparklineProps {
    /** The data points to render in the sparkline. */
    data: number[];
    /** The color of the sparkline. */
    color: string;
}

/**
 * A small, high-density line graph that shows trends or variations.
 * @param {SparklineProps} props - The component props.
 * @returns {JSX.Element} The Sparkline component.
 */
const Sparkline: React.FC<SparklineProps> = ({ data, color }) => {
    const width = 100;
    const height = 25;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1; // Prevent division by zero if all values are the same

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                points={points}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

/**
 * The CryptoDashboardWidget displays real-time cryptocurrency data with sparkline charts.
 * It simulates price changes and updates periodically.
 * @returns {JSX.Element} The CryptoDashboardWidget component.
 */
const CryptoDashboardWidget: React.FC = () => {
    const [cryptoData, setCryptoData] = useState<CryptoData[]>(initialCryptoData);

    useEffect(() => {
        const interval = setInterval(() => {
            setCryptoData(prevData =>
                prevData.map(crypto => {
                    const changeFactor = (Math.random() - 0.5) * 0.01; // +/- 0.5% change
                    const newPrice = crypto.price * (1 + changeFactor);
                    const newChange = crypto.change + (Math.random() - 0.5) * 0.1;
                    const newHistory = [...crypto.history.slice(1), newPrice];
                    return { ...crypto, price: newPrice, change: newChange, history: newHistory };
                })
            );
        }, 3000); // Update every 3 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="glass-effect rounded-xl" role="region" aria-label="Crypto Dashboard">
             <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-lg">monitoring</span>
                    <h2 className="font-medium text-sm">Crypto Dashboard</h2>
                </div>
            </div>
            <div className="space-y-3 p-4">
                {cryptoData.map(crypto => (
                    <div key={crypto.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src={crypto.icon} alt={crypto.name} className="w-8 h-8"/>
                            <div>
                                <p className="font-semibold text-sm">{crypto.name}</p>
                                <p className="text-xs text-text-muted">{crypto.ticker}</p>
                            </div>
                        </div>
                        <div className="w-24">
                            <Sparkline data={crypto.history} color={crypto.change >= 0 ? '#4ade80' : '#f87171'} />
                        </div>
                        <div className="text-right">
                             <p className="font-semibold text-sm font-mono">${crypto.price.toFixed(2)}</p>
                             <p className={`text-xs font-semibold ${crypto.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {crypto.change >= 0 ? '+' : ''}{crypto.change.toFixed(2)}%
                             </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CryptoDashboardWidget;