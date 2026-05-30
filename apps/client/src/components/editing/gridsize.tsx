import clsx from "clsx";
import { useEditingStore } from "../../store/editing-store";
import NumberField from "../mui/NumberField";
import { useLayoutStore } from "../../store/layout-store";

export function GridSize() {
  const isEditing = useEditingStore(s => s.isEditing);
  const page = useLayoutStore(s => s.currentPage);
  const setRows = useLayoutStore(s => s.setRows);
  const setColumns = useLayoutStore(s => s.setColumns);
  const rows = page.rows;
  const columns = page.columns;

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
