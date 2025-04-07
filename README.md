# PeerHire Job Posting & Bidding API

A RESTful API for a job posting and bidding platform built with Node.js, Express, and MongoDB.

## Features

- User authentication (JWT-based)
- Role-based access control (Employer/Freelancer)
- Job posting and management
- Bidding system
- API documentation using Swagger
- Rate limiting for security
- Input validation
- Real-time notifications using WebSockets
- Docker support for easy deployment

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **Swagger** - API documentation
- **Socket.io** - Real-time communication
- **Docker** - Containerization

## Installation

1. Clone the repository
```bash
git clone https://github.com/gopikant21/peerhire.git
cd job-posting-api
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=5000
MONGO_URI=mongodb+srv://gopikant5jan:N51Bj0v4OtgsNYI0@cluster0.wremit7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
```

4. Run the server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### User Authentication

- **POST** `/api/auth/register` - Register a new user
- **POST** `/api/auth/login` - Authenticate user & return JWT token
- **GET** `/api/auth/me` - Get current user profile

### Job Posting (Employer-Only)

- **POST** `/api/jobs/create` - Employers can post a job
- **GET** `/api/jobs` - Retrieve all job postings
- **GET** `/api/jobs/:jobId` - Retrieve details of a specific job
- **GET** `/api/jobs?skills=react,nodejs` - Filter jobs by required skills
- **PUT** `/api/jobs/:jobId` - Update a job
- **DELETE** `/api/jobs/:jobId` - Delete a job

### Freelancer Bidding

- **POST** `/api/bids/:jobId` - Freelancers can place a bid
- **GET** `/api/bids/:jobId` - Retrieve all bids for a job

### Bid Management (Employer-Only)

- **PATCH** `/api/bids/:bidId/accept` - Employers accept a bid
- **PATCH** `/api/bids/:bidId/reject` - Employers reject a bid

## API Documentation

API documentation is available via Swagger UI at `/api-docs` after starting the server.

## Request Examples

### Register a new employer

```bash
curl -X POST -H "Content-Type: application/json" -d '{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "employer"
}' http://localhost:5000/api/auth/register
```

### Login

```bash
curl -X POST -H "Content-Type: application/json" -d '{
  "email": "john@example.com",
  "password": "password123"
}' http://localhost:5000/api/auth/login
```

### Create a job (requires authentication)

```bash
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_TOKEN" -d '{
  "title": "Build a React Website",
  "description": "Looking for a developer to build a responsive website using React",
  "budget": 1000,
  "duration": 14,
  "skillsRequired": ["react", "javascript", "html", "css"]
}' http://localhost:5000/api/jobs/create
```

### Get all jobs

```bash
curl -X GET http://localhost:5000/api/jobs
```

### Place a bid (requires authentication)

```bash
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_TOKEN" -d '{
  "bidAmount": 900,
  "timeline": 10,
  "message": "I have 5 years of experience with React and can deliver this project quickly."
}' http://localhost:5000/api/bids/JOB_ID
```

## Running with Docker

1. Build the Docker image:
```bash
docker build -t job-posting-api .
```

2. Run the container:
```bash
docker run -p 5000:5000 job-posting-api
```

## Implemented Bonus Features

- WebSockets for real-time bid notifications
- Dockerization for easy deployment
- Rate limiting to prevent spam requests

## Future Improvements
- Email notifications
- File uploads for portfolios and job attachments
- Payment integration
- Reviews and ratings system

## License

MIT