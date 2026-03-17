Solid choice. Using **Node.js 24** ensures you're ahead of the curve with the latest security patches and performance improvements. I've updated the documentation to reflect this and translated everything into English for a more professional, global-standard repository.

---

# Express TypeScript M-S-C Template

This repository is a high-performance migration of a Go-based (Gin & GORM) boilerplate to **Express & Mongoose**, utilizing a strict **Model-Service-Controller (MSC)** architecture. It is built with TypeScript 5+ using `verbatimModuleSyntax` for optimized compilation and type safety.

## 🚀 Key Features

* **Node.js 24+ Optimized**: Leverages the latest runtime features for enhanced security and stability.
* **Mobile-First Architecture**: API design optimized for seamless integration with iOS, Android, and web platforms.
* **Custom ID Generation**: Implements a secure ID generator with the format `PREFIX-YYYYMMDD-RANDOM` (e.g., `BK-20260317-A1B2`), replacing standard ObjectIDs for better URL readability and consistency.
* **Edge-Ready Authentication**: Utilizes the `jose` library for lightweight, high-performance JWT handling and `bcrypt` for secure password hashing.
* **Advanced Rate Limiting & Lockout**: Includes a custom middleware that automatically locks an IP address for 30 seconds if it exceeds 5 requests within a 30-second window.
* **Mongoose Custom Primary Keys**: Configured to use `string` as the `_id` type, allowing for full control over record identifiers.
* **Clean Tailwind Integration**: Ready-to-use frontend examples adhering to strict design constraints (max font-weight 700, no tracking/leading overrides).

---

## 🛠️ Tech Stack

* **Runtime**: Node.js 24 (LTS/Current)
* **Language**: TypeScript (Strict Mode)
* **Framework**: Express.js
* **Database**: MongoDB via Mongoose
* **Security**: Jose (JWT), Bcrypt (Hashing), Custom Rate Limiter
* **Testing**: k6 (Load & Performance Testing)

---

## 📦 Getting Started

### 1. Prerequisites
* Node.js 24 or newer.
* MongoDB instance (local or Atlas) or Docker.

### 2. Environment Configuration (`.env`)
Create a `.env` file in the root directory:

```env
PORT=8000
MONGO_URI=mongodb://127.0.0.1:27017/express_db
JWT_SECRET=your_ultra_secure_secret
JWT_EXPIRES=enable
JWT_EXPIRES_IN=2
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
```

### 3. Local Development
```bash
npm install
npm run build
npm start
```

---

## 🐳 Docker Deployment

The project includes a multi-stage `Dockerfile` and `docker-compose.yml` for easy deployment:

```bash
# Build and start all services (API + MongoDB)
docker-compose up --build

# Run in detached mode
docker-compose up -d
```

---

## 📑 API Endpoints

### Authentication (`/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive a Bearer Token |

### Books (`/books`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/books` | No | List all books |
| `POST` | `/api/books` | Yes | Add a new book record |
| `PATCH` | `/api/books/:id` | Yes | Partially update book data |
| `DELETE` | `/api/books/:id` | Yes | Hard delete/Remove a book |

---

## 📂 Project Structure
```text
src/
├── config/         # Database & App configurations
├── controllers/    # Request handlers & Input validation
├── middlewares/    # Auth, CORS, & Rate Limiting logic
├── models/         # Mongoose Schemas & TS Interfaces
├── routes/         # Endpoint definitions
├── services/       # Core business logic & DB queries
├── utils/          # Helpers (JWT, Crypto, ID Gen)
└── index.ts        # Main server entry point
```