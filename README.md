# Pelanggaran Management System - Backend API

A comprehensive backend API for managing student violations in educational institutions. Built with NestJS, TypeORM, and PostgreSQL.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Docker Support](#docker-support)
- [Testing](#testing)
- [Contributing](#contributing)

## 🚀 Features

### Core Functionality
- **Student Management**: Create, read, update, and manage student records
- **Violation Tracking**: Record and track student violations with detailed information
- **Violation Types**: Configure different types of violations with point systems
- **Class Management**: Organize students into classes
- **User Management**: Role-based authentication (Admin/User)
- **Dashboard Analytics**: Comprehensive dashboard with charts and statistics
- **Image Management**: Upload and manage violation-related images
- **School Profile**: Configure school information and settings

### Technical Features
- **JWT Authentication**: Secure token-based authentication
- **Role-based Authorization**: Different access levels for different user roles
- **File Upload**: Support for image uploads with MinIO/S3 integration
- **Pagination**: Efficient pagination for large datasets
- **Search & Filtering**: Advanced search and filtering capabilities
- **Data Validation**: Comprehensive input validation using class-validator
- **Error Handling**: Centralized error handling and logging
- **CORS Support**: Configurable CORS for frontend integration

## 🛠 Tech Stack

- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT with Passport
- **File Storage**: MinIO (S3-compatible)
- **Validation**: class-validator & class-transformer
- **Testing**: Jest
- **Containerization**: Docker
- **Language**: TypeScript

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (v12 or higher)
- MinIO (for file storage) - Optional for local development

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pelanggaran-be
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Copy environment configuration**
   ```bash
   cp .env-example .env
   ```

## ⚙️ Configuration

Configure your environment variables in the `.env` file:

```env
# Database Configuration
DB_USERNAME=your_db_username
DB_HOST=localhost
DB_NAME=pelanggaran_db
DB_PASSWORD=your_db_password
DB_LOG=false
DB_PORT=5432

# CORS Configuration
CORS_DEV=http://localhost:3000,http://localhost:3001
CORS_STG=https://your-staging-domain.com

# MinIO Configuration (for file storage)
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=your_access_key
MINIO_SECRET_KEY=your_secret_key
MINIO_BUCKET=pelanggaran-images
MINIO_REGION=us-east-1
MINIO_FORCE_PATH_STYLE=true

# Application Configuration
USER_KEY_SECRET=your_jwt_secret_key
APP_PORT=3000
DEMO=false
```

## 🗄 Database Setup

1. **Create PostgreSQL Database**
   ```sql
   CREATE DATABASE pelanggaran_db;
   ```

2. **Run Database Migrations**
   ```bash
   # Generate migration (if needed)
   npm run migration:generate -- src/migration/YourMigrationName

   # Run migrations
   npm run migration:run
   ```

3. **Available Migrations**
   - `1755236008979-init.ts` - Initial database schema
   - `1756042346353-add_school_pofile_table.ts` - School profile table
   - `1757203288939-new_image_table_design.ts` - Image management tables

## 🚀 Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

### Debug Mode
```bash
npm run start:debug
```

The application will be available at `http://localhost:3000`

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/backend
```

### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/reset-password` - Password reset

### Student Management
- `GET /students` - Get all students (with pagination)
- `POST /students` - Create new student
- `POST /students/batch` - Create multiple students
- `GET /students/:id` - Get student by ID
- `PUT /students/:id` - Update student
- `DELETE /students/:id` - Delete student

### Violation Management
- `GET /violations` - Get all violations (with pagination)
- `POST /violations` - Create new violation
- `GET /violations/:id` - Get violation by ID
- `PUT /violations/:id` - Update violation
- `DELETE /violations/:id` - Delete violation

### Class Management
- `GET /classes` - Get all classes
- `POST /classes` - Create new class
- `PUT /classes/:id` - Update class
- `DELETE /classes/:id` - Delete class

### Violation Types
- `GET /violation-types` - Get all violation types
- `POST /violation-types` - Create violation type
- `PUT /violation-types/:id` - Update violation type
- `DELETE /violation-types/:id` - Delete violation type

### Dashboard
- `GET /dashboard` - Get dashboard statistics and charts

### Image Management
- `POST /images/upload` - Upload images
- `GET /images/:id` - Get image by ID
- `DELETE /images/:id` - Delete image

### User Management
- `GET /users` - Get all users
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

## 📁 Project Structure

```
src/
├── commons/                 # Shared utilities and configurations
│   ├── configs/            # Database and migration configurations
│   ├── decorators/         # Custom decorators
│   ├── dto/               # Data Transfer Objects
│   ├── enums/             # Application enums
│   ├── filters/           # Exception filters
│   ├── guards/            # Authentication guards
│   ├── interceptors/      # Request/Response interceptors
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── entities/              # TypeORM entities
│   ├── class.entity.ts
│   ├── student.entity.ts
│   ├── violation.entity.ts
│   ├── violation-type.entity.ts
│   ├── user.entity.ts
│   └── ...
├── modules/               # Feature modules
│   ├── auth/             # Authentication module
│   ├── student/          # Student management
│   ├── violation/        # Violation management
│   ├── classes/          # Class management
│   ├── dashboard/        # Dashboard and analytics
│   ├── image/            # Image management
│   ├── school-profile/   # School profile
│   ├── user/             # User management
│   └── violation-type/   # Violation type management
├── repositories/          # Custom repositories
├── app.module.ts         # Root module
└── main.ts              # Application entry point
```

## 🐳 Docker Support

### Build Docker Image
```bash
docker build -t pelanggaran-be .
```

### Run with Docker
```bash
docker run -p 3000:3000 --env-file .env pelanggaran-be
```

### Docker Compose (with PostgreSQL and MinIO)
Create a `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=pelanggaran_db
      - DB_USERNAME=postgres
      - DB_PASSWORD=password
      - MINIO_ENDPOINT=http://minio:9000
    depends_on:
      - postgres
      - minio

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=pelanggaran_db
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  minio_data:
```

## 🧪 Testing

### Run Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Linting and Formatting
```bash
# Lint code
npm run lint

# Format code
npm run format
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for password security
- **Input Validation**: Comprehensive validation using class-validator
- **SQL Injection Protection**: TypeORM query builder prevents SQL injection
- **CORS Configuration**: Configurable cross-origin resource sharing
- **Role-based Access Control**: Different permission levels for users

## 🎯 Key Features Explained

### Student Violation System
- Students can be assigned to classes
- Violations are recorded with timestamps and notes
- Multiple violation types can be associated with each violation
- Points system for tracking violation severity
- Image attachments for evidence

### Dashboard Analytics
- Real-time statistics on violations
- Chart data for visualization
- Filtering by date ranges and violation types
- Performance metrics and trends

### File Management
- Image upload support for violation evidence
- MinIO/S3 integration for scalable storage
- Image processing and optimization
- Secure file access controls

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the UNLICENSED License.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Note**: This is a demo application with limitations when `DEMO=true` is set in the environment variables (e.g., limited number of students and classes).
