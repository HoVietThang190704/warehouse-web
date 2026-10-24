'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/providers/socket-provider';
import { inventoryKeys } from './use-inventory';
import { InventoryChangedEvent } from '@/lib/socket';
import { useAuth } from '@/features/auth';
import { message } from '@/components/ui';

export function useInventorySocket(currentWarehouseId?: string) {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // 1. Tự động Join / Leave Room khi chuyển kho đang xem
  useEffect(() => {
    if (!socket || !isConnected || !currentWarehouseId) {
      return;
    }

    socket.emit('join:warehouse', { warehouseId: currentWarehouseId });

    return () => {
      socket.emit('leave:warehouse', { warehouseId: currentWarehouseId });
    };
  }, [socket, isConnected, currentWarehouseId]);

  // 2. Lắng nghe sự kiện inventory:changed để Invalidate Query
  useEffect(() => {
    if (!socket || !isConnected) {
      return;
    }

    const handleInventoryChanged = (data: InventoryChangedEvent) => {
      // Tự động làm mới toàn bộ bảng tồn kho, KPIs và chứng từ ngay lập tức
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      void queryClient.refetchQueries({ queryKey: inventoryKeys.all, type: 'active' });

      // Nếu người thực hiện KHÔNG phải là user đang login trên tab này -> hiện thông báo nhẹ
      if (data.performerId && data.performerId !== user?.id) {
        const actionText = data.type === 'IN' ? 'vừa nhập thêm' : 'vừa xuất bớt';
        message.info(
          `Kho vừa có cập nhật: Có người ${actionText} hàng (Số chứng từ: ${data.documentCode || 'Mới'})`,
        );
      }
    };

    socket.on('inventory:changed', handleInventoryChanged);

    return () => {
      socket.off('inventory:changed', handleInventoryChanged);
    };
  }, [socket, isConnected, queryClient, user?.id]);

  return { isConnected };
}
