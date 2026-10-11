// @ts-ignore
import clsx from 'clsx';
import Cell from "./cell.tsx";
import { range } from "es-toolkit/math";
import { observer } from "mobx-react-lite";
import { usePage } from "../../model/page.tsx";
import Widget from "./widget.tsx";

const Grid = observer(() => {
  const page = usePage();
  const columns = page.data.columns;
  const rows = page.data.rows;

  return (
    <div
      className="flex h-full w-full min-h-0 min-w-0 flex-col items-center justify-center overflow-hidden p-6"
      style={{ containerType: "size" }}
    >
      <div
        className="items-center justify-center grid"
        style={{
          aspectRatio: `${columns} / ${rows}`,
          width: `min(100cqw, ${(columns / rows) * 100}cqh)`,
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`
        }}
      >
        {range(columns).map(x => (
          range(rows).map(y => (
            <Cell key={`${x}${y}`} x={x} y={y} />
          ))
        ))}
        {page.widgets.map(({ widget }) => (
          <Widget {...widget} />
        ))}
      </div>
    </div>
  );
});
export default Grid;
