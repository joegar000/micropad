import clsx from "clsx";
import { useLayoutStore } from "../../store/layout";
import { useEditingStore } from "../../store/editing";
import NumberField from "../mui/NumberField";

export function GridSize() {
  const isEditing = useEditingStore(s => s.isEditing);
  // const layout = useLayoutStore(s => s.widgets);
  // const minRows = layout.reduce((p, c) => Math.max(p, c.y!), -1);
  // const minCols = layout.reduce((p, c) => Math.max(p, c.x!), -1);
  const rows = useLayoutStore(s => s.rows);
  const setRows = useLayoutStore(s => s.setRows);
  const columns = useLayoutStore(s => s.columns);
  const setColumns = useLayoutStore(s => s.setColumns);

  return (
    <div className={clsx("flex items-center", { 'hidden': !isEditing })}>
      <NumberField
        label="Rows"
        size="small"
        min={1}
        value={rows}
        onValueChange={value => {
          // if (value && value > minRows)
            setRows(value!);
          // else if (value !== null)
          //   console.warn('Using too much space to decrease rows')
        }}
      />
      <div className="px-2">X</div>
      <NumberField label="Columns"
        style={{ backgroundColor: 'black' }}
        size="small"
        min={1}
        value={columns}
        onValueChange={value => {
          // if (value !== null && value > minCols)
            setColumns(value!);
          // else if (value !== null)
          //   console.warn('Using too much space to decrease columns');
        }}
      />
    </div>
  );
}