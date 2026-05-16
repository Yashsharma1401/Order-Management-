import { create } from 'zustand';

const useAppStore = create((set) => ({
  sidebarOpen: true,
  selectedStore: null,
  notifications: [],

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSelectedStore: (store) => set({ selectedStore: store }),

  addNotification: (notif) =>
    set((s) => ({
      notifications: [
        { id: Date.now(), ...notif, timestamp: new Date() },
        ...s.notifications.slice(0, 49),
      ],
    })),
  clearNotifications: () => set({ notifications: [] }),
}));

export default useAppStore;
