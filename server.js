const express = require("express");
const Database = require("better-sqlite3");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const db = new Database("internships.db");

app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(express.static(__dirname));

app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: {
      code: "RATE_LIMITED",
      message: "Too many requests. Please try again later."
    }
  }
}));

db.exec(`
  CREATE TABLE IF NOT EXISTS internships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    domain TEXT NOT NULL,
    description TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    internship_id INTEGER NOT NULL,
    applicant_name TEXT NOT NULL,
    email TEXT NOT NULL,
    cover_letter TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (internship_id) REFERENCES internships(id)
  );
`);

db.pragma("foreign_keys = ON");

function sendError(res, status, code, message) {
  return res.status(status).json({
    error: { code, message }
  });
}

function validId(value) {
  return /^\d+$/.test(value) && Number(value) > 0;
}

function validateInternship(body) {
  const fields = [
    "title", "company", "location", "domain", "description"
  ];

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Request body must be a JSON object.";
  }

  for (const field of fields) {
    if (typeof body[field] !== "string" || !body[field].trim()) {
      return `${field} is required and must be a non-empty string.`;
    }
    if (body[field].trim().length > 5000) {
      return `${field} is too long.`;
    }
  }

  return null;
}

function validateApplication(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Request body must be a JSON object.";
  }

  if (!Number.isSafeInteger(body.internshipId) || body.internshipId < 1) {
    return "A valid internshipId is required.";
  }

  if (
    typeof body.applicantName !== "string" ||
    body.applicantName.trim().length < 2 ||
    body.applicantName.trim().length > 100
  ) {
    return "Name must contain 2 to 100 characters.";
  }

  if (
    typeof body.email !== "string" ||
    body.email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)
  ) {
    return "A valid email address is required.";
  }

  if (
    typeof body.coverLetter !== "string" ||
    body.coverLetter.trim().length < 20 ||
    body.coverLetter.trim().length > 2000
  ) {
    return "Cover letter must contain 20 to 2000 characters.";
  }

  return null;
}

app.get("/api/internships", (req, res) => {
  const data = db.prepare(
    "SELECT * FROM internships ORDER BY id"
  ).all();

  res.json({ data });
});

app.get("/api/internships/:id", (req, res) => {
  if (!validId(req.params.id)) {
    return sendError(res, 400, "INVALID_ID", "ID must be a positive integer.");
  }

  const data = db.prepare(
    "SELECT * FROM internships WHERE id = ?"
  ).get(Number(req.params.id));

  if (!data) {
    return sendError(res, 404, "NOT_FOUND", "Internship not found.");
  }

  res.json({ data });
});

app.post("/api/internships", (req, res) => {
  const message = validateInternship(req.body);
  if (message) {
    return sendError(res, 400, "VALIDATION_ERROR", message);
  }

  const result = db.prepare(`
    INSERT INTO internships
      (title, company, location, domain, description)
    VALUES
      (@title, @company, @location, @domain, @description)
  `).run(req.body);

  const data = db.prepare(
    "SELECT * FROM internships WHERE id = ?"
  ).get(result.lastInsertRowid);

  res.status(201).json({ data });
});

app.put("/api/internships/:id", (req, res) => {
  if (!validId(req.params.id)) {
    return sendError(res, 400, "INVALID_ID", "ID must be a positive integer.");
  }

  const message = validateInternship(req.body);
  if (message) {
    return sendError(res, 400, "VALIDATION_ERROR", message);
  }

  const id = Number(req.params.id);
  const existing = db.prepare(
    "SELECT id FROM internships WHERE id = ?"
  ).get(id);

  if (!existing) {
    return sendError(res, 404, "NOT_FOUND", "Internship not found.");
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

  const data = db.prepare(
    "SELECT * FROM internships WHERE id = ?"
  ).get(id);

  res.json({ data });
});

app.delete("/api/internships/:id", (req, res) => {
  if (!validId(req.params.id)) {
    return sendError(res, 400, "INVALID_ID", "ID must be a positive integer.");
  }

  const result = db.prepare(
    "DELETE FROM internships WHERE id = ?"
  ).run(Number(req.params.id));

  if (!result.changes) {
    return sendError(res, 404, "NOT_FOUND", "Internship not found.");
  }

  res.json({ message: "Internship deleted successfully." });
});

app.post("/api/applications", (req, res) => {
  const message = validateApplication(req.body);
  if (message) {
    return sendError(res, 400, "VALIDATION_ERROR", message);
  }

  const internship = db.prepare(
    "SELECT id FROM internships WHERE id = ?"
  ).get(req.body.internshipId);

  if (!internship) {
    return sendError(res, 404, "INTERNSHIP_NOT_FOUND", "Internship not found.");
  }

  const result = db.prepare(`
    INSERT INTO applications
      (internship_id, applicant_name, email, cover_letter)
    VALUES (?, ?, ?, ?)
  `).run(
    req.body.internshipId,
    req.body.applicantName.trim(),
    req.body.email.trim().toLowerCase(),
    req.body.coverLetter.trim()
  );

  res.status(201).json({
    message: "Application submitted successfully.",
    applicationId: result.lastInsertRowid
  });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return sendError(res, 400, "INVALID_JSON", "Request body contains invalid JSON.");
  }

  if (err.status === 413) {
    return sendError(res, 413, "PAYLOAD_TOO_LARGE", "Request body is too large.");
  }

  console.error(err.message);
  return sendError(res, 500, "INTERNAL_ERROR", "An unexpected error occurred.");
});

app.listen(PORT, () => {
  console.log(`Internship Board API running on port ${PORT}`);
});
