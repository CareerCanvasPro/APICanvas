import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseRealTimeDataProps {
  endpoint: string;
  event: string;
  initialData?: any;
}

export function useRealTimeData<T>({ 
  endpoint, 
  event, 
  initialData 
}: UseRealTimeDataProps) {
  const [data, setData] = useState<T | null>(initialData || null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const newSocket = io(endpoint);

    newSocket.on('connect', () => {
      setSocket(newSocket);
    });

    newSocket.on('connect_error', (err) => {
      setError(new Error(`WebSocket connection error: ${err.message}`));
    });

    newSocket.on(event, (newData: T) => {
      setData(newData);
    });

    return () => {
      newSocket.close();
    };
  }, [endpoint, event]);

  return { data, socket, error };
}