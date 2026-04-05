// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/lib/socket.js
import { io } from 'socket.io-client';
import { useState, useEffect } from 'react';

export const socket = io(window.location.origin, {
  autoConnect: true,
  withCredentials: true,
});

export function useSocket() {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }
    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return { socket, isConnected };
}
