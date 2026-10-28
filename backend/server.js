require("dotenv").config();
const path = require("path");
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { supabase } = require("./supabase");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "20kb" }));
app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." }
}));
app.use(express.static(path.join(__dirname, "..", "frontend")));

const allowedCategories = new Set([
  "Lighting", "Road hazard", "Crowding", "Helpful resource", "Other"
]);

function cleanString(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function requireDatabase(req, res, next) {
  if (!supabase) {
    return res.status(503).json({
      error: "Database is not configured yet. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to backend/.env, then restart the server."
    });
  }
  next();
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "Smart Safety Navigator", databaseConfigured: Boolean(supabase) });
});

app.post("/api/journey-plan", (req, res) => {
  const from = cleanString(req.body?.from, 120);
  const to = cleanString(req.body?.to, 120);
  const preference = cleanString(req.body?.preference, 30);
  if (!from || !to) return res.status(400).json({ error: "Starting point and destination are required." });
  if (from.length < 2 || to.length < 2) return res.status(400).json({ error: "Please enter a little more detail for both locations." });

  const preferenceTips = {
    daylight: [
      "Consider well-lit streets and places with other people around.",
      "Check your route and transport options before leaving.",
      "If a place feels unsafe, consider changing plans and asking a trusted person for help."
    ],
    public: [
      "Check official public transport routes and operating times.",
      "Prefer recognised, staffed transport stops when available.",
      "Keep an alternative transport option in mind."
    ],
    familiar: [
      "Consider a familiar route and identify an alternative.",
      "Check current travel information from reliable local sources.",
      "Let someone you trust know your plan when appropriate."
    ]
  };
  res.json({
    from,
    to,
    preference: preferenceTips[preference] ? preference : "daylight",
    message: "Here are general preparation suggestions for your journey. This app does not check live maps, traffic, crime reports, or real-time safety.",
    tips: preferenceTips[preference] || preferenceTips.daylight
  });
});

app.get("/api/reports", requireDatabase, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("safety_reports")
      .select("id, area, category, description, created_at")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    res.json({ reports: data || [] });
  } catch (error) {
    next(error);
  }
});

app.post("/api/reports", requireDatabase, async (req, res, next) => {
  try {
    const area = cleanString(req.body?.area, 120);
    const category = cleanString(req.body?.category, 40);
    const description = cleanString(req.body?.description, 1000);

    if (area.length < 2) return res.status(400).json({ error: "Area must contain at least 2 characters." });
    if (!allowedCategories.has(category)) return res.status(400).json({ error: "Please choose a valid report category." });
    if (description.length < 5) return res.status(400).json({ error: "Description must contain at least 5 characters." });

    const { data, error } = await supabase
      .from("safety_reports")
      .insert({ area, category, description, status: "published" })
      .select("id, area, category, description, created_at")
      .single();
    if (error) throw error;
    res.status(201).json({ report: data });
  } catch (error) {
    next(error);
  }
});

app.use("/api", (req, res) => res.status(404).json({ error: "API endpoint not found." }));

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({ error: "Request body must be valid JSON." });
  }
  console.error("Request failed:", error.message);
  res.status(500).json({ error: "The server could not complete the request. Check server logs for details." });
});

app.listen(PORT, () => {
  console.log(`Smart Safety Navigator running at http://localhost:${PORT}`);
  console.log(`Database configured: ${Boolean(supabase)}`);
});
