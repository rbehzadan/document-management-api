# Document Management API

A comprehensive REST API built with Node.js/Express for hands-on learning of authentication and authorization patterns including JWT, OAuth 2.0, mTLS, RBAC, and ABAC.

## 🎯 Learning Objectives

This project implements multiple authentication and authorization patterns:

**Authentication Methods:**
- Basic HTTP Authentication
- API Key Authentication  
- JWT (JSON Web Tokens)
- OAuth 2.0
- mTLS (Mutual TLS)

**Authorization Models:**
- RBAC (Role-Based Access Control)
- ABAC (Attribute-Based Access Control) with JEXL policies

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- npm/yarn

### Setup
1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd document-management-api
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Setup database:**
   ```bash
   npm run migrate
   npm run seed
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/documents` | List documents with pagination/filtering |
| GET | `/documents/:id` | Get single document |
| POST | `/documents` | Create new document |
| PUT | `/documents/:id` | Update document |
| DELETE | `/documents/:id` | Delete document (soft delete) |
| GET | `/documents/stats` | Get document statistics |

#### Query Parameters
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `classification` - Filter by level (1=PUBLIC, 2=INTERNAL, 3=CONFIDENTIAL, 4=SECRET)
- `search` - Search in title/content
- `owner_id` - Filter by owner

### Example Requests

**Create Document:**
```bash
curl -X POST http://localhost:3000/api/documents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Document",
    "content": "Document content here",
    "classification": 2
  }'
```

**Get Documents with Filtering:**
```bash
curl "http://localhost:3000/api/documents?page=1&limit=5&classification=1&search=API"
```

## 🏗️ Architecture

```
src/
├── config/          # App and database configuration
├── controllers/     # Request handlers and business logic
├── database/        # Migrations and seeds
├── middleware/      # Authentication, authorization, validation
├── models/          # Data models using Knex
├── routes/          # API route definitions
├── services/        # Business logic services
└── utils/           # Shared utilities and constants
```

## 🔐 Authentication Roadmap

- [x] **Foundation**: Document CRUD API
- [ ] **Basic Auth**: Username/password authentication
- [ ] **API Keys**: Service-to-service authentication
- [ ] **JWT**: Stateless token authentication
- [ ] **OAuth 2.0**: Third-party authentication
- [ ] **mTLS**: Certificate-based authentication
- [ ] **RBAC**: Role-based permissions
- [ ] **ABAC**: Attribute-based policies with JEXL

## 🧪 Development

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data
- `npm run test` - Run test suite
- `npm run reset-db` - Reset database (rollback + migrate + seed)

### Database Commands
```bash
# Create new migration
npx knex migrate:make migration_name

# Create new seed
npx knex seed:make seed_name

# Check migration status
npx knex migrate:status
```

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express 5
- **Database**: PostgreSQL with Knex.js
- **Validation**: express-validator
- **Logging**: Winston
- **Security**: Helmet, CORS, rate limiting
- **Testing**: Jest + Supertest

## 📄 License

MIT License - see LICENSE file for details.

---

**Status**: ✅ Core API Complete | 🚧 Authentication In Progress
