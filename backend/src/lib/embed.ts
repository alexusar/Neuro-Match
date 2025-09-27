import { openai } from "./clients";

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const resp = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: texts,
  });
  return resp.data.map((d: { embedding: number[] }) => d.embedding);
}

export async function embedQuery(text: string): Promise<number[]> {
  const resp = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: text,
  });
  return resp.data[0].embedding;
}
