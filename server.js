const express = require("express");
const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests. Please try again later."
    }
  }
}));

app.use(express.json({ limit: "10kb" }));
app.use(express.static(__dirname));
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});
app.use((req, res, next) => {
  console.log(
    `${new Date().toISOString()} ${req.method} ${req.path}`
  );
  next();
});

const db = new Database("internships.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS internships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    domain TEXT NOT NULL,
    description TEXT NOT NULL
  )
`);

function error(res, status, code, message) {
  return res.status(status).json({
    error: { code, message }
  });
}

function validId(value) {
  return /^\d+$/.test(value) && Number(value) > 0;
}

function validate(body) {
  const fields = [
    "title",
    "company",
    "location",
    "domain",
    "description"
  ];

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Request body must be a JSON object.";
  }

  for (const field of fields) {
    if (typeof body[field] !== "string" || !body[field].trim()) {
      return `${field} is required and must be a non-empty string.`;
    }
  }

  return null;
}

const fields = "title, company, location, domain, description";
app.get("/health", (req, res) => {
  try {
    db.prepare("SELECT 1").get();

    res.status(200).json({
      status: "healthy",
      database: "connected"
    });
  } catch (err) {
    console.error("Health check failed:", err.message);

    res.status(503).json({
      status: "unhealthy",
      database: "unavailable"
    });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "Internship Board API is running." });
});
// List all internships
app.get("/health", (req, res) => {
  try {
    db.prepare("SELECT 1").get();

    res.status(200).json({
      status: "healthy",
      database: "connected"
    });
  } catch (err) {
    console.error("Health check failed:", err.message);

    res.status(503).json({
      status: "unhealthy",
      database: "unavailable"
    });
  }
});
app.get("/api/internships", (req, res) => {
  const data = db.prepare(
    "SELECT * FROM internships ORDER BY id"
  ).all();

  res.json({ data });
});
// Get one internship
app.get("/api/internships/:id", (req, res) => {
  if (!validId(req.params.id)) {
    return error(res, 400, "INVALID_ID", "ID must be a positive integer.");
  }

  const data = db.prepare("SELECT * FROM internships WHERE id = ?")
    .get(Number(req.params.id));

  if (!data) {
    return error(res, 404, "NOT_FOUND", "Internship not found.");
  }

  res.json({ data });
});

// Create an internship
app.post("/api/internships", (req, res) => {
  const message = validate(req.body);
  if (message) {
    return error(res, 400, "VALIDATION_ERROR", message);
  }

  const result = db.prepare(`
    INSERT INTO internships (${fields})
    VALUES (@title, @company, @location, @domain, @description)
  `).run(req.body);

  const data = db.prepare("SELECT * FROM internships WHERE id = ?")
    .get(result.lastInsertRowid);

  res.status(201).json({ data });
});

// Update an internship
app.put("/api/internships/:id", (req, res) => {
  if (!validId(req.params.id)) {
    return error(res, 400, "INVALID_ID", "ID must be a positive integer.");
  }

  const message = validate(req.body);
  if (message) {
    return error(res, 400, "VALIDATION_ERROR", message);
  }

  const id = Number(req.params.id);
  const existing = db.prepare("SELECT id FROM internships WHERE id = ?").get(id);

  if (!existing) {
    return error(res, 404, "NOT_FOUND", "Internship not found.");
  }

  db.prepare(`
    UPDATE internships
    SET title = @title,
        company = @company,
        location = @location,
        domain = @domain,
        description = @description
    WHERE id = @id
  `).run({ ...req.body, id });

  const data = db.prepare("SELECT * FROM internships WHERE id = ?").get(id);
  res.json({ data });
});

// Delete an internship
app.delete("/api/internships/:id", (req, res) => {
  if (!validId(req.params.id)) {
    return error(res, 400, "INVALID_ID", "ID must be a positive integer.");
  }

  const result = db.prepare("DELETE FROM internships WHERE id = ?")
    .run(Number(req.params.id));

  if (result.changes === 0) {
    return error(res, 404, "NOT_FOUND", "Internship not found.");
  }

  res.json({ message: "Internship deleted successfully." });
});

// Handle invalid JSON and other errors consistently
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return error(res, 400, "INVALID_JSON", "Request body contains invalid JSON.");
  }

  console.error(err);
  return error(res, 500, "INTERNAL_ERROR", "An unexpected error occurred.");
});

app.listen(PORT, () => {
  console.log(`Internship Board API running on port ${PORT}`);
});
