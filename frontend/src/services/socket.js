import io from 'socket.io-client';
import { API_URL } from './api'; // ✅ Wahi same URL use karega jo api.js mein hai

// Socket Connection setup
export const socket = io(API_URL, {
  transports: ['websocket'], // Force websocket (fastest)
  autoConnect: true,
  reconnection: true, // Auto retry connection
  reconnectionAttempts: 5, // Maximum 5 baar retry karega
});