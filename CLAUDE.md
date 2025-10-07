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

**CRITICAL: Always run quality checks BEFORE creating PR:**

```bash
# 1. Run linter and fix issues
npm run lint

# 2. Run tests
npm test

# 3. Build the application
npm run build
```

**Only proceed with PR if all checks pass!**

1. Create feature branch: `feature/HU-XXX-description`
2. Implement functionality with tests
3. **Run quality checks** (linter, tests, build) - **MANDATORY**
4. Commit with detailed message following format above
5. **Update `docs/seguimiento-historias.md`** (see instructions below)
6. Push and create PR to `main`
7. Assign `otro34` as reviewer
8. Request Copilot review

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
1. ✅ Set up Node.js + Express with OpenAPI/Swagger
2. ✅ Implement file-based storage layer with atomic operations
3. ✅ Add JWT authentication
4. ⏳ Build core API endpoints (auth ✅, users, clients, contracts, purchase-orders, system)
5. ⏳ Implement business logic for volume tracking
6. ⏳ Add backup functionality
7. ⏳ Set up semantic-release
8. ⏳ Configure GitHub Actions for CI/CD
9. ✅ Health check and version endpoints

## 📊 User Story Tracking Process

**IMPORTANTE:** Después de completar cada historia de usuario o sprint, DEBES actualizar el documento de seguimiento.

### Archivo de Seguimiento
- **Ubicación:** `docs/seguimiento-historias.md`
- **Propósito:** Mantener registro actualizado de todas las historias implementadas
- **Actualización:** Después de cada historia completada o al finalizar un sprint

### Pasos para Actualizar el Seguimiento

#### 1. Después de Completar una Historia de Usuario

Actualiza estas secciones en `docs/seguimiento-historias.md`:

**a) Resumen General**
```markdown
| Métrica | Valor |
|---------|-------|
| **Story Points Completados** | [ACTUALIZAR] |
| **Progreso Global** | [CALCULAR %] |
| **Historias Completadas** | [ACTUALIZAR] de 52 |
```

**b) Estado por Epic**
- Marcar la historia como ✅ Completado
- Actualizar el % de completado del epic
- Agregar notas relevantes

**c) Progreso por Sprint**
- Actualizar el sprint actual con la historia completada
- Agregar branch y commit hash
- Listar entregables clave

**d) Archivos Clave**
- Listar los archivos principales creados/modificados

**e) Actualizar fecha**
```markdown
**Última actualización:** [FECHA ACTUAL]
```

#### 2. Después de Completar un Sprint

**a) Cerrar el Sprint Actual**
- Marcar como ✅ Completado
- Actualizar fecha de finalización
- Listar todas las historias completadas
- Agregar branch y commits
- Documentar entregables completos

**b) Crear Sección para Próximo Sprint**
```markdown
### ⏳ Sprint X: [Nombre] (Próximo)
**Story Points:** X puntos
**Fecha Estimada:** Por definir

**Historias Planificadas:**
- ⏳ HU-XXX: [Título] (X pts)
- ⏳ HU-XXX: [Título] (X pts)
```

**c) Actualizar Métricas de Calidad**
- Coverage actual
- Número de tests
- Tests pasando/fallando

**d) Actualizar Próximos Pasos**
- Listar objetivos del siguiente sprint
- Identificar deuda técnica nueva

#### 3. Template de Actualización por Historia

```markdown
## En el Epic correspondiente:
| HU-XXX | [Título] | X | ✅ Completado | Sprint X | [Descripción breve] |

## En Progreso por Sprint:
**Historias Completadas:**
- ✅ HU-XXX: [Título] (X pts)

**Archivos Clave:**
- `path/to/file.ts` - [Descripción]
- `tests/file.http` - [Descripción]

**Branch:** `feature/HU-XXX-description`
**Commit:** `[hash]`
```

#### 4. Verificación Antes de Commit

Antes de hacer commit, verifica que actualizaste:
- [ ] ✅ Resumen General (story points, progreso)
- [ ] ✅ Estado por Epic (marcar historia)
- [ ] ✅ Progreso por Sprint (agregar detalles)
- [ ] ✅ Archivos Clave (listar archivos nuevos)
- [ ] ✅ Métricas de Calidad (si cambió coverage)
- [ ] ✅ Fecha de última actualización

#### 5. Comandos Git para el Seguimiento

```bash
# Después de actualizar seguimiento-historias.md
git add docs/seguimiento-historias.md
git commit -m "docs(tracking): update user story tracking after [HU-XXX]"

# O incluir en el commit principal de la feature
git add .
git commit -m "feat(scope): complete [HU-XXX] - [description]

[Descripción detallada]

Updated docs/seguimiento-historias.md with completion status.
"
```

### Ejemplo de Actualización Completa

Después de completar HU-004 (JWT Authentication):

```markdown
## Resumen General
| **Story Points Completados** | 39 |  ← Actualizado de 31
| **Progreso Global** | 13.4% |      ← Calculado (39/291)
| **Historias Completadas** | 7 de 52 | ← Actualizado de 6

## Epic 2: Authentication & Security ✅
| HU-004 | JWT Authentication System | 8 | ✅ Completado | Sprint 2 | JWT, login/register |

## Sprint 2: Authentication & Security (Completado)
**Historias Completadas:**
- ✅ HU-004: JWT Authentication System (8 pts)

**Branch:** `feature/HU-004-sprint-2-auth`
**Commit:** `abc1234`

**Archivos Clave:**
- `src/middleware/auth.ts` - JWT middleware
- `src/services/AuthService.ts` - Auth service
- `tests/auth.http` - HTTP tests

**Última actualización:** 2025-10-06
```

### Notas Importantes

1. **Siempre actualiza el documento antes de hacer PR**
2. **Incluye el update del seguimiento en tu commit**
3. **Verifica que los números cuadren** (story points, %)
4. **Mantén el formato consistente**
5. **Agrega notas técnicas relevantes**
6. **Actualiza la fecha de última modificación**

### Recursos

- [User Stories](docs/user-stories.md) - Lista completa de historias
- [Development Plan](docs/development-plan.md) - Plan de sprints
- [Seguimiento de Historias](docs/seguimiento-historias.md) - Documento a actualizar
