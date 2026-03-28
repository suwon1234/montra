'use client';

import { useState, useEffect, useRef } from 'react';

/** A single history data point from the API */
export interface HistoryPoint {
  date: string;
  social_score: number;
}

/** Map of trend_id -> array of history points */
export type HistoryMap = Record<string, HistoryPoint[]>;

/** Maximum number of trend IDs per API request */
const BATCH_SIZE = 50;

/**
 * Fetch trend history data for a list of trend IDs.
 * - Batches requests if more than 50 IDs
 * - Returns a stable HistoryMap that updates once all batches resolve
 * - `loading` is true while fetching; consumers can show simulation fallback
 */
export function useTrendHistory(trendIds: string[]): {
  historyMap: HistoryMap;
  loading: boolean;
} {
  const [historyMap, setHistoryMap] = useState<HistoryMap>({});
  const [loading, setLoading] = useState(false);

  // Track the latest request to avoid stale updates
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (trendIds.length === 0) {
      setHistoryMap({});
      setLoading(false);
      return;
    }

    const currentRequest = ++requestIdRef.current;
    setLoading(true);

    (async () => {
      try {
        // Split into batches of BATCH_SIZE
        const batches: string[][] = [];
        for (let i = 0; i < trendIds.length; i += BATCH_SIZE) {
          batches.push(trendIds.slice(i, i + BATCH_SIZE));
        }

        // Fetch all batches in parallel
        const results = await Promise.all(
          batches.map(async (batch) => {
            const ids = batch.join(',');
            const res = await fetch(`/api/trend-history?trend_ids=${ids}`);
            if (!res.ok) return {} as HistoryMap;
            const json = await res.json();
            return (json.data ?? {}) as HistoryMap;
          })
        );

        // Only update state if this is still the latest request
        if (currentRequest !== requestIdRef.current) return;

        // Merge all batch results into a single map
        const merged: HistoryMap = {};
        for (const batch of results) {
          for (const [id, points] of Object.entries(batch)) {
            merged[id] = points;
          }
        }

        setHistoryMap(merged);
      } catch (err) {
        console.error('[useTrendHistory] fetch failed:', err);
      } finally {
        if (currentRequest === requestIdRef.current) {
          setLoading(false);
        }
      }
    })();
  }, [trendIds.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  return { historyMap, loading };
}
