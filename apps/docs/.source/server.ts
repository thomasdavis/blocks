// @ts-nocheck
import * as __fd_glob_32 from "../content/docs/specification/validators.mdx?collection=docs"
import * as __fd_glob_31 from "../content/docs/specification/migration.mdx?collection=docs"
import * as __fd_glob_30 from "../content/docs/specification/index.mdx?collection=docs"
import * as __fd_glob_29 from "../content/docs/specification/domain-model.mdx?collection=docs"
import * as __fd_glob_28 from "../content/docs/specification/blocks-yml.mdx?collection=docs"
import * as __fd_glob_27 from "../content/docs/tutorials/visual-testing.mdx?collection=docs"
import * as __fd_glob_26 from "../content/docs/tutorials/index.mdx?collection=docs"
import * as __fd_glob_25 from "../content/docs/tutorials/first-block.mdx?collection=docs"
import * as __fd_glob_24 from "../content/docs/tutorials/ci-cd-integration.mdx?collection=docs"
import * as __fd_glob_23 from "../content/docs/core-concepts/signals.mdx?collection=docs"
import * as __fd_glob_22 from "../content/docs/core-concepts/semantics.mdx?collection=docs"
import * as __fd_glob_21 from "../content/docs/core-concepts/measures.mdx?collection=docs"
import * as __fd_glob_20 from "../content/docs/core-concepts/index.mdx?collection=docs"
import * as __fd_glob_19 from "../content/docs/core-concepts/entities.mdx?collection=docs"
import * as __fd_glob_18 from "../content/docs/examples/json-resume-themes.mdx?collection=docs"
import * as __fd_glob_17 from "../content/docs/examples/index.mdx?collection=docs"
import * as __fd_glob_16 from "../content/docs/examples/hr-recommendation-engine.mdx?collection=docs"
import * as __fd_glob_15 from "../content/docs/examples/blog-content-validator.mdx?collection=docs"
import * as __fd_glob_14 from "../content/docs/getting-started/using-ai-effectively.mdx?collection=docs"
import * as __fd_glob_13 from "../content/docs/getting-started/quick-start.mdx?collection=docs"
import * as __fd_glob_12 from "../content/docs/getting-started/installation.mdx?collection=docs"
import * as __fd_glob_11 from "../content/docs/getting-started/index.mdx?collection=docs"
import * as __fd_glob_10 from "../content/docs/getting-started/configuration.mdx?collection=docs"
import * as __fd_glob_9 from "../content/docs/getting-started/ai-configuration.mdx?collection=docs"
import * as __fd_glob_8 from "../content/docs/use-cases.mdx?collection=docs"
import * as __fd_glob_7 from "../content/docs/index.mdx?collection=docs"
import * as __fd_glob_6 from "../content/docs/devtools.mdx?collection=docs"
import { default as __fd_glob_5 } from "../content/docs/specification/meta.json?collection=meta"
import { default as __fd_glob_4 } from "../content/docs/tutorials/meta.json?collection=meta"
import { default as __fd_glob_3 } from "../content/docs/getting-started/meta.json?collection=meta"
import { default as __fd_glob_2 } from "../content/docs/examples/meta.json?collection=meta"
import { default as __fd_glob_1 } from "../content/docs/core-concepts/meta.json?collection=meta"
import { default as __fd_glob_0 } from "../content/docs/meta.json?collection=meta"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.doc("docs", "content/docs", {"devtools.mdx": __fd_glob_6, "index.mdx": __fd_glob_7, "use-cases.mdx": __fd_glob_8, "getting-started/ai-configuration.mdx": __fd_glob_9, "getting-started/configuration.mdx": __fd_glob_10, "getting-started/index.mdx": __fd_glob_11, "getting-started/installation.mdx": __fd_glob_12, "getting-started/quick-start.mdx": __fd_glob_13, "getting-started/using-ai-effectively.mdx": __fd_glob_14, "examples/blog-content-validator.mdx": __fd_glob_15, "examples/hr-recommendation-engine.mdx": __fd_glob_16, "examples/index.mdx": __fd_glob_17, "examples/json-resume-themes.mdx": __fd_glob_18, "core-concepts/entities.mdx": __fd_glob_19, "core-concepts/index.mdx": __fd_glob_20, "core-concepts/measures.mdx": __fd_glob_21, "core-concepts/semantics.mdx": __fd_glob_22, "core-concepts/signals.mdx": __fd_glob_23, "tutorials/ci-cd-integration.mdx": __fd_glob_24, "tutorials/first-block.mdx": __fd_glob_25, "tutorials/index.mdx": __fd_glob_26, "tutorials/visual-testing.mdx": __fd_glob_27, "specification/blocks-yml.mdx": __fd_glob_28, "specification/domain-model.mdx": __fd_glob_29, "specification/index.mdx": __fd_glob_30, "specification/migration.mdx": __fd_glob_31, "specification/validators.mdx": __fd_glob_32, });

export const meta = await create.meta("meta", "content/docs", {"meta.json": __fd_glob_0, "core-concepts/meta.json": __fd_glob_1, "examples/meta.json": __fd_glob_2, "getting-started/meta.json": __fd_glob_3, "tutorials/meta.json": __fd_glob_4, "specification/meta.json": __fd_glob_5, });