import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-c9aa4dc3/health", (c) => {
  return c.json({ status: "ok" });
});

// Parking profiles endpoints
const PROFILES_PREFIX = "parking_profile:";

// Get all parking profiles
app.get("/make-server-c9aa4dc3/profiles", async (c) => {
  try {
    const profiles = await kv.getByPrefix(PROFILES_PREFIX);
    return c.json({ profiles });
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return c.json({ error: "Failed to fetch profiles" }, 500);
  }
});

// Create a new parking profile
app.post("/make-server-c9aa4dc3/profiles", async (c) => {
  try {
    const profile = await c.req.json();
    const profileId = `${PROFILES_PREFIX}${Date.now()}`;
    
    await kv.set(profileId, {
      id: profileId,
      ...profile,
      createdAt: new Date().toISOString(),
    });
    
    return c.json({ success: true, id: profileId });
  } catch (error) {
    console.error("Error creating profile:", error);
    return c.json({ error: "Failed to create profile" }, 500);
  }
});

// Delete a parking profile
app.delete("/make-server-c9aa4dc3/profiles/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting profile:", error);
    return c.json({ error: "Failed to delete profile" }, 500);
  }
});

Deno.serve(app.fetch);