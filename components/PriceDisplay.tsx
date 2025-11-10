'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PriceDisplayProps {
  threshold?: number;
  condition?: 'above' | 'below';
}

export default function PriceDisplay({ threshold, condition }: PriceDisplayProps) {
  const [price, setPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = async () => {
    console.log('💰 Fetching SOL price...');
    try {
      setError(null);
      
      // Add timeout to prevent infinite loading
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const response = await fetch('/api/check-price', {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      console.log('💰 Price fetch response:', data);

      if (data.success && data.price) {
        console.log('✅ Price loaded:', data.price);
        setPrice(data.price);
        setLastUpdated(new Date());
      } else {
        console.error('❌ Price fetch failed:', data);
        setError('Failed to fetch price');
      }
    } catch (err) {
      console.error('❌ Error fetching price:', err);
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request timed out. Retrying...');
        // Auto-retry once after timeout
        setTimeout(() => fetchPrice(), 2000);
      } else {
        setError('Error fetching price');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch price on mount and every 30 seconds
  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 30000); // 30 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatPrice = (priceValue: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(priceValue);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const isAboveThreshold = threshold && price ? price > threshold : null;
  const isBelowThreshold = threshold && price ? price < threshold : null;

  const getThresholdStatus = () => {
    if (!threshold || !price) return null;

    if (condition === 'above' && isAboveThreshold) {
      return { text: 'Above Threshold', color: 'text-red-400', bgColor: 'bg-red-900/30', borderColor: 'border-red-700' };
    } else if (condition === 'below' && isBelowThreshold) {
      return { text: 'Below Threshold', color: 'text-red-400', bgColor: 'bg-red-900/30', borderColor: 'border-red-700' };
    } else if (condition === 'above' && !isAboveThreshold) {
      return { text: 'Below Threshold', color: 'text-blue-400', bgColor: 'bg-blue-900/30', borderColor: 'border-blue-700' };
    } else if (condition === 'below' && !isBelowThreshold) {
      return { text: 'Above Threshold', color: 'text-blue-400', bgColor: 'bg-blue-900/30', borderColor: 'border-blue-700' };
    }

    return null;
  };

  const thresholdStatus = getThresholdStatus();

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Current SOL Price</CardTitle>
        <CardDescription className="text-gray-400">
          Live price from Switchboard oracle
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Price Display */}
          <div className="text-center py-6">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-8 w-8 text-green-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-gray-400 text-lg">Loading price...</span>
              </div>
            ) : error ? (
              <div className="text-red-400 text-lg">{error}</div>
            ) : (
              <>
                <div className="text-6xl font-bold text-green-500 mb-2">
                  {price ? formatPrice(price) : '--'}
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                    <path d="M8 16H3v5" />
                  </svg>
                  <span>
                    Auto-refreshing every 30s
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Threshold Indicator */}
          {thresholdStatus && threshold && (
            <div className={`p-4 rounded-lg border ${thresholdStatus.bgColor} ${thresholdStatus.borderColor}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={thresholdStatus.color}
                  >
                    <path d="M12 2v20" />
                    <path d="M2 12h20" />
                  </svg>
                  <div>
                    <p className="text-gray-300 text-sm">Threshold: {formatPrice(threshold)}</p>
                    <p className={`${thresholdStatus.color} text-sm font-semibold`}>
                      {thresholdStatus.text}
                    </p>
                  </div>
                </div>
                {condition === 'above' && isAboveThreshold && (
                  <Badge variant="destructive" className="bg-red-600">
                    Alert Condition Met
                  </Badge>
                )}
                {condition === 'below' && isBelowThreshold && (
                  <Badge variant="destructive" className="bg-red-600">
                    Alert Condition Met
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Last Updated */}
          {lastUpdated && (
            <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>Last updated: {formatTimestamp(lastUpdated)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
