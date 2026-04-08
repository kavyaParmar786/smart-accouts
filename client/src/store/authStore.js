import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      activeBusiness: null,

      setAuth: (user, token) => set({ user, token, activeBusiness: user?.activeBusiness }),

      setActiveBusiness: (business) => set({
        activeBusiness: business,
        user: { ...get().user, activeBusiness: business },
      }),

      logout: () => set({ user: null, token: null, activeBusiness: null }),

      isAuthenticated: () => !!get().token,

      getBusinessId: () => {
        const ab = get().activeBusiness;
        return ab?._id || ab || null;
      },
    }),
    {
      name: 'smartaccounts-auth',
      partialize: (s) => ({ user: s.user, token: s.token, activeBusiness: s.activeBusiness }),
    }
  )
);
