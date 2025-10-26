# HNG Stage 1 – String Analyzer API

A REST API for analyzing and querying strings with in-memory storage. Supports validation, filtering, and natural-language-style filters.

## Features

- Analyze and store strings (palindrome, length, word count, SHA-256, frequency map)
- Get a single string by value
- List and filter all strings via query params
- Natural language filter parsing (e.g., "single word palindromic")

## Tech Stack

- Node.js, Express, TypeScript
- Joi (validation)
- CORS
- Knex + pg (prepared, optional; currently not used)
- Axios (HTTP helper, optional)

## Requirements

- Node.js 18+ (recommended)
- npm 9+

## Setup

### 1) Clone and install

```bash
git clone https://github.com/Praiz001/hng_stage1/
cd stage_1
npm install
```

### 2) Environment variables

Create a `.env` file in the project root:

```bash
# Server
PORT=4000
CORS_ORIGIN=*

# Optional
# DATABASE_URL=postgres://user:password@host:5432/dbname
```

### 3) Run locally

- **Dev (watch):**
```bash
npm run dev
```

- **Build and start:**
```bash
npm run build
npm start
```

Server runs on http://localhost:4000 by default.

## Scripts

- `npm run dev`: Start with nodemon (ts-node)
- `npm run build`: Compile TypeScript to `dist/`
- `npm start`: Run compiled server from `dist/`
- `npm run migrate`: Run Knex migrations (if DB is enabled)

## API

Base URL: `http://localhost:${PORT}` (default 4000)

### 1) Analyze and store a string

**POST** `/strings`

- **Body:**
```json
{ "value": "racecar" }
```

- **Success:** 201 Created
- **Errors:**
  - 400 Bad Request: Invalid request body or missing "value" field
  - 422 Unprocessable Entity: Invalid data type for "value" (must be string)

### 2) Get a string by value

**GET** `/strings/:string_value`

- **Example:** `/strings/racecar`
- **Success:** 200 OK
- **Errors:**
  - 400 Bad Request (if param is not a string)
  - 404 Not Found

### 3) Get all strings with filtering

**GET** `/strings?is_palindrome=true&min_length=5&max_length=20&word_count=2&contains_character=a`

- **Query params:**
  - `is_palindrome`: boolean (true/false)
  - `min_length`: integer
  - `max_length`: integer
  - `word_count`: integer
  - `contains_character`: string (1 char)

- **Success:** 200 OK
- **Empty:** 204 No Content (returns `{ data: [] }`)
- **Error:** 400 Bad Request (invalid parameter values or unexpected parameters)

### 4) Filter by natural language

**GET** `/strings/filter-by-natural-language?query=single%20word%20palindromic%20strings`

- **Examples that should parse:**
  - `single word palindromic`
  - `longer than 10 characters`
  - `palindromic strings that contain the first vowel`
  - `containing the letter z`

- **Conflicts result in:**  422 Unprocessable Entity
- **Unable to parse query result in:**  400 Bad Request

### 5) Delete a string by value

**DELETE** `/strings/:string_value`

- **Success:** 204 No Content
- **Errors:** 400, 404

## Curl Examples

- **Analyze a string:**
```bash
curl -X POST http://localhost:4000/strings \
  -H "Content-Type: application/json" \
  -d '{"value":"racecar"}'
```

- **Get by value:**
```bash
curl http://localhost:4000/strings/racecar
```

- **Filtered list:**
```bash
curl "http://localhost:4000/strings?is_palindrome=true&min_length=5"
```

- **Natural language filter:**
```bash
curl "http://localhost:4000/strings/filter-by-natural-language?query=single%20word%20palindromic%20strings"
```

## Dependencies

- **Runtime:**
  - express, cors, dotenv, joi, axios
  - knex, pg (optional if you enable DB)

- **Dev:**
  - typescript, ts-node, nodemon
  - @types/node, @types/express, @types/cors

**Install (already in package.json):**
```bash
npm install
```

## Project Structure

- `src/app.ts`: Express app and middleware
- `src/server.ts`: Server bootstrap
- `src/routes/index.ts`: Route definitions
- `src/controllers/index.ts`: Controllers
- `src/utils/stringAnalyzer.ts`: Utility functions and NL query parsing
- `src/services/index.ts`: In-memory data operations

## Notes

- Storage is in-memory (data resets on restart)
- Route order matters; specific routes come before parameterized ones