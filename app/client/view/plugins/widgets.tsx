import { createElement, useCallback, type HTMLElementType } from "react";
import type { ClientPlugin } from "micropad-sdk/client";
import Widget from "../grid/widget.tsx";

function RandomDom(props: { dom: HTMLElement, containerTag: HTMLElementType }) {
  const ref = useCallback((node: HTMLElement | null) => {
    node?.appendChild(props.dom);
    return () => props.dom.remove();
  }, [props.dom]);

  return createElement(props.containerTag, { ref });
}

export function WidgetsPreview(props: { plugin: ClientPlugin }) {
  return (
    <div className="flex">
      {props.plugin.widgetIds.map(wId => (
        <Widget id={wId}>
          <RandomDom containerTag="div" key={wId} dom={props.plugin.createWidget(wId).dom} />
        </Widget>
      ))}
    </div>
  );
}
