Internship Board

A web application and REST API for managing internship opportunities using Node.js, Express, SQLite, and a simple frontend.

Features

* View all internships and individual internship details
* Create, update, and delete internships
* Search and filter internship opportunities
* Server-side input validation
* Consistent JSON error responses
* SQLite database storage
* Security headers using Helmet
* Rate limiting to reduce excessive requests
* JSON request body limited to 10 KB
* Health check endpoint
* Server request logging

Requirements

* Node.js
* npm

Installation

1. Clone or download this repository.
2. Open a terminal in the project directory.
3. Install dependencies:

npm install

4. Add sample internship data:

npm run seed

5. Start the application:

npm start

Open the application at:

http://localhost:3000

The API runs locally on port 3000.

Health Check

Check the server and database status:

GET /health

Example response:

{
  "status": "healthy",
  "database": "connected"
}

Database Schema

The internships table contains:

Column	Type	Description
id	INTEGER	Primary key, auto-increment
title	TEXT	Internship title
company	TEXT	Company name
location	TEXT	Internship location
domain	TEXT	Internship field
description	TEXT	Internship description

The database table is created automatically when the server starts.

API Endpoints

Method	Endpoint	Description
GET	/api/internships	List all internships
GET	/api/internships/:id	Get one internship
POST	/api/internships	Create an internship
PUT	/api/internships/:id	Update an internship
DELETE	/api/internships/:id	Delete an internship

Example Request

Create an internship using POST /api/internships with this JSON body:

{
  "title": "AI Intern",
  "company": "TechNova",
  "location": "Remote",
  "domain": "Artificial Intelligence",
  "description": "Assist with AI projects."
}

All five fields are required and must be non-empty strings.

Error Handling

The API returns structured JSON errors for invalid IDs, missing records, validation failures, invalid JSON, and unexpected server errors.

Common status codes:

* 200 OK — Request successful
* 201 Created — Internship created
* 400 Bad Request — Invalid input
* 404 Not Found — Internship not found
* 500 Internal Server Error — Unexpected server error

Security

* Helmet sets HTTP security headers.
* Rate limiting is configured for API protection.
* JSON request bodies are limited to 10 KB.
* Input validation is performed on the server.
* Parameterized SQL queries are used for database operations.
* Consistent error responses avoid exposing internal error details.

Testing

The project includes a test report in TEST_REPORT.md.

Manual checks performed include CRUD operations, validation of empty input, the health check endpoint, and basic security headers.

Request Logging

API request logging should be verified in the server console before marking it as fully tested.

License

This project was created as an internship capstone assignment.
Project Submission

Live Application
https://internship-board-5rro.onrender.com
GitHub Repository
https://github.com/tariq964/internship-board
Walkthrough Video
](https://drive.google.com/file/d/1OOBNSTUFiohBqD2PXQ1DF3sGv012nBnR/view)
Test Evidence

See TEST_REPORT.md for test results and the security checklist.
