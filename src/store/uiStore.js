import { create } from 'zustand';

export const useUIStore = create(() => ({
  // Fixed top bar height
  topBarHeight: 60
}));