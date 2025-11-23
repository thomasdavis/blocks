// @ts-nocheck
import { default as __fd_glob_14 } from "../content/docs/getting-started/meta.json?collection=meta"
import { default as __fd_glob_13 } from "../content/docs/examples/meta.json?collection=meta"
import { default as __fd_glob_12 } from "../content/docs/core-concepts/meta.json?collection=meta"
import { default as __fd_glob_11 } from "../content/docs/meta.json?collection=meta"
import * as __fd_glob_10 from "../content/docs/getting-started/quick-start.mdx?collection=docs"
import * as __fd_glob_9 from "../content/docs/getting-started/installation.mdx?collection=docs"
import * as __fd_glob_8 from "../content/docs/getting-started/configuration.mdx?collection=docs"
import * as __fd_glob_7 from "../content/docs/getting-started/ai-configuration.mdx?collection=docs"
import * as __fd_glob_6 from "../content/docs/core-concepts/signals.mdx?collection=docs"
import * as __fd_glob_5 from "../content/docs/core-concepts/measures.mdx?collection=docs"
import * as __fd_glob_4 from "../content/docs/core-concepts/index.mdx?collection=docs"
import * as __fd_glob_3 from "../content/docs/core-concepts/entities.mdx?collection=docs"
import * as __fd_glob_2 from "../content/docs/examples/hr-recommendation-engine.mdx?collection=docs"
import * as __fd_glob_1 from "../content/docs/use-cases.mdx?collection=docs"
import * as __fd_glob_0 from "../content/docs/index.mdx?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.doc("docs", "content/docs", {"index.mdx": __fd_glob_0, "use-cases.mdx": __fd_glob_1, "examples/hr-recommendation-engine.mdx": __fd_glob_2, "core-concepts/entities.mdx": __fd_glob_3, "core-concepts/index.mdx": __fd_glob_4, "core-concepts/measures.mdx": __fd_glob_5, "core-concepts/signals.mdx": __fd_glob_6, "getting-started/ai-configuration.mdx": __fd_glob_7, "getting-started/configuration.mdx": __fd_glob_8, "getting-started/installation.mdx": __fd_glob_9, "getting-started/quick-start.mdx": __fd_glob_10, });

export const meta = await create.meta("meta", "content/docs", {"meta.json": __fd_glob_11, "core-concepts/meta.json": __fd_glob_12, "examples/meta.json": __fd_glob_13, "getting-started/meta.json": __fd_glob_14, });