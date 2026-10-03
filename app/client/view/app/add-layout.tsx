import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, Input, Label } from "micropad-ui";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useApp } from "../../model/app";

const AddLayout = observer((props: { open: boolean, onOpenChange: (open: boolean) => void }) => {
  const app = useApp();
  const [newLayoutName, setNewLayoutName] = useState('');
  const error = newLayoutName in app.layout.data;
  const save = () => {
    setNewLayoutName('');
    props.onOpenChange(false);
    app.layout.data[newLayoutName] = [{
      columns: 3,
      rows: 3,
      widgets: {},
      widgetCoords: {}
    }];
  }
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a new layout</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="layout-input" className="sr-only">Name</Label>
            <Input type="text" id="layout-input" value={newLayoutName} autoFocus={true}
              aria-invalid={error}
              onChange={e => setNewLayoutName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && save()}
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <div className="flex">
            <Button type="button" disabled={error} onClick={save}>Save</Button>
            {error && <div className="flex items-center ps-3">This layout name already exists</div>}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
export default AddLayout;

