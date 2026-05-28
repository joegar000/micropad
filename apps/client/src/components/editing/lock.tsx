import { useEditingStore } from "../../store/editing-store";
import { Button } from "@mui/material";
import LockOutlineIcon from '@mui/icons-material/LockOutline';
import LockOpenIcon from '@mui/icons-material/LockOpen';


export function Lock() {
  const isEditing = useEditingStore(s => s.isEditing);
  const setIsEditing = useEditingStore(s => s.setIsEditing);
  return (
    <Button
      className="bg-neutral-800 text-white"
      onClick={() => setIsEditing(!isEditing)}
    >
      {isEditing ? <LockOpenIcon /> : <LockOutlineIcon />}
    </Button>
  );
}
