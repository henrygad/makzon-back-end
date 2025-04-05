# Makzon Back-End

Makzon Back-End is a robust and scalable back-end solution for the Makzon blogpost website. Built with Node.js, Express.js, and TypeScript, it incorporates modern best practices, efficient routing, and comprehensive authentication mechanisms. This server is designed to handle all business logic and API requests for the Makzon platform.

---

## Features

- **Authentication**:
  - Local and Google OAuth using Passport.js.
  - Secure session management with `express-session` and `connect-mongo`.
- **Database**:
  - MongoDB integration using Mongoose for data modeling and management.
- **Validation**:
  - Request validation using `express-validator`.
- **Email Services**:
  - Email handling with Nodemailer for account-related communication.
- **Security**:
  - Includes Helmet for securing HTTP headers.
  - Protects against XSS with `xss-clean` and `sanitize-html`.
  - Prevents HTTP parameter pollution using `hpp`.
- **Rate Limiting**:
  - Request throttling with `express-rate-limit`.
- **File Uploads**:
  - File handling with Multer.
- **Production-Ready**:
  - Structured environment variables for easy configuration.

---

## Project Structure

```plaintext
src/
├── assets/        # Static assets or files
├── config/        # Configuration files (e.g., environment, passport setup)
├── controllers/   # Controllers for handling API logic
├── middlewares/   # Custom middlewares for validation, authentication, etc.
├── models/        # Mongoose schemas and models
├── public/        # Publicly accessible static files
├── routes/        # API routes definitions
├── types/         # TypeScript type definitions
├── utils/         # Utility functions and helpers
├── validators/    # Request validation logic
├── app.ts         # Main application configuration
└── server.ts      # Entry point to start the server
```

---

## Installation and Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/henrygad/makzon-back-end.git
   cd makzon-back-end
   ```

2. **Install Dependencies**:
   ```bash
   yarn install
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file in the root directory and configure it as follows:

   ```env
   PORT=3000
   ON_PROXY=true
   SAME_ORIGIN=true
   NODE_ENV=production | deploy
   GENERAL_SECRET=<your-general-secret>
   DOMAIN_NAME=<your-domain-name>
   GMAIL=<your-email>
   EMAIL_PASSWORD=<your-email-password>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>
   GOOGLE_CLIENT_ID=<your-google-client-id>
   MONGO_URI=<your-mongodb-uri>
   ```

4. **Run the Server**:
   - Development:
     ```bash
     yarn dev
     ```
   - Production:
     ```bash
     yarn build
     yarn start
     ```

---

## API Endpoints

| Method | Endpoint                 | Description                        |
|--------|--------------------------|------------------------------------|
| GET    | `/api`                   | Base API route                     |
| GET    | `/api/auth`              | Authentication-related operations  |
| GET    | `/api/user`              | User-related operations            |
| GET    | `/api/post`              | Blog post operations               |
| GET    | `/api/comment`           | Comment operations                 |
| GET    | `/api/draft`             | Draft-related operations           |
| GET    | `/api/notification`      | Notification operations            |
| GET    | `/api/media`              | File handling operations           |
| GET    | `/api/search`            | Search operations                  |
| GET    | `/api/test`              | Testing routes                     |

Each of the routes supports the following operations:
- **GET**: Retrieve resources.
- **POST**: Create new resources.
- **PATCH**: Update existing resources.
- **DELETE**: Remove resources.
> Note: Detailed documentation for all endpoints (including ones not listed here) is available in `src/routes`.

---

## Scripts

- `yarn dev`: Run the server in development mode.
- `yarn build`: Compile TypeScript files into JavaScript.
- `yarn start`: Start the compiled server.
- `yarn lint`: Run ESLint to check for code quality issues.
- `yarn lint:fix`: Automatically fix ESLint issues.

---

## Technologies Used

- **Core**:
  - Node.js, Express.js, TypeScript
- **Database**:
  - MongoDB, Mongoose
- **Authentication**:
  - Passport.js (Local & Google OAuth)
- **Validation**:
  - express-validator
- **Security**:
  - Helmet, xss-clean, hpp
- **Email Services**:
  - Nodemailer

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Author

- **Henry Orji**

---

## Contribution

Contributions are welcome! Feel free to fork the repository and submit a pull request.