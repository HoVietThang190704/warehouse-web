'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { useAuth } from '@/features/auth';
import { getOrCreateSocket, disconnectSocket } from '@/lib/socket';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    if (!loading && isAuthenticated) {
      getOrCreateSocket()
        .then((s) => {
          if (isCancelled) return;
          setSocket(s);
          setIsConnected(s.connected);

          const handleConnect = () => setIsConnected(true);
          const handleDisconnect = () => setIsConnected(false);

          s.on('connect', handleConnect);
          s.on('disconnect', handleDisconnect);
        })
        .catch(() => {
          if (!isCancelled) {
            setIsConnected(false);
          }
        });
    }

    return () => {
      isCancelled = true;
      if (!isAuthenticated) {
        disconnectSocket();
      }
    };
  }, [isAuthenticated, loading]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
