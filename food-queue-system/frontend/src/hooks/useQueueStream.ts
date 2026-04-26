import { useEffect, useRef, useState, useCallback } from 'react';
import { api } from '../api/client';

export interface QueueData {
  stall_id: number;
  queue_length: number;
  estimated_wait_minutes: number;
  orders: { queue_number: number; token: string; status: string }[];
}

interface UseQueueStreamResult {
  data: QueueData | null;
  loading: boolean;
  connectionMode: 'sse' | 'polling' | 'idle';
  error: string | null;
}

/**
 * useQueueStream — live queue data via SSE with automatic polling fallback.
 *
 * On Render free tier, instances sleep after inactivity which drops SSE.
 * Strategy:
 *   1. Open EventSource to /queue/{stallId}/stream
 *   2. SSE alive → use it, stop polling
 *   3. SSE drops → start polling GET /queue/{stallId} every 5s
 *   4. EventSource auto-reconnects — when SSE recovers, polling stops again
 */
export function useQueueStream(
  stallId: number | string | null | undefined
): UseQueueStreamResult {
  const POLL_MS = 5000;

  const [data, setData] = useState<QueueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionMode, setConnectionMode] = useState<'sse' | 'polling' | 'idle'>('idle');
  const [error, setError] = useState<string | null>(null);

  const esRef = useRef<EventSource | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startPolling = useCallback((id: number) => {
    if (pollRef.current) return;
    setConnectionMode('polling');

    const poll = async () => {
      try {
        const res = await api.getQueue(id);
        setData(res);
        setLoading(false);
        setError(null);
      } catch (e: any) {
        setError(e.message || 'Failed to fetch queue');
      }
    };

    poll();
    pollRef.current = setInterval(poll, POLL_MS);
  }, []);

  useEffect(() => {
    if (!stallId) {
      setConnectionMode('idle');
      setLoading(false);
      return;
    }

    const id = Number(stallId);
    if (isNaN(id)) return;

    const url = api.getQueueStreamUrl(id);
    const es = new EventSource(url);
    esRef.current = es;

    es.onopen = () => {
      setConnectionMode('sse');
      setError(null);
      stopPolling();
    };

    es.onmessage = (event) => {
      try {
        const parsed: QueueData = JSON.parse(event.data);
        setData(parsed);
        setLoading(false);
        stopPolling();
        setConnectionMode('sse');
      } catch {
        // malformed tick — skip
      }
    };

    es.onerror = () => {
      // SSE dropped — start polling until EventSource reconnects
      startPolling(id);
    };

    return () => {
      es.close();
      esRef.current = null;
      stopPolling();
      setConnectionMode('idle');
    };
  }, [stallId, startPolling, stopPolling]);

  return { data, loading, connectionMode, error };
}