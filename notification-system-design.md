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
INSERT INTO notifications(
student_id,
type,
title,
message
)
VALUES(?,?,?,?);
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

# Stage 3

## Query Analysis

### Given Query

```sql
SELECT *
FROM notifications
WHERE student_id = 1042
AND is_read = FALSE
ORDER BY created_at ASC;
```

### Is the query accurate?

Yes, the query is correct. It fetches all unread notifications for the student with ID **1042** and displays them in chronological order based on when they were created.

However, if the application stores millions of notifications, this query can become slow unless it is properly optimized.

---

## What are the performance issues?

### 1. Using `SELECT *`

The query retrieves every column from the table, even though the application may only need a few fields like the title, message, and creation time.

Fetching unnecessary data increases memory usage and takes longer to transfer the data.

### 2. Missing Indexes

If there is no index on `student_id` or `is_read`, MySQL has to scan the entire `notifications` table to find matching records.

This becomes expensive as the table grows.

### 3. Sorting

The query sorts the result using `created_at`.

Without an appropriate index, MySQL has to perform an additional sorting operation, which increases execution time.

---

## Optimized Query

Instead of selecting every column, I would retrieve only the columns required by the application.

```sql
SELECT
    id,
    title,
    message,
    type,
    created_at
FROM notifications
WHERE student_id = 1042
AND is_read = FALSE
ORDER BY created_at ASC;
```

This reduces unnecessary data transfer and improves performance.

---

## Recommended Index

To make the query faster, I would create the following composite index:

```sql
CREATE INDEX idx_notifications_student_read_created
ON notifications(student_id, is_read, created_at);
```

This index helps MySQL:

- Quickly locate notifications for a specific student.
- Filter only unread notifications.
- Return the results already sorted by `created_at`.

As a result, the database does not need to scan the entire table or perform an extra sorting step.

---

## Computational Cost

### Without an Index

- Searching requires scanning the entire table (**O(n)**).
- Sorting the results takes approximately **O(n log n)**.

This can become slow when the notification table contains millions of records.

### With the Recommended Index

The database can quickly locate the required records using the index, reducing the search time to approximately **O(log n)**.

Since the index already stores the records in the required order, additional sorting is often unnecessary.

---

## Should every column be indexed?

No.

Although indexes improve read performance, creating an index on every column is not a good practice.

Too many indexes:

- Increase storage usage.
- Slow down INSERT, UPDATE, and DELETE operations because every index must also be updated.
- Make database maintenance more expensive.

Therefore, indexes should only be created on columns that are frequently used in filtering, sorting, joining, or searching.

---

## SQL Query

Retrieve all students who received **Placement** notifications during the last seven days.

```sql
SELECT DISTINCT student_id
FROM notifications
WHERE type = 'Placement'
AND created_at >= NOW() - INTERVAL 7 DAY;
```

---

## Additional Index

To optimize the above query, I would create another index:

```sql
CREATE INDEX idx_notifications_type_created
ON notifications(type, created_at);
```

This allows MySQL to efficiently filter notifications by type and creation date.

---

## Conclusion

The given query works correctly, but it is not ideal for a large-scale notification system. By selecting only the required columns and creating suitable composite indexes, the database can retrieve notifications much faster while reducing unnecessary processing. Proper indexing also helps the application remain responsive as the amount of data grows.

# Stage 4

## Improving the Notification System

As the number of users and notifications grows, querying the database for every request can become slow and increase the load on the server. To improve performance, I would use a combination of **Redis** for caching and **WebSockets (Socket.IO)** for real-time notification delivery.

---

## Should Caching Be Used?

Yes.

Caching helps reduce the number of database queries by storing frequently accessed data in memory. Since memory access is much faster than reading from a database, users receive notifications more quickly and the database experiences less load.

Redis is a good choice because it is an in-memory data store that provides very fast read and write operations.

---

## How Caching Works

1. A user requests their notifications.
2. The application first checks Redis.
3. If the notifications are available in Redis (Cache Hit), they are returned immediately.
4. If the notifications are not available (Cache Miss), the application fetches them from MySQL.
5. The fetched notifications are then stored in Redis for future requests before being returned to the user.

This process reduces repeated database queries and improves response time.

---

## Cache Invalidation

Whenever a notification is created, updated, marked as read, or deleted, the cached notifications for that user should be removed or updated.

This ensures that users always receive the latest data instead of outdated information.

A simple strategy is:

- Update MySQL.
- Remove the user's cache from Redis.
- The next request reloads fresh data from MySQL and stores it back in Redis.

