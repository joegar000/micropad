// @ts-ignore
import { enableDragDropTouch } from "@dragdroptouch/drag-drop-touch";
import { Buffer } from 'buffer';

export default () => {
  enableDragDropTouch();
  (globalThis as any).Buffer = Buffer;
}