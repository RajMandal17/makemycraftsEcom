# MakeMyCrafts - Open Source Artwork E-commerce Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

A comprehensive open-source monolithic e-commerce platform for artwork marketplaces, built with Spring Boot and React.

## 🚀 Features

- **User Roles**: Admin, Artist, Customer
- **Authentication**: JWT-based auth with Google OAuth2 support
- **Payments**: Integrated Razorpay payment gateway with split payments
- **AI Analysis**: Gemini AI integration for artwork analysis and tagging
- **Storage**: Cloudinary for optimized image storage
- **Email**: Email notifications using SendGrid
- **Security**: Role-based access control, CSRF protection, and rate limiting

## 🏗️ Architecture

This is a **monolithic application** following SOLID principles and design patterns for maintainability and scalability.

### Technology Stack

**Backend:**
- Spring Boot 3.2.5
- Java 17
- MySQL 8.0
- Redis (Caching)
- Flyway (Database Migration)

**Frontend:**
- React 18
- TypeScript
- Vite
- TailwindCSS
- Redux Toolkit

## 📂 Project Structure

```
makemycrafts/
├── backend/                    # Spring Boot monolithic backend
│   ├── src/main/java/         # Source code
│   └── src/main/resources/    # Config & Migrations
├── frontend/                   # React frontend
└── docker-compose.yml         # Container orchestration
```

## 🛠️ Getting Started

### Prerequisites

- Java 17
- Node.js 18+
- MySQL 8.0
- Redis

### Configuration

The application relies on several environment variables for security and integration. You should set these in your environment or `application-dev.properties`.

**Required Variables:**

| Variable | Description | Default (Dev) |
|----------|-------------|---------------|
| `JWT_SECRET` | Secret key for JWT tokens | *Change me!* |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name | - |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | - |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | - |
| `GEMINI_API_KEY` | Google Gemini AI Key | - |
| `RAZORPAY_KEY_ID` | Razorpay Key ID | - |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret | - |

### Quick Start (Local)

1. **Clone the repository**
   ```bash
   git clone https://github.com/RajMandal17/makemycraftsEcom.git
   cd makemycraftsEcom
   ```

2. **Backend Setup**
   ```bash
   cd backend
   # Ensure you have your database running or use Docker
   ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🐳 Docker Support

You can run the entire stack (Database, Redis, Backend) using Docker Compose:

```bash
docker-compose up -d
```

## 🤝 Contributing

Contributions are always welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) to get started.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 Code of Conduct

We are committed to providing a friendly, safe, and welcoming environment for all. Please review our [Code of Conduct](CODE_OF_CONDUCT.md).

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact

Project Link: [https://github.com/RajMandal17/makemycraftsEcom](https://github.com/RajMandal17/makemycraftsEcom)

Email: rajmandal147@gmail.com
linkedin: https://www.linkedin.com/in/rajkumarmandal17/
whatsapp: +91 8793148668
