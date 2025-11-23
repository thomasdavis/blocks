// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"index.mdx": () => import("../content/docs/index.mdx?collection=docs"), "use-cases.mdx": () => import("../content/docs/use-cases.mdx?collection=docs"), "core-concepts/entities.mdx": () => import("../content/docs/core-concepts/entities.mdx?collection=docs"), "core-concepts/index.mdx": () => import("../content/docs/core-concepts/index.mdx?collection=docs"), "core-concepts/measures.mdx": () => import("../content/docs/core-concepts/measures.mdx?collection=docs"), "core-concepts/signals.mdx": () => import("../content/docs/core-concepts/signals.mdx?collection=docs"), "getting-started/ai-configuration.mdx": () => import("../content/docs/getting-started/ai-configuration.mdx?collection=docs"), "getting-started/configuration.mdx": () => import("../content/docs/getting-started/configuration.mdx?collection=docs"), "getting-started/installation.mdx": () => import("../content/docs/getting-started/installation.mdx?collection=docs"), "getting-started/quick-start.mdx": () => import("../content/docs/getting-started/quick-start.mdx?collection=docs"), "examples/hr-recommendation-engine.mdx": () => import("../content/docs/examples/hr-recommendation-engine.mdx?collection=docs"), }),
};
export default browserCollections;