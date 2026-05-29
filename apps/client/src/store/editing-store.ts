import { create } from "zustand";
import { valueOrCallback, type ValueOrCallback } from "../lib/value-or-callback";

interface EditingState {
  isEditing: boolean;
  setIsEditing: ValueOrCallback<boolean>;
  sidebarOpen: boolean;
  setSidebarOpen: ValueOrCallback<boolean>;
  draggedWidgetType: string | null;
  setDraggedWidgetType: ValueOrCallback<string | null>;
}

export const useEditingStore = create<EditingState>()((set) => ({
  isEditing: true,
  setIsEditing: (isEditing) => set(state => ({
    isEditing: valueOrCallback(isEditing, state.isEditing)
  })),
  sidebarOpen: false,
  setSidebarOpen: (sidebarOpen) => set(state => ({
    sidebarOpen: valueOrCallback(sidebarOpen, state.sidebarOpen)
  })),
  draggedWidgetType: null,
  setDraggedWidgetType: (draggedWidgetType) => set(state => ({
    draggedWidgetType: valueOrCallback(draggedWidgetType, state.draggedWidgetType)
  }))
}));
