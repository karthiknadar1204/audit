import { Pinecone } from '@pinecone-database/pinecone';
import "dotenv/config";
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});
export const index = pc.index('sdk-testing-temp');