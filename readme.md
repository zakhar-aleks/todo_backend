# Todo Backend

## Configuration

Create a `.env` file in the root directory with the following required variables:

```env
DATABASE_URL=file:./dev.db

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
npm i && docker compose up --build -d && npx prisma migrate dev
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

# **Profile Management API**

### **Get user profile**

**Method:** `GET` **Endpoint:** `/api/users/me` **Protected resource:** Yes

#### **Responses**

🟢 **200 OK**

User profile retrieved successfully.

JSON  
{  
 "email": "string",  
 "name": "string",  
 "avatar": "string (link)"  
}

🔴 **401 Unauthorized**

JSON  
{  
 "error": "User is not authorized"  
}

🔴 **500 Internal Server Error**

JSON  
{  
 "error": "Internal server error"  
}

---

### **Update Profile**

**Method:** `PUT` **Endpoint:** `/api/users/me` **Protected resource:** Yes

#### **Request Body Parameters**

| Field  | Type   | Required | Validation Rules                            |
| :----- | :----- | :------- | :------------------------------------------ |
| name   | String | Yes      | Minimum 2 characters.                       |
| avatar | File   | No       | Allowed formats: jpg, jpeg, png, gif, webp. |

#### **Responses**

🟢 **200 OK**

Profile updated successfully.

JSON  
{  
 "email": "string",  
 "name": "string",  
 "avatar": "string (link)"  
}

🔴 **400 Bad Request**

Validation failed.

JSON  
{  
 "errors": \[  
 "Invalid username: minimum 2 characters",  
 "Invalid avatar: allowed formats are jpg, jpeg, png, gif, webp"  
 \]  
}

🔴 **401 Unauthorized**

JSON  
{  
 "error": "User is not authorized"  
}

🔴 **500 Internal Server Error**

JSON  
{  
 "error": "Internal server error"  
}

---

### **Delete avatar**

**Method:** `DELETE` **Endpoint:** `/api/users/me/avatar` **Protected resource:** Yes

#### **Responses**

🟢 **200 OK**

Avatar deleted successfully.

JSON  
{  
 "deleted": true  
}

🔴 **401 Unauthorized**

JSON  
{  
 "error": "User is not authorized"  
}

🔴 **500 Internal Server Error**

JSON  
{  
 "error": "Internal server error"  
}

# **Task Management API**

### **Get Tasks**

**Method:** GET **Endpoint:** /api/tasks **Protected resource:** Yes

#### **Responses**

🟢 **200 OK**

Tasks retrieved successfully.

JSON  
\[  
 {  
 "id": "12345",  
 "title": "Complete Project Report",  
 "description": "Finalize the Q4 analysis",  
 "done": false,  
 "files": \[  
 {  
 "id": "f1",  
 "image": "https://api.example.com/uploads/chart.png"  
 },  
 {  
 "id": "f2",  
 "image": "https://api.example.com/uploads/data.csv"  
 }  
 \]  
 }  
\]

🔴 **401 Unauthorized**

JSON  
{  
 "error": "User is not authorized"  
}

🔴 **500 Internal Server Error**

JSON  
{  
 "error": "Internal server error"  
}

---

### **Create Task**

**Method:** POST **Endpoint:** /api/tasks **Protected resource:** Yes

#### **Request Body Parameters**

| Field       | Type     | Required | Validation Rules                            |
| :---------- | :------- | :------- | :------------------------------------------ |
| title       | String   | Yes      | Minimum 2 characters.                       |
| description | String   | No       | Task details.                               |
| files       | File\[\] | No       | Allowed formats: jpg, jpeg, png, gif, webp. |

####

#### **Responses**

🟢 **201 Created**

Task created successfully.

JSON  
{  
 "id": "67890",  
 "title": "New Design Draft",  
 "description": "Mockups for the landing page",  
 "done": false,  
 "files": \[  
 {  
 "id": "f3",  
 "image": "https://api.example.com/uploads/mockup.jpg"  
 }  
 \]  
}

🔴 **400 Bad Request**

Validation failed.

JSON  
{  
 "errors": \[  
 "Invalid title: minimum 2 characters",  
 "Invalid files: allowed formats are jpg, jpeg, png, gif, webp"  
 \]  
}

🔴 **401 Unauthorized**

JSON  
{  
 "error": "User is not authorized"  
}

🔴 **500 Internal Server Error**

JSON  
{  
 "error": "Internal server error"  
}

---

### **Delete Task**

**Method:** DELETE **Endpoint:** /api/tasks/{taskId} **Protected resource:** Yes

#### **Responses**

🟢 **200 OK**

Task deleted successfully.

JSON  
{  
 "deleted": true  
}

🔴 **400 Bad Request**

Validation failed.

JSON  
{  
 "errors": \[  
 "Invalid taskId: taskId is required"  
 \]  
}

🔴 **401 Unauthorized**

JSON  
{  
 "error": "User is not authorized"  
}

🔴 **403 Forbidden**

JSON  
{  
 "error": "User does not have access to this resource"  
}

🔴 **404 Not Found**

JSON  
{  
 "errors": \[  
 "Invalid taskId: no task found with this taskId"  
 \]  
}

🔴 **500 Internal Server Error**

JSON  
{  
 "error": "Internal server error"  
}
