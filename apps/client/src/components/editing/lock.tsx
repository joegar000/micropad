import { useEditingStore } from "../../store/editing";

export function Lock() {
  const isEditing = useEditingStore(s => s.isEditing);
  const setIsEditing = useEditingStore(s => s.setIsEditing);
  return (
    <button
      onClick={() => setIsEditing(!isEditing)}
      className="fixed top-6 left-6 z-40 bg-neutral-800 text-white p-2 rounded-full shadow-lg"
    >
      {isEditing ? 'Lock' : 'Unlock'}
    </button>
  );
}