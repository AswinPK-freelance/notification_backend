# Node.js Notification Management System

A Node.js application for managing notifications. This project uses Prisma ORM for database management and JWT for authentication.

## Setup and Running Instructions

### Prerequisites:

- Node.js (version 16 or later)
- MySQL (or compatible database)

### Local Setup:

1. Clone this repository:
   git clone [https://github.com/AswinPK-freelance/notification_backend.git]
   cd <project-folder> // if want

2. Install the required dependencies:
   npm install

3. Set up the database schema using Prisma:
   npx prisma db push

4. Create an .env file in the root directory based on the provided env.example file. Set the actual values for your environment variables.

   DATABASE_URL="mysql://root:@localhost:3306/notification_management" // please change the user and password
   JWT_SECRET="secret-key"
   PORT=3000
   FRONTEND_URL="http://localhost:5173"

5. Start the application:
   node index.js
