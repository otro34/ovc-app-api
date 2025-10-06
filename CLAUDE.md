# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OVC-APP API is a REST API for managing sales contracts and purchase orders for a palm oil company. The API uses **file-based storage** with local JSON files instead of a traditional database.

**Tech Stack:**
- Node.js + Express
- JWT authentication (Bearer tokens)
- File-based data storage (JSON files)
- OpenAPI/Swagger for documentation
- Semantic versioning with automated releases

## Data Storage Architecture

The system uses local JSON file storage instead of a database:

```
data/
├── users.json
├── clients.json
├── contracts.json
├── purchase-orders.json
├── system-configuration.json
├── config.json
└── backups/
```

**Key architectural considerations:**
- All file operations must be atomic (use temporary files)
- Implement file locking during write operations
- Validate data before writing to disk
- Provide rollback capability on errors
- In-memory caching for frequently accessed data with cache invalidation

## Core Business Logic

### Contract Management
- Each contract has a unique 6-digit `correlativeNumber` (auto-generated)
- Contracts track: `totalVolume`, `attendedVolume`, and `pendingVolume`
- `pendingVolume = totalVolume - attendedVolume`

### Purchase Orders
- Purchase orders are linked to contracts via `contractId`
- **Business rule:** PO volume cannot exceed contract's `pendingVolume`
- Creating/updating/deleting POs automatically updates the linked contract's volumes

### Data Integrity Rules
- Cannot delete clients with active contracts
- Cannot delete contracts with purchase orders
- All volume calculations must maintain consistency across contracts and POs

## Development Commands

Since this is a new repository with no implementation yet, standard Node.js/Express commands will apply once set up:

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build
npm run build

# Run tests
npm test

# Linting
npm run lint

# Health check (once API is running)
curl http://localhost:3001/api/v1/health
```

## Git Workflow

**Branch Strategy:**
- `main`: Production branch
- `develop`: Development branch
- `feature/HU-XXX-description`: Feature branches for user stories

**Commit Format:**
```
type(scope): description [HU-XXX] #issue

- Detailed list of changes
- Features added
- Tests added
- Documentation updates

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Git Config:**
```bash
git config user.email "otro34@hotmail.com"
git config user.name "Juan Carlos Romaina"
```

## Pull Request Process

1. Create feature branch: `feature/HU-XXX-description`
2. Implement functionality with tests
3. Commit with detailed message following format above
4. Push and create PR to `main`
5. Assign `otro34` as reviewer
6. Request Copilot review
7. Update `docs/seguimiento-historias.md` with completion status

**PR Template:**
```markdown
## 📋 Resumen
[User story description]

### ✨ Funcionalidades implementadas
- [Feature list]

### 🧪 Testing y calidad
- [Tests added]
- [Validations performed]

### 📊 Progreso del proyecto
- [Sprint status]
- [Global progress]

## 🔧 Plan de pruebas
- [ ] [Verification checklist]

🤖 Generated with [Claude Code](https://claude.ai/code)
```

## Testing Requirements

- **Unit tests (critical functions):** 90% coverage
- **Component tests:** 70% coverage
- **Service tests:** 80% coverage
- **Overall minimum:** 70% coverage

## API Standards

- Base URL: `http://localhost:3001/api/v1`
- All responses use standard format:
  ```json
  {
    "success": true|false,
    "data": {},
    "message": "...",
    "timestamp": "ISO-8601"
  }
  ```
- Authentication: JWT Bearer tokens (8-hour expiration)
- Rate limiting: 100 requests/minute per user
- Pagination: `page`, `limit`, with metadata in response

## Security Implementation

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- XSS protection
- File system access restrictions
- Audit logging for all data modifications

## Environment Variables

```bash
PORT=3001                    # Server port
DATA_DIR=./data             # Data files directory
JWT_SECRET=<secret>         # JWT signing secret
NODE_ENV=development        # Environment
BACKUP_ENABLED=true         # Enable automatic backups
LOG_LEVEL=info             # Logging level
```

## Implementation Priorities

Per [api-specification.md](docs/api-specification.md):
1. Set up Node.js + Express with OpenAPI/Swagger
2. Implement file-based storage layer with atomic operations
3. Add JWT authentication
4. Build core API endpoints (auth, users, clients, contracts, purchase-orders, system)
5. Implement business logic for volume tracking
6. Add backup functionality
7. Set up semantic-release
8. Configure GitHub Actions for CI/CD
9. Health check and version endpoints
