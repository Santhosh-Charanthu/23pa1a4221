# Notification System Design

# Notification System Design

# Stage 1

## Overview

This document defines the REST API contract for a campus notification platform that delivers placement, event, and result notifications to students.

The APIs follow RESTful principles with predictable resource naming, JSON request/response formats, and HTTP status codes.

Real-time notification delivery is achieved using WebSockets (Socket.IO).

---

# Notification Object

```json
{
  "id": "uuid",
  "type": "Placement",
  "title": "Placement Drive",
  "message": "TCS Corporation is hiring.",
  "isRead": false,
  "createdAt": "2026-04-22T17:51:18Z"
}
```

---

# Common Headers

Request

```

Content-Type: application/json
Accept: application/json

```

Response

```

Content-Type: application/json

```

---

# 1. Get All Notifications

GET /api/notifications

Description

Returns notifications for a student.

Query Parameters

| Parameter | Type   | Required | Description            |
| --------- | ------ | -------- | ---------------------- |
| page      | Number | No       | Current page           |
| limit     | Number | No       | Records per page       |
| type      | String | No       | Event/Placement/Result |

Example Request

GET /api/notifications?page=1&limit=10&type=Placement

Response

Status 200

```json
{
  "success": true,
  "page": 1,
  "limit": 10,
  "total": 250,
  "notifications": [
    {
      "id": "1",
      "type": "Placement",
      "title": "Placement Drive",
      "message": "Amazon hiring",
      "isRead": false,
      "createdAt": "2026-04-22T17:51:18Z"
    }
  ]
}
```

---

# 2. Get Notification By ID

GET /api/notifications/{id}

Example

GET /api/notifications/123

Response

```json
{
  "success": true,
  "notification": {
    "id": "123",
    "type": "Result",
    "title": "Semester Result",
    "message": "Results published",
    "isRead": false,
    "createdAt": "2026-04-22T17:51:18Z"
  }
}
```

---

# 3. Create Notification

POST /api/notifications

Request

```json
{
  "type": "Placement",
  "title": "Placement Drive",
  "message": "Microsoft is hiring."
}
```

Response

Status 201

```json
{
  "success": true,
  "message": "Notification created successfully",
  "notificationId": "12345"
}
```

---

# 4. Mark Notification as Read

PATCH /api/notifications/{id}/read

Response

```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

# 5. Mark All Notifications as Read

PATCH /api/notifications/read-all

Response

```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

# 6. Delete Notification

DELETE /api/notifications/{id}

Response

```json
{
  "success": true,
  "message": "Notification deleted"
}
```

---

# HTTP Status Codes

| Code | Meaning                |
| ---- | ---------------------- |
| 200  | Success                |
| 201  | Created                |
| 400  | Bad Request            |
| 404  | Notification Not Found |
| 500  | Internal Server Error  |

---

# Error Response

```json
{
  "success": false,
  "message": "Notification not found"
}
```

---

# Real-Time Notification Mechanism

Technology Used

- Socket.IO (WebSockets)

Workflow

1. Student logs into application.
2. Client establishes WebSocket connection.
3. Backend stores active socket.
4. Admin creates notification.
5. Backend saves notification.
6. Backend emits event to connected student(s).
7. Student receives notification instantly without refreshing.

Event Name

```

new-notification

```

Payload

```json
{
  "id": "123",
  "type": "Placement",
  "title": "Placement Drive",
  "message": "Amazon hiring",
  "createdAt": "2026-04-22T17:51:18Z"
}
```

---

# REST API Summary

| Method | Endpoint                     | Description           |
| ------ | ---------------------------- | --------------------- |
| GET    | /api/notifications           | Get all notifications |
| GET    | /api/notifications/{id}      | Get notification      |
| POST   | /api/notifications           | Create notification   |
| PATCH  | /api/notifications/{id}/read | Mark one as read      |
| PATCH  | /api/notifications/read-all  | Mark all as read      |
| DELETE | /api/notifications/{id}      | Delete notification   |

