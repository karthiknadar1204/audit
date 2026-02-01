import "dotenv/config";
import { VerifyClient } from "kitkat-audit-sdk";

const baseUrl = process.env.AUDIT_API_URL ?? "http://localhost:3004";
const apiKey = process.env.AUDIT_API_KEY;

const client = new VerifyClient(baseUrl, { apiKey });

export { client };
