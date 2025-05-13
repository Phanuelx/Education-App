# Education App Platform

![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18.x-339933.svg?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248.svg?logo=mongodb)

A full-stack educational platform built with React and Node.js that facilitates course management, enrollment, and scheduling for educational institutions.

## 🌟 Features

### Multi-Role System
- **Admin:** Manage users, assign roles, and configure system settings
- **Teacher:** Create courses and schedule classes
- **Student:** Browse courses, enroll, and view schedules

### Key Functionalities
- Secure authentication and role-based access control
- Comprehensive user management
- Course creation and enrollment system
- Class scheduling with calendar integration
- Clean, responsive UI built with React

## 🛠️ Technology Stack

### Frontend
- **React:** UI library for building interactive interfaces
- **React Router:** For application routing
- **Axios:** For API requests
- **React Context API:** For state management
- **Shadcn/UI & Tailwind:** For responsive design

### Backend
- **Node.js:** JavaScript runtime environment
- **Express:** Web application framework
- **MongoDB:** NoSQL database
- **Mongoose:** MongoDB object modeling
- **JWT:** For secure authentication

## 📋 System Architecture

The application follows a three-tier architecture:

```
Frontend (React)
    |
    v
Backend (Node.js/Express)
    |
    v
Database (MongoDB)
```

### Data Model

```
User {
    userId (PK)
    firstName, lastName
    email, password (encrypted)
    role (admin, teacher, student)
    createdAt, lastLogin
}

Course {
    courseId (PK)
    title, description
    teacherId (FK to User)
    duration, status
    createdAt, updatedAt
}

Enrollment {
    enrollmentId (PK)
    studentId (FK to User)
    courseId (FK to Course)
    enrollmentDate
    status
}

Schedule {
    scheduleId (PK)
    courseId (FK to Course)
    teacherId (FK to User)
    title, description
    startTime, endTime
    location
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or later)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/education-app.git
cd education-app
```

2. Install dependencies for both client and server
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Configure environment variables
```bash
# In the server directory, create a .env file
touch .env

# Add the following variables to the .env file
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

4. Run the application
```bash
# Start the server (from the server directory)
npm run dev

# In a new terminal, start the client (from the client directory)
npm start
```

5. Open your browser and navigate to `http://localhost:3000`

## 📁 Project Structure

```
education-app/
├── client/                 # React frontend
│   ├── public/             # Static files
│   └── src/                # Source files
│       ├── components/     # Reusable components
│       ├── pages/          # Page components
│       ├── contexts/       # React context providers
│       ├── services/       # API services
│       └── utils/          # Utility functions
├── server/                 # Node.js backend
│   ├── config/             # Configuration files
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   └── server.js           # Entry point
└── README.md               # Project documentation
```

## 🔒 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate a user
- `GET /api/auth/me` - Get authenticated user

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create course (teacher/admin only)
- `PUT /api/courses/:id` - Update course (teacher/admin only)
- `DELETE /api/courses/:id` - Delete course (admin only)

### Enrollments
- `GET /api/enrollments` - Get user enrollments
- `POST /api/enrollments` - Create enrollment
- `PUT /api/enrollments/:id` - Update enrollment status
- `DELETE /api/enrollments/:id` - Delete enrollment

### Schedules
- `GET /api/schedules` - Get schedules
- `GET /api/schedules/:id` - Get schedule by ID
- `POST /api/schedules` - Create schedule (teacher only)
- `PUT /api/schedules/:id` - Update schedule (teacher only)
- `DELETE /api/schedules/:id` - Delete schedule (teacher only)

## 🖼️ Screenshots

*Coming soon*

## 🔮 Future Enhancements

- Notifications system
- Advanced analytics dashboard
- Mobile application
- Live virtual classroom integration

## 👨‍💻 Author

[Ibrahim Irfan](https://github.com/phanuelx)
