# OVC-APP API

REST API for the OVC-APP (Oil & Vegetable Company Application) - A sales contract and purchase order management system for a palm oil company.

## Features

- 🔐 **JWT Authentication** with role-based access control (admin/user)
- 💾 **File-based storage** using local JSON files with atomic operations
- 📊 **Contract Management** with automatic correlative number generation
- 📦 **Purchase Order Management** with volume tracking
- 🔄 **Automatic Backups** with configurable frequency
- 📝 **Comprehensive Logging** with Winston
- 🧪 **Full Test Coverage** with Jest
- 📚 **OpenAPI/Swagger Documentation**
- 🐳 **Docker Support** (coming soon)

## Tech Stack

- **Runtime:** Node.js 18+ LTS
- **Framework:** Express 5.x
- **Language:** TypeScript 5.x
- **Testing:** Jest + Supertest
- **Logging:** Winston
- **Security:** Helmet, CORS, bcrypt, JWT

## Installation

```bash
# Clone the repository
git clone https://github.com/otro34/ovc-app-api.git
cd ovc-app-api

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
# Make sure to change JWT_SECRET in production!
```

## Development

```bash
# Start development server with hot reload
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
ovc-app-api/
├── src/
│   ├── config/          # Configuration (env, logger)
│   ├── controllers/     # Route controllers
│   ├── middlewares/     # Express middlewares
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── services/        # Business logic & file storage
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── app.ts           # Express app configuration
│   └── index.ts         # Application entry point
├── tests/               # Test files
├── data/                # JSON data files (gitignored)
│   └── backups/         # Automated backups
├── docs/                # Project documentation
└── dist/                # Compiled JavaScript (gitignored)
```

## API Endpoints

### Health & Version
- `GET /health` - Health check endpoint
- `GET /version` - API version information

### Authentication (Coming in Sprint 2)
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user

### Users (Coming in Sprint 4)
- `GET /api/v1/users` - List users (admin only)
- `POST /api/v1/users` - Create user (admin only)
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

For complete API documentation, see [docs/api-specification.md](docs/api-specification.md)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `DATA_DIR` | Data files directory | `./data` |
| `JWT_SECRET` | JWT signing secret | `dev-secret-change-in-production` |
| `JWT_EXPIRATION` | JWT token expiration | `8h` |
| `LOG_LEVEL` | Logging level | `info` |
| `BACKUP_ENABLED` | Enable automatic backups | `true` |
| `BACKUP_FREQUENCY` | Backup frequency | `daily` |

## Testing

The project includes comprehensive tests with >70% coverage requirement.

```bash
# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# View coverage report
open coverage/lcov-report/index.html
```

### Test Coverage Thresholds
- **Functions:** 70%
- **Lines:** 70%
- **Branches:** 70%
- **Statements:** 70%

## Sprint 1 Completion ✅

**Completed User Stories:**
- ✅ HU-001: Project Setup and Configuration (3 pts)
- ✅ HU-002: File-Based Storage Layer (8 pts)
- ✅ HU-003: Environment Configuration and Logging (3 pts)
- ✅ HU-039: Unit Testing Setup (3 pts)
- ✅ HU-044: Hot Reload Development Server (2 pts)

**Total Points:** 19 pts

**Test Results:**
- ✅ 26 tests passing
- ✅ Coverage: 74.17% statements, 71.69% branches
- ✅ Build successful
- ✅ Linter passing

## Documentation

- [API Specification](docs/api-specification.md) - Complete API documentation
- [Development Plan](docs/development-plan.md) - Project roadmap and sprints
- [User Stories](docs/user-stories.md) - All 52 user stories
- [Development Flow](docs/development-flow.md) - Git workflow and conventions
- [CLAUDE.md](CLAUDE.md) - Guide for AI assistants

## Git Workflow

This project follows a structured git workflow with conventional commits:

```bash
# Commit format
type(scope): description [HU-XXX] #issue

# Example
feat(storage): implement file-based storage layer [HU-002]

- Added FileStorage class with CRUD operations
- Implemented atomic writes with file locking
- Added caching with TTL
- 90%+ test coverage

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Contributing

1. Create feature branch: `feature/HU-XXX-description`
2. Implement with tests
3. Ensure tests pass and coverage meets thresholds
4. Run linter and fix any issues
5. Create PR to `main`
6. Assign `otro34` as reviewer

## License

ISC

## Authors

- Juan Carlos Romaina (otro34@hotmail.com)
- Claude Code (AI Assistant)
