import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { z } from "zod";
import {
    createDefaultLayout,
    LayoutUpdateSchema,
    MicropadLayoutSchema,
    type MicropadLayout
} from "micropad-protocol";

const LayoutStoreFileSchema = z.object({
    defaultLayoutId: z.string().optional(),
    layouts: z.array(MicropadLayoutSchema)
});

type LayoutStoreFile = z.infer<typeof LayoutStoreFileSchema>;

function defaultStorePath() {
    const dataDir = process.env.MICROPAD_DATA_DIR ?? path.join(os.homedir(), ".micropad");
    return path.join(dataDir, "layouts.json");
}

export class FileLayoutStore {
    constructor(private readonly filePath = defaultStorePath()) {}

    async getDefaultLayout() {
        const data = await this.read();
        const layout = data.layouts.find(candidate => candidate.id === data.defaultLayoutId) ?? data.layouts[0];
        return layout ?? createDefaultLayout();
    }

    async saveLayout(layout: MicropadLayout) {
        const parsed = LayoutUpdateSchema.parse(layout);
        const data = await this.read();
        const existingIndex = data.layouts.findIndex(candidate => candidate.id === parsed.id);

        if (existingIndex >= 0) {
            data.layouts[existingIndex] = parsed;
        } else {
            data.layouts.push(parsed);
        }

        data.defaultLayoutId = data.defaultLayoutId ?? parsed.id;
        await this.write(data);
        return parsed;
    }

    private async read(): Promise<LayoutStoreFile> {
        try {
            const raw = await fs.readFile(this.filePath, "utf8");
            const parsed = LayoutStoreFileSchema.safeParse(JSON.parse(raw));
            if (parsed.success) {
                return parsed.data;
            }
            console.warn("Ignoring invalid Micropad layout store:", parsed.error.message);
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
                console.warn("Failed to read Micropad layout store:", error);
            }
        }

        const layout = createDefaultLayout();
        return {
            defaultLayoutId: layout.id,
            layouts: [layout]
        };
    }

    private async write(data: LayoutStoreFile) {
        await fs.mkdir(path.dirname(this.filePath), { recursive: true });
        await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
    }
}
