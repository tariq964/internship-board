const Database = require("better-sqlite3");
const fs = require("fs");

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

const count = db.prepare("SELECT COUNT(*) AS total FROM internships").get();

if (count.total === 0) {
  const insert = db.prepare(`
    INSERT INTO internships
      (title, company, location, domain, description)
    VALUES (?, ?, ?, ?, ?)
  `);

  const internships = [
    ["AI Intern", "TechNova", "Remote", "Artificial Intelligence", "Assist with machine learning experiments and AI prototypes."],
    ["Data Science Intern", "DataWorks", "Jaipur, India", "Data Science", "Analyze datasets and prepare reports using Python."],
    ["Web Development Intern", "CodeCraft", "Remote", "Web Development", "Help build and test web applications."],
    ["Python Intern", "BrightLabs", "Delhi, India", "Software Development", "Write Python scripts and assist with backend tasks."],
    ["Cybersecurity Intern", "SecureNet", "Remote", "Cybersecurity", "Support basic security testing and documentation."]
  ];

  const seed = db.transaction((rows) => {
    for (const row of rows) insert.run(...row);
  });

  seed(internships);
}

console.log("Seed data added successfully.");
db.close();