import io from 'socket.io-client';
import { API_URL } from './api'; 

// Socket Connection
export const socket = io(API_URL, {
  transports: ['websocket'], // Fast connection
  autoConnect: true,
  reconnection: true, 
  reconnectionAttempts: 5, 
});