---

## Real-Time Notification Delivery

To deliver notifications instantly, I would use **Socket.IO**, which is built on top of WebSockets.

### Workflow

1. The user logs into the application.
2. The frontend establishes a Socket.IO connection with the server.
3. When a new notification is created, it is first stored in MySQL.
4. The Redis cache for that user is invalidated.
5. The backend emits a `new-notification` event through Socket.IO.
6. The connected user immediately receives the notification without refreshing the page.

---

## Why Use Redis and Socket.IO Together?

Redis and Socket.IO solve different problems.

- Redis improves performance by reducing database access.
- Socket.IO delivers notifications instantly to connected users.

Using both technologies together results in:

- Faster response time
- Reduced database load
- Better scalability
- Improved user experience

---

## Conclusion

By combining MySQL, Redis, and Socket.IO, the notification system can efficiently support thousands of users while maintaining fast response times and delivering notifications in real time. Redis minimizes unnecessary database queries, while Socket.IO ensures users receive notifications immediately after they are created.

# Stage 5

## Scalable Notification Processing

Instead of sending notifications directly, I would use a message queue like **RabbitMQ**. When a notification is created, it is first saved in the database and then added to the queue. A background worker reads the queue and delivers notifications to users.

### Workflow

1. Save notification in MySQL.
2. Add notification to RabbitMQ.
3. Background worker processes the queue.
4. Send notification using Socket.IO.
5. If delivery fails, retry a few times before moving it to a Dead Letter Queue (DLQ).

### Benefits

- Faster API response
- Better scalability
- Reliable notification delivery
- Supports retry for failed notifications
- Prevents server overload during high traffic

### Architecture

```
Client
   │
   ▼
Notification API
   │
   ▼
MySQL
   │
   ▼
RabbitMQ Queue
   │
   ▼
Background Worker
   │
   ▼
Socket.IO → Users
```

### Conclusion

Using RabbitMQ with Socket.IO makes the notification system scalable and reliable. The API remains responsive because notification delivery happens asynchronously in the background.

# Stage 6

## Approach

I fetched the notifications from the provided Notification API and assigned a priority to each notification based on its type.

Priority order:

- Placement → Highest Priority
- Result → Medium Priority
- Event → Lowest Priority

The notifications are first sorted by priority. If two notifications have the same priority, they are further sorted by timestamp so that the most recent notification appears first.

Finally, the first 10 notifications are selected and displayed as the Priority Inbox.

## Why this approach?

- Important notifications are displayed before less important ones.
- Recent notifications within the same category are shown first.
- The implementation is simple, easy to understand, and works efficiently for the given dataset.

## Future Improvement

If the system needs to process millions of notifications continuously, a Priority Queue (Max Heap) can be used instead of sorting the entire list every time. This would improve performance when maintaining the top N notifications as new notifications arrive.

# Stage 7

## Frontend Integration

Built a React frontend for the notification system using **Material UI v9** and **React Router v6**, integrated with the existing evaluation service API via a Vite dev proxy to bypass CORS.

### Stack

- React 19, MUI v9, React Router v6, Axios, Vite

### Pages

- **Notifications** — paginated list with filter by type (All / Placement / Result / Event), unread badge count, and mark-as-viewed on click (persisted in localStorage)
- **Priority** — top 10 notifications ranked by type weight (Placement > Result > Event), then by latest timestamp, fetched by merging pages 1–3 from the API

### Key Implementation Details

- Vite proxy routes `/api/notifications` and `/api/logs` to the evaluation service, avoiding CORS
- `useNotifications` hook manages filter, pagination, loading, error, and viewed state
- `usePriorityNotifications` hook fetches 3 pages in parallel, sorts client-side, returns top N
- Logger has a circuit breaker — trips on first 4xx response and stops sending further log requests to prevent request flooding on token expiry
- All `console.log/error/warn` replaced with structured `Log(stack, level, package, message)` calls matching the logging-middleware interface
- MUI v9 requires all layout props (`direction`, `alignItems`, `justifyContent`, `spacing`) inside `sx` — shorthand props are not forwarded in this version

### Project Structure

```
notification-app-fe/
  src/
    api/notifications.js       — API calls with logging
    hooks/useNotifications.js  — paginated notifications state
    hooks/usePriorityNotifications.js
    components/
      NotificationCard.jsx     — single notification display
      NotificationFilter.jsx   — type filter toggle buttons
    pages/
      NotificationsPage.jsx
      PriorityNotificationsPage.jsx
    lib/logger.js              — browser logger with circuit breaker
```
