# Todo Backend

## Configuration

Create a `.env` file in the root directory with the following required variables:

```env
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=your_db_name
DATABASE_URL=postgresql://user:password@localhost:5432/db_name

JWT_SECRET=your_jwt_secret
PORT=3000

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=your_bucket_name
```

## Installation & Running

Once your `.env` file is configured, run the following command to install dependencies and start the containers in detached mode:

```bash
npm i && docker compose up --build -d
```

# **Authentication API Documentation**

Base URL: /api/auth

## **1\. User Registration**

Registers a new user and returns a **JWT access token** upon success.

-   **URL:** /registration
-   **Method:** POST
-   **Content-Type:** multipart/form-data (Required for file upload)

### **Request Body Parameters**

| Field    | Type   | Required | Validation Rules                                         |
| :------- | :----- | :------- | :------------------------------------------------------- |
| email    | String | Yes      | Must match regex: /^\[^\\s@\]+@\[^\\s@\]+\\.\[^\\s@\]+$/ |
| name     | String | Yes      | Minimum 2 characters.                                    |
| password | String | Yes      | Minimum 8 characters; must include letters.              |
| avatar   | File   | No       | Allowed formats: jpg, jpeg, png, gif, webp.              |

### **Responses**

#### **🟢 201 Created**

User successfully registered.  
{  
 "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  
}

#### **🔴 400 Bad Request**

Validation failed.  
{  
 "errors": \[  
 "Invalid email",  
 "Invalid password: minimum 8 characters, must include letters",  
 "Invalid username: minimum 2 characters",  
 "Invalid avatar: allowed formats are jpg, jpeg, png, gif, webp"  
 \]  
}

#### **🔴 409 Conflict**

Duplicate resource.  
{  
 "error": "A user with this email is already registered"  
}

#### **🔴 500 Internal Server Error**

{  
 "error": "Internal server error"  
}

## **2\. User Login**

Authenticates a user and returns a **JWT access token**.

-   **URL:** /login
-   **Method:** POST
-   **Content-Type:** application/json

### **Request Body Parameters**

| Field    | Type   | Required | Validation Rules                                         |
| :------- | :----- | :------- | :------------------------------------------------------- |
| email    | String | Yes      | Must match regex: /^\[^\\s@\]+@\[^\\s@\]+\\.\[^\\s@\]+$/ |
| password | String | Yes      | Minimum 8 characters; must include letters.              |

### **Responses**

#### **🟢 200 OK**

Login successful.  
{  
 "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  
}

#### **🔴 400 Bad Request**

Validation failed.  
{  
 "errors": \[  
 "Invalid email",  
 "Invalid password: minimum 8 characters, must include letters"  
 \]  
}

#### **🔴 401 Unauthorized**

Invalid credentials.  
{  
 "error": "User is not authorized"  
}

#### **🔴 500 Internal Server Error**

{  
 "error": "Internal server error"  
}
