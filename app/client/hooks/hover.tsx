import { useEffect, useRef, useState } from "react";

let mouseX = 0;
let mouseY = 0;
const setMouseXs: ((x: number) => void)[] = [];
const setMouseYs: ((y: number) => void)[] = [];

const cb = (e: PointerEvent) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  for (const setMouseX of setMouseXs) {
    setMouseX(e.clientX);
  }
  for (const setMouseY of setMouseYs) {
    setMouseY(e.clientY);
  }
};

document.addEventListener('pointermove', cb);


export function useHover() {
  const [x, setX] = useState(mouseX);
  const [y, setY] = useState(mouseY);
  const ref = useRef<HTMLDivElement | null>(null);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    setMouseXs.push(setX);
    setMouseYs.push(setY);
    return () => {
      setMouseXs.splice(setMouseXs.indexOf(setX), 1);
      setMouseYs.splice(setMouseYs.indexOf(setY), 1);
    }
  }, []);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const isOver = x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom;
      setHovering(isOver);
    }
  }, [x, y]);

  return [ref, hovering] as const;
}
