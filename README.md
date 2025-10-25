# Teacher-Student Portal - Backend

A Node.js backend API for the Teacher-Student Portal that handles authentication, assignment management, and submission tracking.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Assignment Management**: Full CRUD operations with state transitions (Draft → Published → Completed)
- **Submission System**: Students can submit answers, teachers can review submissions
- **Security**: Input validation, rate limiting, CORS protection, and security headers
- **Database**: MongoDB with Mongoose ODM

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- express-validator
- helmet
- express-rate-limit

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd teacher-student-portal/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the backend directory:
   ```env
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/teacher-student-portal
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration (for testing)

### Assignments
- `GET /api/assignments` - Get assignments (role-based filtering)
- `GET /api/assignments/:id` - Get single assignment
- `POST /api/assignments` - Create assignment (Teacher only)
- `PUT /api/assignments/:id` - Update assignment (Teacher only)
- `DELETE /api/assignments/:id` - Delete assignment (Teacher only)
- `PUT /api/assignments/:id/publish` - Publish assignment (Teacher only)
- `PUT /api/assignments/:id/complete` - Mark as completed (Teacher only)
- `GET /api/assignments/:id/submissions` - Get submissions for assignment (Teacher only)

### Submissions
- `POST /api/submissions` - Submit assignment (Student only)
- `GET /api/submissions` - Get student's submissions (Student only)
- `GET /api/submissions/:id` - Get single submission
- `PUT /api/submissions/:id/review` - Mark submission as reviewed (Teacher only)

## Database Models

### User
- name, email, password, role (teacher/student)
- Password hashing with bcryptjs
- Email validation and uniqueness

### Assignment
- title, description, dueDate, status, teacher
- Status transitions: draft → published → completed
- Due date validation (must be in future)

### Submission
- assignment, student, answer, submittedAt, isReviewed
- One submission per student per assignment
- Answer length validation (max 2000 characters)

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Input Validation**: express-validator for request validation
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable CORS settings
- **Security Headers**: Helmet.js for security headers
- **Role-based Access**: Different permissions for teachers and students

## Error Handling

- Centralized error handling middleware
- Validation error responses
- Authentication error handling
- Database error handling

## Development

### Project Structure
```
backend/
├── config/
│   └── database.js
├── middleware/
│   ├── auth.js
│   └── validation.js
├── models/
│   ├── User.js
│   ├── Assignment.js
│   └── Submission.js
├── routes/
│   ├── auth.js
│   ├── assignments.js
│   └── submissions.js
├── server.js
├── package.json
└── README.md
```

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## Testing

You can test the API using tools like Postman or curl:

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@example.com","password":"password123"}'

# Get assignments (with JWT token)
curl -X GET http://localhost:5000/api/assignments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Deployment

1. Set environment variables for production
2. Use a process manager like PM2
3. Set up MongoDB Atlas for production database
4. Configure reverse proxy (nginx)
5. Set up SSL certificates

## Notes

- The `/api/auth/register` endpoint is included for testing purposes
- In production, implement proper user registration flow
- Consider adding email verification
- Add logging and monitoring
- Implement backup strategies for MongoDB
