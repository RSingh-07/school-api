# School API

A simple REST API to add schools and list them by distance.

## Tech Stack
- Node.js with Express.js
- MySQL database
- Postman for API testing

---

## Setup Instructions

### 1. Install dependencies
bash
npm install

### 2. Import the database
bash
mysql -u root -p < schooldb.sql
### 3. Create a .env file
bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=schooldb
DB_PORT=3306
PORT=3000

Replace yourpassword with your MySQL root password.

### Running the Server
Development mode:
npm run dev

Production mode:
bash
npm start

## API Endpoints
POST /addSchool
Add a new school.

Request Body (JSON):
{
  "name": "Green Valley School",
  "address": "123 Green Street",
  "latitude": 19.0760,
  "longitude": 72.8777
}

### GET /listSchools?lat=19.1&lng=72.9
Retrieve all schools sorted by distance from the given latitude and longitude.

Postman Collection
Import postman_collection.json into Postman to test the API.

---

## Deployment Disclaimer
This project is currently not deployed on a live cloud server due to the unavailability of free cloud-based MySQL database services that meet the project requirements.

The entire API and database are designed and tested to run locally on your machine using a local MySQL installation.

### To run and test the project:
Install MySQL locally and import the provided database dump (schooldb_schools.sql).

Configure the .env file with your local database credentials.

Start the Node.js server using node server.js.

Use the included Postman collection to test the API endpoints.

Thank you for your understanding.
