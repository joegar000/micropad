import { useMemo, useState } from "react";
import {
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  TextField
} from "@mui/material";
import type { ModalItem, WidgetMenuModalAction } from "micropad-widgets";

export function AppActionModal(props: {
  action: WidgetMenuModalAction | null;
  items: ModalItem[];
  loading: boolean;
  onClose: () => void;
  onSelect: (item: ModalItem) => void;
}) {
  const [query, setQuery] = useState("");
  const filteredItems = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery) {
      return props.items;
    }

    return props.items.filter(item => (
      item.title.toLowerCase().includes(trimmedQuery) ||
      (item.subtitle ?? "").toLowerCase().includes(trimmedQuery)
    ));
  }, [props.items, query]);

  return (
    <Dialog open={!!props.action} onClose={props.onClose} fullWidth maxWidth="xs">
      <DialogTitle>{props.action?.title}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          margin="dense"
          placeholder={props.action?.searchPlaceholder ?? "Search..."}
          value={query}
          onChange={event => setQuery(event.target.value)}
        />
        {props.loading ? (
          <div className="flex items-center justify-center p-8">
            <CircularProgress size={24} />
          </div>
        ) : (
          <List dense>
            {filteredItems.map(item => (
              <ListItemButton
                key={item.id}
                onClick={() => props.onSelect(item)}
              >
                <ListItemText primary={item.title} secondary={item.subtitle} />
              </ListItemButton>
            ))}
            {filteredItems.length === 0 && (
              <div className="p-4 text-sm text-neutral-400">No items found.</div>
            )}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}
