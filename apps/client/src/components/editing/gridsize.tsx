import clsx from "clsx";
import { useEditingStore } from "../../store/editing";
import NumberField from "../mui/NumberField";
import { useGrids } from "../../store/layout/grid";

export function GridSize() {
  const isEditing = useEditingStore(s => s.isEditing);
  // const layout = useLayoutStore(s => s.widgets);
  // const minRows = layout.reduce((p, c) => Math.max(p, c.y!), -1);
  // const minCols = layout.reduce((p, c) => Math.max(p, c.x!), -1);
  const rows = useGrids(s => s.currentGrid.rows);
  const setRows = useGrids(s => s.setRows);
  const columns = useGrids(s => s.currentGrid.columns);
  const setColumns = useGrids(s => s.setColumns);

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