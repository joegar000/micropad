import { create } from "zustand";
import { valueOrCallback, type ValueOrCallback } from "../util/valueorcallback";

interface EditingState {
  isEditing: boolean;
  setIsEditing: ValueOrCallback<boolean>;
  sidebarOpen: boolean;
  setSidebarOpen: ValueOrCallback<boolean>;
}

export const useEditingStore = create<EditingState>()((set) => ({
  isEditing: true,
  setIsEditing: (isEditing) => set(state => ({
    isEditing: valueOrCallback(isEditing, state.isEditing)
  })),
  sidebarOpen: false,
  setSidebarOpen: (sidebarOpen) => set(state => ({
    sidebarOpen: valueOrCallback(sidebarOpen, state.sidebarOpen)
  }))
}));