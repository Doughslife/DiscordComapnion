import type { Express } from "express";
import { createServer } from "http";
import "./bot/index";

export async function registerRoutes(app: Express) {
  const httpServer = createServer(app);
  return httpServer;
}
