import {
  Button,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue
} from "micropad-ui";
import AddLayout from "./add-layout";
import { useState } from "react";
import { useApp } from "../../model/app";

const LayoutSelector = (props: {
  currentLayout: string,
  onLayoutChange: (layout: string | null) => void
}) => {
  const app = useApp();
  const items = app.layoutNames.map(name => ({ label: name, value: name }));
  const [open, setOpen] = useState(false);
  const [showAddLayout, setShowAddLayout] = useState(false);
  return (
    <Select open={open} onOpenChange={setOpen}
      items={items} value={props.currentLayout}
      onValueChange={props.onLayoutChange}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="start">
        <SelectGroup>
          {items.map(item => (
            <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
          ))}
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <Button variant="ghost" className="w-full justify-start text-left mb-1"
            onClick={() => {
              setOpen(false);
              setShowAddLayout(true);
            }}
          >
            + Add layout
          </Button>
          <AddLayout open={showAddLayout} onOpenChange={setShowAddLayout}
            onSave={newLayout => {
              if (app.addLayout(newLayout))
                props.onLayoutChange(newLayout);
            }}
          />
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default LayoutSelector;

