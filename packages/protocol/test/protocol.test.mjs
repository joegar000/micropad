import assert from "node:assert/strict";
import test from "node:test";
import {
  AppSnapshotSchema,
  MICROPAD_LAYOUT_VERSION,
  MicropadLayoutSchema,
  createDefaultLayout
} from "../dist/index.js";

test("createDefaultLayout creates a valid versioned layout", () => {
  const layout = createDefaultLayout({
    layoutId: "layout-phone",
    pageId: "page-main",
    name: "Phone Layout",
    pageName: "Main",
    rows: 4,
    columns: 6,
    deviceId: "device-phone"
  });

  assert.equal(MicropadLayoutSchema.safeParse(layout).success, true);
  assert.equal(layout.version, MICROPAD_LAYOUT_VERSION);
  assert.equal(layout.id, "layout-phone");
  assert.equal(layout.deviceId, "device-phone");
  assert.equal(layout.currentPageId, "page-main");
  assert.deepEqual(layout.pages[0], {
    id: "page-main",
    name: "Main",
    rows: 4,
    columns: 6,
    widgets: []
  });
  assert.equal(Number.isNaN(Date.parse(layout.updatedAt)), false);
});

test("layout schema rejects invalid grid geometry", () => {
  const layout = createDefaultLayout();
  const invalid = {
    ...layout,
    pages: [
      {
        ...layout.pages[0],
        widgets: [
          {
            id: "widget-volume",
            widgetType: "volume.masterVolume",
            x: 0,
            y: 0,
            w: 0,
            h: 1,
            config: {}
          }
        ]
      }
    ]
  };

  assert.equal(MicropadLayoutSchema.safeParse(invalid).success, false);
});

test("app snapshot schema accepts widget catalog metadata and optional layout", () => {
  const layout = createDefaultLayout();
  const snapshot = AppSnapshotSchema.parse({
    widgets: [
      {
        id: "slider",
        type: "volume.masterVolume",
        title: "Volume",
        min: 0,
        max: 100
      },
      {
        id: "button",
        type: "media.playPause",
        title: "Play / Pause",
        text: "Play / Pause",
        icon: {
          type: "image",
          src: "data:image/svg+xml;utf8,%3Csvg%2F%3E",
          alt: "Play pause"
        }
      }
    ],
    layout
  });

  assert.equal(snapshot.widgets[0].type, "volume.masterVolume");
  assert.equal(snapshot.widgets[0].max, 100);
  assert.equal(snapshot.widgets[1].icon.type, "image");
  assert.equal(snapshot.layout.id, layout.id);
});
