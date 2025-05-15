import { useState, useEffect } from 'react';

export function useWebSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Determine the WebSocket URL based on the current window location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws-maximus`;

    // Create a new WebSocket connection
    const ws = new WebSocket(wsUrl);

    // Set up event handlers
    ws.addEventListener('open', () => {
      console.log('WebSocket connection established');
    });

    ws.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
    });

    ws.addEventListener('close', () => {
      console.log('WebSocket connection closed');
    });

    // Store the WebSocket instance
    setSocket(ws);

    // Clean up the WebSocket connection when the component unmounts
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  return socket;
}

export default useWebSocket;