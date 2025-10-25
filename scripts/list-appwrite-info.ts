// Script para listar bancos de dados e collections do Appwrite
// Execute: npx ts-node scripts/list-appwrite-info.ts

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente do apps/web/.env
const envPath = path.resolve(__dirname, "../apps/web/.env");
dotenv.config({ path: envPath });

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.NEXT_PUBLIC_APPWRITE_TOKEN;

console.log("\n=== Configuração do Appwrite ===\n");
console.log("Endpoint:", ENDPOINT);
console.log("Project ID:", PROJECT_ID);
console.log("API Key:", API_KEY?.substring(0, 20) + "...");

async function fetchAppwriteData() {
  try {
    // Listar bancos de dados
    console.log("\n=== Consultando Bancos de Dados ===\n");
    const dbsResponse = await fetch(`${ENDPOINT}/databases`, {
      method: "GET",
      headers: {
        "X-Appwrite-Project": PROJECT_ID!,
        "X-Appwrite-Key": API_KEY!,
        "Content-Type": "application/json",
      },
    });

    if (!dbsResponse.ok) {
      console.error("Erro ao listar bancos:", dbsResponse.status, await dbsResponse.text());
      return;
    }

    const dbsData = await dbsResponse.json() as any;
    console.log(JSON.stringify(dbsData, null, 2));

    // Listar collections para cada banco
    if (dbsData.databases && dbsData.databases.length > 0) {
      for (const db of dbsData.databases) {
        console.log(`\n=== Collections do banco "${db.name}" (${db.$id}) ===\n`);
        
        const colsResponse = await fetch(`${ENDPOINT}/databases/${db.$id}/collections`, {
          method: "GET",
          headers: {
            "X-Appwrite-Project": PROJECT_ID!,
            "X-Appwrite-Key": API_KEY!,
            "Content-Type": "application/json",
          },
        });

        if (colsResponse.ok) {
          const colsData = await colsResponse.json() as any;
          console.log(JSON.stringify(colsData, null, 2));
        } else {
          console.error("Erro ao listar collections:", colsResponse.status);
        }
      }
    }
  } catch (err) {
    console.error("Erro ao acessar Appwrite:", err);
  }
}

fetchAppwriteData();
