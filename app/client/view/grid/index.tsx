// @ts-ignore
import clsx from 'clsx';
import { useRef } from "react";
import Cell from "./cell.tsx";
import { range } from "es-toolkit/math";
import { observer } from "mobx-react-lite";
import { usePage } from "../../model/page.tsx";
import Widget from "./widget.tsx";

const Grid = observer(() => {
  const page = usePage();
  const ref = useRef<HTMLDivElement>(null);
  const columns = page.data.columns;
  const rows = page.data.rows;

  return (
    <div
      className="flex h-full w-full min-h-0 min-w-0 flex-col items-center justify-center overflow-hidden p-6"
      style={{ containerType: "size" }}
    >
      <div
        ref={ref}
        className="flex items-center justify-center"
        style={{
          aspectRatio: `${columns} / ${rows}`,
          width: `min(100cqw, ${(columns / rows) * 100}cqh)`,
        }}
      >
        {range(columns).map(x => (
          <div key={x} className="flex h-full flex-col items-center justify-center" style={{ width: `${100 / columns}%` }}>
            {range(rows).map(y => (
              <div key={y} style={{ height: `${100 / rows}%`, width: '100%' }}>
                <Cell x={x} y={y}>
                  {page.widgetRootAt(x, y) ? (
                    <Widget {...page.widgetRootAt(x, y)!} />
                  ) : null}
                </Cell>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
});
export default Grid;
