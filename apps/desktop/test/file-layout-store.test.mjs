import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createDefaultLayout } from "../../../packages/protocol/dist/index.js";
import { FileLayoutStore } from "../dist/src/storage/file-layout-store.js";

async function withTempStore(run) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "micropad-layout-store-"));
  const filePath = path.join(dir, "layouts.json");

  try {
    return await run({ dir, filePath, store: new FileLayoutStore(filePath) });
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

test("FileLayoutStore returns a default layout when the store file is missing", async () => {
  await withTempStore(async ({ store }) => {
    const layout = await store.getDefaultLayout();

    assert.equal(layout.id, "layout-default");
    assert.equal(layout.pages.length, 1);
    assert.equal(layout.pages[0].widgets.length, 0);
  });
});

test("FileLayoutStore saves layouts and reloads the default layout", async () => {
  await withTempStore(async ({ filePath, store }) => {
    const layout = createDefaultLayout({
      layoutId: "layout-living-room",
      pageId: "page-main",
      name: "Living Room",
      rows: 4,
      columns: 5
    });

    await store.saveLayout(layout);

    const reloaded = await new FileLayoutStore(filePath).getDefaultLayout();
    assert.equal(reloaded.id, "layout-living-room");
    assert.equal(reloaded.name, "Living Room");
    assert.equal(reloaded.pages[0].columns, 5);
  });
});

test("FileLayoutStore updates an existing layout instead of duplicating it", async () => {
  await withTempStore(async ({ filePath, store }) => {
    const layout = createDefaultLayout({ layoutId: "layout-one", name: "Original" });
    await store.saveLayout(layout);
    await store.saveLayout({
      ...layout,
      name: "Updated",
      pages: [{ ...layout.pages[0], rows: 6 }]
    });

    const raw = JSON.parse(await fs.readFile(filePath, "utf8"));
    assert.equal(raw.layouts.length, 1);
    assert.equal(raw.layouts[0].name, "Updated");
    assert.equal(raw.layouts[0].pages[0].rows, 6);
  });
});

test("FileLayoutStore rejects invalid layout saves", async () => {
  await withTempStore(async ({ store }) => {
    await assert.rejects(() =>
      store.saveLayout({
        ...createDefaultLayout(),
        pages: []
      })
    );
  });
});

test("FileLayoutStore falls back when the store file is invalid", async () => {
  await withTempStore(async ({ filePath, store }) => {
    await fs.writeFile(filePath, "{ not json");
    const warn = console.warn;
    console.warn = () => {};

    try {
      const layout = await store.getDefaultLayout();
      assert.equal(layout.id, "layout-default");
    } finally {
      console.warn = warn;
    }
  });
});
