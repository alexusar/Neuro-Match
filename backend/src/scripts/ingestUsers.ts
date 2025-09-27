import "dotenv/config";
import { mongo, pineconeIndex, pineNamespace } from "../lib/clients";
import { profileToText, toMetadata, UserDoc } from "../lib/profile";
import { embedTexts } from "../lib/embed";

const BATCH = 100;

async function flush(items: { id: string; text: string; metadata: any }[]) {
  const vectors = await embedTexts(items.map(i => i.text));
  await pineconeIndex.namespace(pineNamespace).upsert(
    items.map((it, i) => ({
      id: it.id,
      values: vectors[i],
      metadata: it.metadata,
    }))
  );
  console.log(`⬆️ Upserted ${items.length}`);
}

async function main() {
  await mongo.connect();
  const db = mongo.db();
  const users = db.collection<UserDoc>("users"); // adjust name if needed

  const cursor = users.find({}, { batchSize: BATCH });
  let batch: { id: string; text: string; metadata: any }[] = [];

  while (await cursor.hasNext()) {
    const u = await cursor.next();
    if (!u) break;

    const text = profileToText(u);
    batch.push({
      id: String(u._id),
      text,
      metadata: toMetadata(u),
    });

    if (batch.length >= BATCH) {
      await flush(batch);
      batch = [];
    }
  }
  if (batch.length) await flush(batch);

  await mongo.close();
  console.log("✅ Initial Pinecone ingestion complete");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
