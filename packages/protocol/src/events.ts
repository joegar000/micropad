export const SocketEvent = {
  AppGet: "app:get",
  AppSnapshot: "app:snapshot",
  LayoutUpdate: "layout:update",
  LayoutSaved: "layout:saved",
  WidgetEvent: "widget:event",
  PairingStart: "pairing:start",
  PairingComplete: "pairing:complete"
} as const;

export type SocketEventName = (typeof SocketEvent)[keyof typeof SocketEvent];
