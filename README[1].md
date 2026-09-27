# User Authentication & JWT

A secure backend authentication application built with Node.js and Express.

## Features

- User registration
- Password hashing using bcrypt
- User login
- JWT authentication
- HTTP-only cookie for JWT storage
- Protected API routes
- User logout
- SQLite database

## API Endpoints

### Register

POST `/api/auth/register`

Request:

```json
{
  "name": "Reshma",
  "email": "reshma@test.com",
  "password": "Test1234"
}
