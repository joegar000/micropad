import clsx from "clsx";
import { useLayoutStore } from "../../store/layout";
import { useEditingStore } from "../../store/editing";

export function GridSize() {
  const isEditing = useEditingStore(s => s.isEditing);
  const layout = useLayoutStore(s => s.widgets);
  const minRows = layout.reduce((p, c) => Math.max(p, c.y!), -1);
  const minCols = layout.reduce((p, c) => Math.max(p, c.x!), -1);
  const rows = useLayoutStore(s => s.rows);
  const setRows = useLayoutStore(s => s.setRows);
  const columns = useLayoutStore(s => s.columns);
  const setColumns = useLayoutStore(s => s.setColumns);

  return (
    <div
      className={clsx("flex fixed bottom-6 left-6 z-40", { 'hidden': !isEditing })}
      style={{ backgroundColor: 'white' }}
    >
      <input type="number"
        min={1}
        value={rows}
        onChange={e => {
          const newRows = e.target.valueAsNumber;
          if (newRows > minRows)
            setRows(e.target.valueAsNumber);
          else
            console.warn('Using too much space to decrease rows')
        }}
      />
      X
      <input type="number" value={columns}
        min={1}
        onChange={e => {
          const newCols = e.target.valueAsNumber;
          if (newCols > minCols)
            setColumns(e.target.valueAsNumber);
          else
            console.warn('Using too much space to decrease columns');
        }}
      />
    </div>
  );
}