---

# Naming Conventions

- Resources use plural nouns.
- Use HTTP verbs according to REST standards.
- Responses are JSON.
- UUID is used as notification identifier.
- Timestamps are stored in ISO-8601 format.

# Stage 2

## Database Choice

I recommend **MySQL** as the persistent storage for the notification system.

### Why MySQL?

- Reliable relational database with ACID compliance.
- Efficient for structured notification data.
- Supports indexing for fast searching and sorting.
- Handles millions of records efficiently with proper indexing.
- Well suited for filtering, pagination, and ordering notifications.
- Easy to integrate with Node.js using MySQL2 or Sequelize.

---

## Database Schema

### Table: students

| Column     | Data Type    | Constraints                |
| ---------- | ------------ | -------------------------- |
| id         | BIGINT       | PRIMARY KEY AUTO_INCREMENT |
| name       | VARCHAR(100) | NOT NULL                   |
| email      | VARCHAR(255) | UNIQUE NOT NULL            |
| created_at | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP  |

---

### Table: notifications

| Column     | Data Type                          | Constraints                         |
| ---------- | ---------------------------------- | ----------------------------------- |
| id         | BIGINT                             | PRIMARY KEY AUTO_INCREMENT          |
| student_id | BIGINT                             | FOREIGN KEY REFERENCES students(id) |
| type       | ENUM('Placement','Result','Event') | NOT NULL                            |
| title      | VARCHAR(255)                       | NOT NULL                            |
| message    | TEXT                               | NOT NULL                            |
| is_read    | BOOLEAN                            | DEFAULT FALSE                       |
| created_at | TIMESTAMP                          | DEFAULT CURRENT_TIMESTAMP           |

---

## Relationship

One Student can have multiple Notifications.

```
Students (1)
      │
      │
      ▼
Notifications (Many)
```

---

## Indexes

To improve query performance, the following indexes should be created:

```sql
CREATE INDEX idx_student
ON notifications(student_id);

CREATE INDEX idx_student_read
ON notifications(student_id, is_read);

CREATE INDEX idx_type
ON notifications(type);

CREATE INDEX idx_created
ON notifications(created_at DESC);
```

---

## Challenges as Data Grows

As the number of students and notifications increases, the following issues may occur:

- Slower query execution.
- Increased response time for unread notifications.
- Expensive sorting operations.
- Higher storage usage.
- Pagination becomes slower without indexes.

---

## Performance Optimizations

To improve scalability:

- Create indexes on frequently searched columns.
- Use pagination (LIMIT and OFFSET).
- Retrieve only required columns instead of using `SELECT *`.
- Archive old notifications.
- Cache frequently requested notifications using Redis.
- Regularly analyze slow queries and optimize indexes.

---

## SQL Queries

### 1. Get All Notifications

```sql
SELECT id,
       type,
       title,
       message,
       is_read,
       created_at
FROM notifications
WHERE student_id = ?
ORDER BY created_at DESC
LIMIT 10 OFFSET 0;
```

---

### 2. Get Notification by ID

```sql
SELECT *
FROM notifications
WHERE id = ?;
```

---

### 3. Create Notification

```sql
INSERT INTO notifications
(
student_id,
type,
title,
message
)
VALUES
(
?,
?,
?,
?
);
```

---

### 4. Mark Notification as Read

```sql
UPDATE notifications
SET is_read = TRUE
WHERE id = ?;
```

---

### 5. Mark All Notifications as Read

```sql
UPDATE notifications
SET is_read = TRUE
WHERE student_id = ?;
```

---

### 6. Delete Notification

```sql
DELETE FROM notifications
WHERE id = ?;
```

---

## Summary

MySQL is an excellent choice for this notification system because it provides reliable transactional support, strong indexing capabilities, and efficient querying for structured data. By using proper indexing, pagination, and caching, the application can continue to perform efficiently even as the number of students and notifications grows into the millions.
