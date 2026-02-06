import "dotenv/config";
import { BlocksStore } from "../packages/store/src/store.js";

async function verify() {
  const s = new BlocksStore(process.env.TURSO_DATABASE_URL!, { authToken: process.env.TURSO_AUTH_TOKEN });
  await s.initialize();
  const c = await s.toBlocksConfig();
  console.log("Name:", c.name);
  console.log("Blocks:", Object.keys(c.blocks).join(", "));
  console.log("Entities:", Object.keys(c.domain?.entities || {}).join(", "));
  console.log("Semantics:", Object.keys(c.domain?.semantics || {}).join(", "));
  console.log("Philosophy:", c.philosophy?.length, "statements");
  await s.close();
}
verify();
