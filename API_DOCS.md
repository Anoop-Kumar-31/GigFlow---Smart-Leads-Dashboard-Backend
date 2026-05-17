# GigFlow - Smart Leads Dashboard API Documentation

This document provides detailed information about the REST API endpoints available in the GigFlow backend, including request parameters, query parameters, payloads, and response structures.

## Base URL
`https://gigflow-smart-leads-dashboard-backend-hqz6.onrender.com`

## Authentication

All endpoints except `/auth/login` and `/auth/register` require a valid JWT token in the `Authorization` header.
**Header Format:** `Authorization: Bearer <your_jwt_token>`

---

## 1. Authentication Routes

### 1.1 Register a New User
Create a new user account.

**Endpoint:** `POST /auth/register`
**Authentication:** Not required

**Request Payload (Body):**
```json
{
  "name": "John Doe", // Required, string, 2-50 chars
  "email": "john@example.com", // Required, valid email
  "password": "Password123", // Required, min 8 chars, 1 uppercase, 1 lowercase, 1 number
  "role": "sales_user" // Optional, enum: "admin" | "sales_user"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "_id": "60d0fe4f5311236168a109ca",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "sales_user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 1.2 User Login
Authenticate an existing user and get a JWT token.

**Endpoint:** `POST /auth/login`
**Authentication:** Not required

**Request Payload (Body):**
```json
{
  "email": "john@example.com", // Required, valid email
  "password": "Password123" // Required, string
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "60d0fe4f5311236168a109ca",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "sales_user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 1.3 Get Current User Profile
Retrieve the profile of the currently authenticated user.

**Endpoint:** `GET /auth/profile`
**Authentication:** Required

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "60d0fe4f5311236168a109ca",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "sales_user",
    "createdAt": "2023-10-01T12:00:00Z",
    "updatedAt": "2023-10-01T12:00:00Z"
  }
}
```

---

## 2. Lead Routes

### 2.1 Get All Leads
Retrieve a paginated list of leads. Admins see all leads; sales users see only leads they created.

**Endpoint:** `GET /leads`
**Authentication:** Required

**Query Parameters:**
- `status` (Optional): Filter by status. Enum: `New`, `Contacted`, `Qualified`, `Lost`
- `source` (Optional): Filter by source. Enum: `Website`, `Instagram`, `Referral`
- `search` (Optional): Search term for lead name or email.
- `sortBy` (Optional): Sorting order. Enum: `latest`, `oldest`. Default is usually `latest`.
- `page` (Optional): Page number (e.g., `1`). Default `1`.
- `limit` (Optional): Number of records per page (e.g., `10`). Default `10`.

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Leads retrieved successfully",
  "data": [
    {
      "_id": "60d0fe4f5311236168a109cc",
      "name": "Alice Smith",
      "email": "alice@example.com",
      "status": "New",
      "source": "Website",
      "notes": "Interested in premium plan",
      "createdBy": "60d0fe4f5311236168a109ca",
      "createdAt": "2023-10-01T12:05:00Z",
      "updatedAt": "2023-10-01T12:05:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalRecords": 45,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 2.2 Get Lead by ID
Retrieve details of a specific lead by its ID.

**Endpoint:** `GET /leads/:id`
**Authentication:** Required

**Path Parameters:**
- `id` (Required): The MongoDB ObjectId of the lead.

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Lead retrieved successfully",
  "data": {
    "_id": "60d0fe4f5311236168a109cc",
    "name": "Alice Smith",
    "email": "alice@example.com",
    "status": "New",
    "source": "Website",
    "notes": "Interested in premium plan",
    "createdBy": "60d0fe4f5311236168a109ca",
    "createdAt": "2023-10-01T12:05:00Z",
    "updatedAt": "2023-10-01T12:05:00Z"
  }
}
```

### 2.3 Create a New Lead
Create a new lead. The lead will be assigned to the user creating it.

**Endpoint:** `POST /leads`
**Authentication:** Required

**Request Payload (Body):**
```json
{
  "name": "Alice Smith", // Required, string, 2-100 chars
  "email": "alice@example.com", // Required, valid email
  "status": "New", // Optional, enum: "New" | "Contacted" | "Qualified" | "Lost", Default: "New"
  "source": "Website", // Required, enum: "Website" | "Instagram" | "Referral"
  "notes": "Looking for integration help" // Optional, string, max 500 chars
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Lead created successfully",
  "data": {
    "_id": "60d0fe4f5311236168a109cc",
    "name": "Alice Smith",
    "email": "alice@example.com",
    "status": "New",
    "source": "Website",
    "notes": "Looking for integration help",
    "createdBy": "60d0fe4f5311236168a109ca",
    "createdAt": "2023-10-01T12:05:00Z",
    "updatedAt": "2023-10-01T12:05:00Z"
  }
}
```

### 2.4 Update an Existing Lead
Update an existing lead's details.

**Endpoint:** `PUT /leads/:id`
**Authentication:** Required

**Path Parameters:**
- `id` (Required): The MongoDB ObjectId of the lead.

**Request Payload (Body) (All fields optional):**
```json
{
  "name": "Alice Smith Updated",
  "email": "alice.new@example.com",
  "status": "Contacted",
  "source": "Referral",
  "notes": "Spoke on the phone, very interested"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Lead updated successfully",
  "data": {
    "_id": "60d0fe4f5311236168a109cc",
    "name": "Alice Smith Updated",
    "email": "alice.new@example.com",
    "status": "Contacted",
    "source": "Referral",
    "notes": "Spoke on the phone, very interested",
    "createdBy": "60d0fe4f5311236168a109ca",
    "createdAt": "2023-10-01T12:05:00Z",
    "updatedAt": "2023-10-02T14:30:00Z"
  }
}
```

### 2.5 Delete a Lead
Delete an existing lead. **Only Admins can perform this action.**

**Endpoint:** `DELETE /leads/:id`
**Authentication:** Required (Admin only)

**Path Parameters:**
- `id` (Required): The MongoDB ObjectId of the lead.

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Lead deleted successfully",
  "data": null
}
```

### 2.6 Export Leads to CSV
Download all accessible leads as a CSV file. Admins get all leads; sales users get only their own leads.

**Endpoint:** `GET /leads/export/csv`
**Authentication:** Required

**Success Response (200 OK):**
Returns a file stream with the following headers:
- `Content-Type: text/csv`
- `Content-Disposition: attachment; filename="leads-export-[timestamp].csv"`

## Standard Error Response
If a request fails (due to validation error, not found, unauthorized, etc.), the API returns standard error format.

**Error Response (e.g., 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Server Error):**
```json
{
  "success": false,
  "message": "Validation failed",
  "error": "Email is already in use" // May contain detailed error messages
}
```
