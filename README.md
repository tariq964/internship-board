Internship Board API



A REST API for managing internship opportunities using Node.js, Express, and SQLite.



Features



\* Get all internships

\* Get an internship by ID

\* Create a new internship

\* Update an internship

\* Delete an internship

\* Input validation and consistent error responses

\* SQLite database storage



Requirements



\* Node.js

\* npm



Installation



Clone or download this repository, then open its folder in the terminal.



Install dependencies:



npm install



Add sample internship data:



npm run seed



Start the API server:



npm start



The server runs at http://localhost:3000.



Database Schema



The internships table contains:



Column	Type	Description

id	INTEGER	Primary key, auto-increment

title	TEXT	Internship title

company	TEXT	Company name

location	TEXT	Internship location

domain	TEXT	Internship field

description	TEXT	Internship description



The database is created automatically when the server starts.



API Endpoints



Method	Endpoint	Description

GET	/api/internships	List all internships

GET	/api/internships/:id	Get one internship

POST	/api/internships	Create an internship

PUT	/api/internships/:id	Update an internship

DELETE	/api/internships/:id	Delete an internship



Example Request



Create an internship using POST /api/internships with JSON:



{

&#x20; "title": "AI Intern",

&#x20; "company": "TechNova",

&#x20; "location": "Remote",

&#x20; "domain": "Artificial Intelligence",

&#x20; "description": "Assist with AI projects."

}



All five fields are required and must be non-empty strings.



Error Handling



The API returns appropriate HTTP status codes and JSON error responses for invalid IDs, missing records, validation errors, invalid JSON, and unexpected server errors.



