import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Id } from '@lesso/domain';
import { DEV_TOOLBAR_KEY, DEV_TOOLBAR_VERSION } from '@/lib/persist-keys';

interface DevToolbarPersistedState {
  tenantId: Id | null;
  branchId: Id | null;
  userId: Id | null;
}

interface DevToolbarState extends DevToolbarPersistedState {
  setTenant: (id: Id | null) => void;
  setBranch: (id: Id | null) => void;
  setUser: (id: Id | null) => void;
}

export const useDevToolbar = create<DevToolbarState>()(
  persist(
    (set) => ({
      tenantId: null,
      branchId: null,
      userId: null,
      setTenant: (tenantId) => set({ tenantId, branchId: null }),
      setBranch: (branchId) => set({ branchId }),
      setUser: (userId) => set({ userId }),
    }),
    {
      name: DEV_TOOLBAR_KEY,
      version: DEV_TOOLBAR_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): DevToolbarPersistedState => ({
        tenantId: state.tenantId,
        branchId: state.branchId,
        userId: state.userId,
      }),
    },
  ),
);
