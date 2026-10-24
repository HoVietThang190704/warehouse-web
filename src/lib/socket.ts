import { io, Socket } from 'socket.io-client';
import { fetchApi } from './api';

export interface InventoryChangedEvent {
  warehouseId: string;
  productId?: string;
  documentCode?: string;
  type: 'IN' | 'OUT';
  performerId?: string;
  timestamp: string;
}

let socketInstance: Socket | null = null;
let currentTicket: string | null = null;

export async function fetchSocketTicket(): Promise<string> {
  const res = await fetchApi<{ ticket: string; expiresInSeconds: number }>(
    '/api/socket/ticket',
  );
  return res.ticket;
}

export function getSocketUrl(): string {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';
}

export async function getOrCreateSocket(): Promise<Socket> {
  if (socketInstance && socketInstance.connected) {
    return socketInstance;
  }

  // Luôn xin vé mới nếu chưa có hoặc socket đã đóng
  try {
    currentTicket = await fetchSocketTicket();
  } catch (err) {
    console.warn('[Socket] Không thể lấy ticket:', err);
    throw err;
  }

  const socketUrl = getSocketUrl();

  socketInstance = io(socketUrl, {
    transports: ['websocket', 'polling'],
    withCredentials: true,
    auth: {
      ticket: currentTicket,
    },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  socketInstance.on('connect_error', async (err) => {
    console.warn('[Socket] Lỗi kết nối hoặc ticket hết hạn:', err.message);
    // Khi ticket hết hạn, lấy lại ticket cho lần retry sau
    try {
      const newTicket = await fetchSocketTicket();
      currentTicket = newTicket;
      if (socketInstance) {
        socketInstance.auth = { ticket: newTicket };
      }
    } catch {}
  });

  return socketInstance;
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.removeAllListeners();
    socketInstance.disconnect();
    socketInstance = null;
    currentTicket = null;
  }
}
