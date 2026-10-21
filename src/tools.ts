import { tool } from "ai";
import { z } from "zod";

// Mock DB of flaconi products
const MOCK_CATALOG = [
  {
    id: "SKU-001",
    name: "Hydrating Face Cream",
    price: 29.99,
    competitorPrice: 24.99,
    stock: 150,
  },
  {
    id: "SKU-002",
    name: "Luxury Eau de Parfum",
    price: 89.0,
    competitorPrice: 95.0,
    stock: 0,
  },
  {
    id: "SKU-003",
    name: "Matte Lipstick Red",
    price: 19.5,
    competitorPrice: 12.0,
    stock: 42,
  },
];

export const auditTools = {
  fetchCatalogItems: tool({
    description: "Fetch list of catalog items along with current internal and competitor pricing.",
    inputSchema: z.object({
      category: z.string().optional().describe("Filter by product category"),
    }),
    execute: ({ category }) => {
      console.log(`  [Tool Executed] Fetching catalog data (Category: ${category ?? "All"})...`);
      return MOCK_CATALOG;
    },
  }),

  logAuditAnomaly: tool({
    description: "Log a pricing or stock anomaly to the operational discrepancy queue.",
    inputSchema: z.object({
      sku: z.string().describe("Product SKU ID"),
      issueType: z.enum(["PRICING_DISCREPANCY", "OUT_OF_STOCK_RIVAL_CHEAPER", "DATA_MISSING"]),
      severity: z.enum(["LOW", "MEDIUM", "HIGH"]),
      details: z.string().describe("Brief summary of the issue"),
    }),
    execute: (anomaly) => {
      console.log(
        `  [Tool Executed] Logged Anomaly for ${anomaly.sku}: [${anomaly.severity}] ${anomaly.details}`,
      );
      return { success: true, loggedAt: new Date().toISOString() };
    },
  }),
};
