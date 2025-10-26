# Country Currency & Exchange API

A RESTful API that fetches country data from external APIs, stores it in a database, and provides CRUD operations with currency exchange rate calculations and GDP estimation.

## Features

- **Country Data Management**: Fetch, store, and manage country information
- **Currency Exchange Integration**: Real-time exchange rate data from external APIs
- **GDP Estimation**: Calculate estimated GDP using population and exchange rates
- **Image Generation**: Generate summary images with country statistics
- **CRUD Operations**: Full Create, Read, Update, Delete functionality
- **Filtering & Sorting**: Query countries by region, currency, and sort by GDP
- **Robust Error Handling**: Individual country error handling

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MySQL
- **Query Builder**: Knex.js
- **Validation**: Joi
- **Image Processing**: Canvas API & Sharp
- **HTTP Client**: Axios

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- npm or yarn
- MySQL database (local or remote)

## Installation

1. **Clone the repository**

   ```bash
   git clone <https://github.com/Praiz001/hng_stage2>
   cd stage_2
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory and add the following variables:

   ```env
   # Server Configuration
   PORT=4000
   NODE_ENV=development

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_mysql_username
   DB_PASS=your_mysql_password
   DB_NAME=your_database_name

   # SSL Configuration (optional, for cloud databases)
   DB_SSL_CA=/path/to/certificate.crt

   # CORS Configuration (optional)
   CORS_ORIGIN=*
   ```

4. **Create the database**

   ```bash
   # Connect to MySQL and create the database
   mysql -u root -p
   CREATE DATABASE your_database_name;
   ```

5. **Run database migrations**
   ```bash
   npm run migrate
   ```
   This will create the necessary tables in your database.

## Running the Application

### Development Mode

Run the application in development mode with auto-reload:

```bash
npm run dev
```

### Production Mode

1. Build the TypeScript code:

   ```bash
   npm run build
   ```

2. Start the server:
   ```bash
   npm start
   ```

The server will start on `http://localhost:4000` (or the port specified in your `.env` file).

## API Endpoints

### 1. Refresh Countries Data

**POST** `/countries/refresh`

Fetches latest country data from external APIs, calculates exchange rates and GDP estimates, and stores them in the database.

**Response:**

```json
{
  "status": "success",
    "message": "Countries data refreshed successfully"
}
```

### 2. Get All Countries

**GET** `/countries`

Retrieve all countries with optional filters and sorting.

**Query Parameters:**

- `region` (optional): Filter countries by region (e.g., "Europe", "Africa")
- `currency` (optional): Filter countries by currency code (e.g., "USD", "EUR")
- `sort` (optional): Sort countries by GDP in descending order (value: "gdp_desc")

**Example:**

```bash
GET /countries?region=Europe&sort=gdp_desc
GET /countries?currency=USD
```

**Response:**

```json
[
  {
    "id": 1,
    "name": "United States",
    "capital": "Washington, D.C.",
    "region": "Americas",
    "population": 328239523,
    "currency_code": "USD",
    "exchange_rate": 1.0,
    "estimated_gdp": 3282395230,
    "flag_url": "https://flagcdn.com/us.svg",
    "last_refreshed_at": "2024-01-15T10:30:00.000Z"
  }
]
```

### 3. Get Country by Name

**GET** `/countries/:name`

Retrieve specific country details by name.

**Example:**

```bash
GET /countries/United States
```

**Response:**

```json
{
  "id": 1,
  "name": "United States",
  "capital": "Washington, D.C.",
  "region": "Americas",
  "population": 328239523,
  "currency_code": "USD",
  "exchange_rate": 1.0,
  "estimated_gdp": 3282395230,
  "flag_url": "https://flagcdn.com/us.svg",
  "last_refreshed_at": "2024-01-15T10:30:00.000Z"
}
```

### 4. Delete Country

**DELETE** `/countries/:name`

Delete a country from the database by name.

**Example:**

```bash
DELETE /countries/United States
```

**Response:**

```json
{
  "status": success,
  "message": "Country deleted successfully"
}
```

### 5. Get Summary Image

**GET** `/countries/image`

Returns a PNG image showing country data summary including total countries and top 5 GDP countries.

**Response:** Binary PNG image

### 6. Get Global Refresh Status

**GET** `/status`

Get the status of the last global data refresh.

**Response:**

```json
{
  "last_refreshed_at": "2024-01-15T10:30:00.000Z",
  "total_countries": 195
}
```

## External APIs

The application uses the following external APIs:

1. **REST Countries API** (`https://restcountries.com`)

   - Fetches country data including name, capital, region, population, and flag

2. **Exchange Rate API** (`https://open.er-api.com`)
   - Fetches currency exchange rates for GDP calculations

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run migrate` - Run database migrations

## Environment Variables

### Required Variables

- `DB_HOST` - MySQL database host
- `DB_PORT` - MySQL database port (default: 3306)
- `DB_USER` - MySQL username
- `DB_PASS` - MySQL password
- `DB_NAME` - MySQL database name

### Optional Variables

- `PORT` - Server port (default: 4000)
- `NODE_ENV` - Environment mode (default: development)
- `CORS_ORIGIN` - CORS allowed origins (default: \*)
- `DB_SSL_CA` - Path to SSL certificate file (for cloud databases)

## Dependencies

### Production Dependencies

- `axios` - HTTP client for external API calls
- `canvas` - Canvas API for image generation
- `cors` - CORS middleware
- `dotenv` - Environment variable management
- `express` - Web framework
- `joi` - Schema validation
- `knex` - SQL query builder
- `mysql2` - MySQL driver
- `sharp` - Image processing

### Development Dependencies

- `@types/cors` - TypeScript types for CORS
- `@types/express` - TypeScript types for Express
- `@types/node` - TypeScript types for Node.js
- `nodemon` - Development server with hot reload
- `ts-node` - TypeScript execution for Node.js
- `typescript` - TypeScript compiler

## Error Handling

The API provides comprehensive error handling:

- Individual country errors don't stop the entire refresh process
- Validation errors for invalid query parameters
- Proper HTTP status codes
- Detailed error messages in responses

## Validation

The API validates:

- Query parameters (region, currency, sort)
- Data types and formats
- Country names and identifiers
- External API responses

## Notes

- The application fetches data from external APIs and may be rate-limited
- First-time refresh may take several minutes depending on the number of countries
- Exchange rates and GDP estimates are calculated using the latest available data
- The summary image is generated and cached in the `cache/` directory

## License

ISC
