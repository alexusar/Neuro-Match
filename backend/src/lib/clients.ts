import "dotenv/config";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";
import { MongoClient } from "mongodb";

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
export const pineconeIndex = pc.index(process.env.PINECONE_INDEX!);
export const pineNamespace = process.env.PINECONE_NAMESPACE || "default";

export const mongo = new MongoClient(process.env.MONGO_URI!);
