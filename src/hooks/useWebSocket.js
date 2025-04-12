import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for WebSocket connections
 * @param {Function} connectionFactory - Function that creates a WebSocket connection
 * @param {Array} dependencies - Dependencies to re-create the connection
 * @returns {Object} - Object with messages, sendMessage, and connection status
 */
export const useWebSocket = (connectionFactory, dependencies = []) => {
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const connectionRef = useRef(null);

  // Setup connection and event handlers
  useEffect(() => {
    // Create connection
    try {
      const connection = connectionFactory();
      connectionRef.current = connection;
      setConnectionStatus('connecting');

      // Connection opened
      connection.socket.onopen = () => {
        setConnectionStatus('connected');
      };

      // Listen for messages
      connection.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'message') {
            setMessages((prevMessages) => [...prevMessages, data.data]);
          }
        } catch (err) {
          console.error('Error parsing message', err);
        }
      };

      // Connection closed
      connection.socket.onclose = () => {
        setConnectionStatus('disconnected');
      };

      // Connection error
      connection.socket.onerror = (error) => {
        console.error('WebSocket error', error);
        setConnectionStatus('error');
      };

      // Cleanup on unmount
      return () => {
        if (connectionRef.current) {
          connectionRef.current.close();
        }
      };
    } catch (err) {
      console.error('Failed to establish WebSocket connection', err);
      setConnectionStatus('error');
    }
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  // Send message function
  const sendMessage = useCallback((content) => {
    if (connectionRef.current && connectionStatus === 'connected') {
      try {
        connectionRef.current.sendMessage(content);
        return true;
      } catch (err) {
        console.error('Error sending message', err);
        return false;
      }
    }
    return false;
  }, [connectionStatus]);

  return {
    messages,
    sendMessage,
    connectionStatus,
  };
};

export default useWebSocket; 