# Smart Leads Dashboard - Backend Architecture & Codebase Guide 🚀

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=nodedotjs&logoColor=white&style=for-the-badge)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white&style=for-the-badge)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Cluster-47A248?logo=mongodb&logoColor=white&style=for-the-badge)](https://www.mongodb.com/)
[![Mongoose](https://img.shields.io/badge/Mongoose-9.x-880000?logo=mongoose&logoColor=white&style=for-the-badge)](https://mongoosejs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white&style=for-the-badge)](https://www.typescriptlang.org/)
[![Zod](https://img.shields.io/badge/Zod-Validation-3E67B1?logo=zod&logoColor=white&style=for-the-badge)](https://zod.dev/)
[![JWT](https://img.shields.io/badge/JWT-Secure-000000?logo=json-web-tokens&logoColor=white&style=for-the-badge)](https://jwt.io/)
[![Bcrypt](https://img.shields.io/badge/Bcrypt-Hash-000000?style=for-the-badge)](https://www.npmjs.com/package/bcryptjs)

Welcome to the backend documentation for the **Smart Leads Dashboard**! This document is designed specifically for **Reviewers and Developers** to understand the "why" and "how" of this backend. It provides a deep dive into the architecture, the flow of data, and the specific responsibilities of every file and folder in the `src` directory.

We have built this backend with **Scalability, Security, and Maintainability** in mind, adhering strictly to the **Controller-Service-Route** architecture pattern.

---

## 🛠 Technology Stack & Decisions

- **Node.js & Express.js**: Chosen for its lightweight nature and massive ecosystem. We use Express `5.x`, taking advantage of modern routing capabilities.
- **TypeScript**: Used rigorously across the entire codebase. Interfaces and Types dictate the shape of all data, ensuring we catch errors at compile-time rather than run-time.
- **MongoDB & Mongoose**: Selected for flexible schema design. Mongoose acts as our ODM, allowing us to build robust schemas with built-in validation, indexing, and lifecycle hooks.
- **Zod**: Replaces traditional validation libraries (like Joi/express-validator). Zod provides a highly readable, chainable API for schema validation and seamlessly infers TypeScript types.
- **JWT & Bcrypt.js**: Industry standards for stateless authentication and secure password hashing.
- **Security Middlewares**: We implement `helmet` for HTTP header security and `cors` for cross-origin resource sharing protection.

---

## 📂 Architecture Overview: The "Controller-Service" Pattern

To prevent "fat controllers" and spaghetti code, this application strictly separates HTTP concerns from business logic.

1. **Routes**: Define the endpoint URLs and apply middlewares (Auth, Validation).
2. **Controllers**: Purely responsible for HTTP interactions (Extracting `req.body`, `req.user`, sending `res.status`).
3. **Services**: The "Brain" of the app. This is where database interactions, data manipulation, and complex business rules live.
4. **Data Access (Models)**: Mongoose schemas interacting directly with MongoDB.

---

## 📂 Directory Structure

The backend follows a modular, feature-based architecture pattern. Here is the high-level breakdown of the `src/` directory:

```text
src/
├── app.ts                 # Main Express application setup and middleware wiring
├── config/                # Environment variables and database connections
├── controllers/           # Request handlers that orchestrate the response logic
├── middleware/            # Custom functions running between request and response (Auth, Error handling)
├── models/                # Mongoose database schemas and instance methods
├── routes/                # API route definitions and controller mapping
├── services/              # Core business logic (keeps controllers thin)
├── types/                 # TypeScript interfaces and enums (Data contracts)
├── utils/                 # Reusable, stateless helper functions
└── validators/            # Zod validation schemas for request bodies/params
```

---

## 🔍 Deep Dive into Components

### 1. Configuration & Setup (`/config` & `app.ts`)
- **`app.ts`**: The main entry point. It wires up security middleware (`helmet`, `cors`), sets up request logging (`morgan`), parses incoming JSON, maps the API routes, and importantly, registers the global `errorHandler` at the very end.
- **`config/env.ts`**: **Fail-Fast Environment Loading**. Instead of accessing `process.env` randomly, this file centralizes it. It parses, validates, and exports a strongly typed `env` object. If `JWT_SECRET` or `MONGODB_URI` is missing, the application will crash on startup, preventing silent failures in production.
- **`config/db.ts`**: Establishes the asynchronous connection to the MongoDB cluster.

### 2. Data Models (`/models`)
We use Mongoose schemas to enforce data integrity at the database level.
- **`User.model.ts`**: 
  - **Security hook**: We use a `pre('save')` hook. Whenever a user is created or their password changes, Mongoose intercepts the save operation and hashes the password using `bcryptjs` with `BCRYPT_SALT_ROUNDS`.
  - **Query exclusion**: The `password` field has `select: false`, meaning accidental `UserModel.find()` calls will *never* leak passwords to the frontend.
  - **Methods**: Contains a `.comparePassword()` instance method to securely verify login attempts.
- **`Lead.model.ts`**:
  - Contains fields for `name`, `email`, `status` (Enum), `source` (Enum), and a reference to the `User` who created it (`createdBy`).
  - **Performance Optimization**: We implemented several indexes:
    - `LeadSchema.index({ status: 1, source: 1 })` for fast filtering.
    - `LeadSchema.index({ name: 'text', email: 'text' })` for lightning-fast text-based searches.

### 3. Business Logic (`/services`)
This is where the actual work happens. Controllers simply call these methods.
- **`auth.service.ts`**: 
  - `register`: Checks for duplicate emails, creates the user, and immediately generates a JWT for seamless login.
  - `login`: Fetches the user (explicitly including the hidden password field), runs the bcrypt comparison, and returns a token.
- **`lead.service.ts`**: 
  - **Advanced Querying (`getLeads`)**: This method is a powerhouse. It dynamically builds a MongoDB query object based on frontend filters (`status`, `source`, `search`). It handles regex-based searching across names and emails.
  - **Pagination**: Implements robust server-side pagination using `.skip()` and `.limit()`, calculating `totalPages` and returning a detailed `PaginationMeta` object.
  - **Role-Based Data Access**: Every method (get, update, delete) takes an `isAdmin` boolean. If the user is *not* an admin, the service automatically injects `{ createdBy: userId }` into the database query. This ensures a standard sales user can **never** access, update, or delete a lead belonging to someone else, enforcing strict tenant isolation.

### 4. HTTP Controllers (`/controllers`)
Controllers are kept intentionally thin. They try/catch errors and pass them to the `next()` middleware.
- **`auth.controller.ts`**: Handles `/register`, `/login`, and `/profile`. Uses `sendSuccess` to format the output.
- **`lead.controller.ts`**: Extracts query params, body data, and the authenticated user's ID/Role from `req.user`. It determines if the user is an admin via a helper function `isAdminUser(req.user.role)` and passes that context to the Service layer.

### 5. Middleware Ecosystem (`/middleware`)
Middlewares are the gatekeepers of the application.
- **`auth.middleware.ts` (`authenticate`)**: Intercepts requests, extracts the Bearer token, verifies it using `jwt.utils.ts`, and decodes it. Crucially, it extends the Express `Request` object to include `req.user` (containing `userId`, `email`, `role`), which is then heavily utilized by Controllers.
- **`role.middleware.ts` (`authorize`)**: A factory function taking an array of allowed roles (e.g., `authorize(UserRole.ADMIN)`). It checks `req.user.role` (set by the auth middleware) and blocks unauthorized access with a `403 Forbidden` response.
- **`validate.middleware.ts`**: The Zod integration point. It takes a Zod schema and parses the incoming request (`body`, `query`, `params`). If the payload is invalid, it catches the `ZodError`, maps it into a readable array of `{ field, message }`, and immediately returns a `400 Bad Request`. This ensures controllers *only* ever receive perfectly formatted data.
- **`error.middleware.ts`**: The global safety net. Instead of crashing the server, any error passed to `next(error)` ends up here. It smartly parses specific Mongoose errors:
  - `11000`: Transforms duplicate key errors into `409 Conflict`.
  - `ValidationError`: Transforms schema violations into `400 Bad Request`.
  - `CastError`: Handles invalid MongoDB ObjectIds cleanly.

### 6. Validation Schemas (`/validators`)
Using Zod, we define the exact shape of incoming data. This acts as our first line of defense against bad data.
- **`auth.validator.ts`**: Enforces strict password policies (min length, requires uppercase, lowercase, number) and validates email formats.
- **`lead.validator.ts`**: Ensures that properties like `status` and `source` only accept predefined enums. It also validates pagination queries (`page`, `limit`) ensuring they are strings containing only digits before parsing them.

### 7. Core Utilities (`/utils`)
These are pure, stateless functions that perform single, specific tasks.
- **`response.utils.ts`**: The key to our consistent API. It exposes `sendSuccess`, `sendError`, and `sendPaginated`. Every single API endpoint uses these formatters to ensure the frontend always receives the exact same JSON contract (`{ success, message, data }`).
- **`jwt.utils.ts`**: Encapsulates `jsonwebtoken` logic, ensuring tokens are signed with the correct `JWT_SECRET` and expiration times defined in `env.ts`.
- **`csv.utils.ts`**: Contains `convertLeadsToCSV`. It maps over an array of `Lead` documents, safely wraps fields in quotes (to handle commas inside notes), and constructs a raw string formatted as a valid CSV file for the export endpoint.

### 8. Routing (`/routes`)
- **`index.ts`**: Mounts the routers.
- **`auth.routes.ts`**: Defines the public endpoints (`register`, `login`) and applies the Zod validation middleware *before* the controller.
- **`lead.routes.ts`**: An excellent example of middleware chaining. 
  - First, `router.use(authenticate)` is applied globally to protect all lead routes.
  - Endpoints like `POST /` apply `validate(createLeadSchema)` to ensure the payload is correct.
  - The `DELETE /:id` endpoint chains `authorize(UserRole.ADMIN)` to ensure only administrators can trigger destructive actions.

---

## 💻 Local Setup

To run the backend locally:

1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Environment Variables:**
   Create a `.env` file in the `backend` root based on `.env.example`.
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/gigflow
   JWT_SECRET=your_super_secret_jwt_key_here
   ```
3. **Start Development Server:**
   ```bash
   npm run dev
   ```
   The backend API will be available at `http://localhost:5000`.

---

## 🚦 The Lifecycle of a Request (Step-by-Step)

To give the Reviewer a clear picture, here is the exact execution flow when a user attempts to **Update a Lead** (`PUT /api/leads/:id`):

1. **Client Request**: The frontend sends a `PUT /api/leads/12345` with `{ "status": "Qualified" }` and a Bearer Token.
2. **`app.ts`**: Request enters Express, passes through `helmet`, `cors`, and `express.json()`.
3. **`lead.routes.ts`**: Matches the `PUT /:id` route.
4. **Middleware 1 (`auth.middleware.ts`)**: Extracts the token, verifies it. Attaches `{ userId: 'user-id', role: 'sales_user' }` to `req.user`. Calls `next()`.
5. **Middleware 2 (`validate.middleware.ts`)**: Parses `req.body` against `updateLeadSchema`. Validates that "Qualified" is a valid Enum. Validates that `req.params.id` exists. Calls `next()`.
6. **Controller (`lead.controller.ts`)**: The `updateLead` function executes. It reads `req.params.id`, `req.body`, and `req.user`. Determines `isAdmin = false`. Calls `leadService.updateLead()`.
7. **Service (`lead.service.ts`)**: Builds the database query. Because `isAdmin = false`, it forces the query to be `{ _id: '12345', createdBy: 'user-id' }`. It executes `findOneAndUpdate`.
   - *If the lead belongs to someone else, no document is found. Service throws a 404 error.*
8. **Controller**: Receives the updated lead document. Calls `sendSuccess(res, lead, 'Lead updated successfully')`.
9. **Utility (`response.utils.ts`)**: Formats the final JSON and sends the `200 OK` response to the client.

*(If an error occurred at any step, `next(error)` would push it to `error.middleware.ts` where it is formatted and returned cleanly without crashing the server).*
