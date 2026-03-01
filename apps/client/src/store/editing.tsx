import { create } from "zustand";
import { valueOrCallback, type ValueOrCallback } from "../util/valueorcallback";

interface EditingState {
  isEditing: boolean;
  setIsEditing: ValueOrCallback<boolean>
}

export const useEditingStore = create<EditingState>()((set) => ({
  isEditing: false,
  setIsEditing: (isEditing) => set(state => ({
    isEditing: valueOrCallback(isEditing, state.isEditing)
  }))
})
);