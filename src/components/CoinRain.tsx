
import React, { useEffect, useState } from 'react';

interface Coin {
  id: number;
  left: number;
  delay: number;
  duration: number;
  symbol: string;
}

const COIN_SYMBOLS = ['💰', '💵', '💎', '✨'];

export default function CoinRain() {
  const [coins, setCoins] = useState<Coin[]>([]);

  useEffect(() => {
    const generateCoins = () => {
      const newCoins: Coin[] = [];
      const count = Math.floor(Math.random() * 5) + 3;
      
      for (let i = 0; i < count; i++) {
        const rand = Math.random();
        let leftPos;
        
        if (rand < 0.35) {
          leftPos = Math.random() * 30;
        } else if (rand < 0.65) {
          leftPos = 30 + Math.random() * 40;
        } else {
          leftPos = 70 + Math.random() * 30;
        }
        
        newCoins.push({
          id: Date.now() + i,
          left: leftPos,
          delay: Math.random() * 2,
          duration: Math.random() * 3 + 4,
          symbol: COIN_SYMBOLS[Math.floor(Math.random() * COIN_SYMBOLS.length)]
        });
      }
      
      setCoins(prev => [...prev, ...newCoins]);
    };

    const interval = setInterval(generateCoins, 2000);
    generateCoins();

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cleanup = setInterval(() => {
      setCoins(prev => prev.filter(coin => {
        return Date.now() - coin.id < 8000;
      }));
    }, 2000);

    return () => clearInterval(cleanup);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {coins.map(coin => (
        <div
          key={coin.id}
          className="absolute text-4xl animate-coin-fall"
          style={{
            left: `${coin.left}%`,
            animationDelay: `${coin.delay}s`,
            animationDuration: `${coin.duration}s`,
            top: '-60px'
          }}
        >
          {coin.symbol}
        </div>
      ))}
    </div>
  );
}
