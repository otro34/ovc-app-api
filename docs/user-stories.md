# User Stories - OVC-APP API

## Epic 1: Project Foundation & Infrastructure

### HU-001: Project Setup and Configuration
**Como** desarrollador
**Quiero** configurar el proyecto base con Node.js, Express y TypeScript
**Para que** pueda comenzar a desarrollar la API con las herramientas correctas

**Criterios de aceptación:**
- [ ] Proyecto inicializado con Node.js y npm
- [ ] TypeScript configurado con tsconfig.json
- [ ] Express instalado y configurado
- [ ] Estructura de carpetas creada (src/, data/, tests/)
- [ ] Scripts npm configurados (dev, build, test, lint)
- [ ] ESLint y Prettier configurados
- [ ] .gitignore configurado correctamente
- [ ] README.md con instrucciones básicas

**Estimación:** 3 puntos
**Prioridad:** Crítica
**Dependencias:** Ninguna

---

### HU-002: File-Based Storage Layer
**Como** desarrollador
**Quiero** implementar una capa de almacenamiento basada en archivos JSON
**Para que** pueda persistir datos sin necesidad de una base de datos

**Criterios de aceptación:**
- [ ] Clase/servicio FileStorage con operaciones CRUD
- [ ] Operaciones atómicas con archivos temporales
- [ ] File locking durante escrituras
- [ ] Validación de datos antes de escribir
- [ ] Rollback capability en caso de errores
- [ ] Estructura de metadata en archivos JSON
- [ ] Tests unitarios con 90%+ cobertura
- [ ] Manejo de errores de I/O

**Estimación:** 8 puntos
**Prioridad:** Crítica
**Dependencias:** HU-001

---

### HU-003: Environment Configuration and Logging
**Como** desarrollador
**Quiero** configurar variables de entorno y sistema de logging
**Para que** la aplicación sea configurable y tenga trazabilidad

**Criterios de aceptación:**
- [ ] dotenv configurado
- [ ] Archivo .env.example creado
- [ ] Variables de entorno documentadas
- [ ] Logger configurado (winston o similar)
- [ ] Niveles de log implementados (error, warn, info, debug)
- [ ] Log rotation configurado
- [ ] Logs de auditoría para modificaciones de datos
- [ ] Tests para configuración

**Estimación:** 3 puntos
**Prioridad:** Alta
**Dependencias:** HU-001

---

## Epic 2: Authentication & Security

### HU-004: JWT Authentication System
**Como** desarrollador
**Quiero** implementar autenticación con JWT
**Para que** los usuarios puedan autenticarse de forma segura

**Criterios de aceptación:**
- [ ] JWT token generation con expiración (8 horas)
- [ ] Middleware de autenticación
- [ ] Bcrypt para hash de contraseñas
- [ ] POST /auth/login endpoint
- [ ] POST /auth/logout endpoint
- [ ] GET /auth/me endpoint
- [ ] Validación de tokens
- [ ] Refresh token strategy (opcional)
- [ ] Tests de autenticación

**Estimación:** 8 puntos
**Prioridad:** Crítica
**Dependencias:** HU-002, HU-003

---

### HU-005: Role-Based Access Control (RBAC)
**Como** administrador
**Quiero** que el sistema tenga control de acceso por roles
**Para que** solo usuarios autorizados accedan a ciertas funciones

**Criterios de aceptación:**
- [ ] Middleware de autorización por rol (admin/user)
- [ ] Validación de permisos en endpoints
- [ ] Admin-only endpoints protegidos
- [ ] Mensajes de error apropiados (403 Forbidden)
- [ ] Tests para cada rol
- [ ] Documentación de permisos por endpoint

**Estimación:** 5 puntos
**Prioridad:** Alta
**Dependencias:** HU-004

---

### HU-006: Security Middleware
**Como** desarrollador
**Quiero** implementar middleware de seguridad
**Para que** la API esté protegida contra ataques comunes

**Criterios de aceptación:**
- [ ] Helmet.js configurado
- [ ] CORS configurado
- [ ] Rate limiting (100 req/min por usuario)
- [ ] Input validation middleware
- [ ] XSS protection
- [ ] SQL injection protection (aunque sea file-based)
- [ ] Request sanitization
- [ ] Security headers configurados

**Estimación:** 5 puntos
**Prioridad:** Alta
**Dependencias:** HU-004

---

## Epic 3: User Management

### HU-007: User CRUD Operations
**Como** administrador
**Quiero** gestionar usuarios del sistema
**Para que** pueda controlar quién tiene acceso a la aplicación

**Criterios de aceptación:**
- [ ] GET /users (list with pagination)
- [ ] POST /users (create)
- [ ] GET /users/:id (read)
- [ ] PUT /users/:id (update)
- [ ] DELETE /users/:id (delete)
- [ ] Search by username/name
- [ ] Filter by role
- [ ] Validation de campos requeridos
- [ ] Tests para todos los endpoints

**Estimación:** 8 puntos
**Prioridad:** Alta
**Dependencias:** HU-004, HU-005

---

### HU-008: User Password Management
**Como** usuario
**Quiero** poder cambiar mi contraseña
**Para que** pueda mantener mi cuenta segura

**Criterios de aceptación:**
- [ ] POST /auth/change-password (usuario actual)
- [ ] PUT /users/:id/password (admin)
- [ ] Validación de contraseña actual
- [ ] Validación de fortaleza de contraseña
- [ ] Confirmación de nueva contraseña
- [ ] Error si contraseña es débil
- [ ] Tests de validación

**Estimación:** 3 puntos
**Prioridad:** Media
**Dependencias:** HU-007

---

### HU-009: User Statistics
**Como** administrador
**Quiero** ver estadísticas de usuarios
**Para que** pueda monitorear el uso del sistema

**Criterios de aceptación:**
- [ ] GET /users/stats endpoint
- [ ] Total de usuarios
- [ ] Usuarios por rol (admin/user)
- [ ] Usuarios activos/inactivos
- [ ] Response en formato estándar
- [ ] Tests unitarios

**Estimación:** 2 puntos
**Prioridad:** Baja
**Dependencias:** HU-007

---

## Epic 4: Client Management

### HU-010: Client CRUD Operations
**Como** usuario
**Quiero** gestionar clientes
**Para que** pueda mantener un registro de compradores

**Criterios de aceptación:**
- [ ] GET /clients (list with pagination)
- [ ] POST /clients (create)
- [ ] GET /clients/:id (read)
- [ ] PUT /clients/:id (update)
- [ ] DELETE /clients/:id (delete)
- [ ] Search by name/email
- [ ] Sort by name/email/createdAt
- [ ] Validación de campos
- [ ] Tests completos

**Estimación:** 8 puntos
**Prioridad:** Alta
**Dependencias:** HU-004, HU-005

---

### HU-011: Client Validation and Business Rules
**Como** usuario
**Quiero** que el sistema valide datos de clientes
**Para que** la información sea consistente

**Criterios de aceptación:**
- [ ] Validación de email format
- [ ] Validación de teléfono
- [ ] Nombre requerido
- [ ] No permitir eliminar clientes con contratos activos
- [ ] Mensajes de error descriptivos
- [ ] Tests de validación

**Estimación:** 3 puntos
**Prioridad:** Media
**Dependencias:** HU-010

---

### HU-012: Client Contracts View
**Como** usuario
**Quiero** ver todos los contratos de un cliente
**Para que** pueda analizar el historial de negocios

**Criterios de aceptación:**
- [ ] GET /clients/:id/contracts endpoint
- [ ] Filter por status (active/completed/cancelled)
- [ ] Filter por fecha de inicio/fin
- [ ] Response incluye detalles de contrato
- [ ] Paginación implementada
- [ ] Tests completos

**Estimación:** 5 puntos
**Prioridad:** Media
**Dependencias:** HU-010, HU-013

---

## Epic 5: Contract Management

### HU-013: Contract CRUD Operations
**Como** usuario
**Quiero** gestionar contratos de venta
**Para que** pueda registrar acuerdos comerciales

**Criterios de aceptación:**
- [ ] GET /contracts (list with pagination)
- [ ] POST /contracts (create)
- [ ] GET /contracts/:id (read)
- [ ] PUT /contracts/:id (update)
- [ ] DELETE /contracts/:id (delete)
- [ ] Filter por clientId, status, fechas
- [ ] Search por correlativeNumber
- [ ] Validación de campos
- [ ] Tests completos

**Estimación:** 8 puntos
**Prioridad:** Crítica
**Dependencias:** HU-010

---

### HU-014: Contract Correlative Number Generation
**Como** usuario
**Quiero** que los contratos tengan números correlativos únicos
**Para que** pueda identificarlos fácilmente

**Criterios de aceptación:**
- [ ] Auto-generación de correlativeNumber (6 dígitos)
- [ ] Formato: YYXXXX (año + secuencial)
- [ ] GET /contracts/correlative/next endpoint
- [ ] Validación de unicidad
- [ ] Rollback si falla creación
- [ ] Tests de generación y unicidad

**Estimación:** 5 puntos
**Prioridad:** Alta
**Dependencias:** HU-013

---

### HU-015: Contract Volume Tracking
**Como** usuario
**Quiero** que el sistema calcule volúmenes automáticamente
**Para que** pueda saber cuánto volumen queda disponible

**Criterios de aceptación:**
- [ ] totalVolume, attendedVolume, pendingVolume calculados
- [ ] pendingVolume = totalVolume - attendedVolume
- [ ] Actualización automática al crear/modificar/eliminar POs
- [ ] Validación de consistencia
- [ ] Tests de cálculos
- [ ] Error si los cálculos no cuadran

**Estimación:** 8 puntos
**Prioridad:** Crítica
**Dependencias:** HU-013, HU-017

---

### HU-016: Contract Statistics
**Como** usuario
**Quiero** ver estadísticas de contratos
**Para que** pueda tener una visión general del negocio

**Criterios de aceptación:**
- [ ] GET /contracts/stats endpoint
- [ ] Total contratos
- [ ] Contratos por status (active/completed/cancelled)
- [ ] Total volume, attended, pending
- [ ] Cálculos correctos
- [ ] Tests unitarios

**Estimación:** 3 puntos
**Prioridad:** Media
**Dependencias:** HU-013, HU-015

---

### HU-017: Contract Business Rules
**Como** usuario
**Quiero** que el sistema valide reglas de negocio
**Para que** los datos sean consistentes

**Criterios de aceptación:**
- [ ] startDate debe ser antes que endDate
- [ ] totalVolume debe ser > 0
- [ ] salePrice debe ser > 0
- [ ] No eliminar contrato con purchase orders
- [ ] Status válido (active/completed/cancelled)
- [ ] Tests de validación

**Estimación:** 3 puntos
**Prioridad:** Alta
**Dependencias:** HU-013

---

### HU-018: Contract Purchase Orders View
**Como** usuario
**Quiero** ver todas las órdenes de compra de un contrato
**Para que** pueda hacer seguimiento del cumplimiento

**Criterios de aceptación:**
- [ ] GET /contracts/:id/purchase-orders endpoint
- [ ] Lista todas las POs del contrato
- [ ] Response incluye detalles de PO
- [ ] Paginación si es necesario
- [ ] Tests completos

**Estimación:** 3 puntos
**Prioridad:** Media
**Dependencias:** HU-013, HU-019

---

## Epic 6: Purchase Order Management

### HU-019: Purchase Order CRUD Operations
**Como** usuario
**Quiero** gestionar órdenes de compra
**Para que** pueda registrar entregas contra contratos

**Criterios de aceptación:**
- [ ] GET /purchase-orders (list with pagination)
- [ ] POST /purchase-orders (create)
- [ ] GET /purchase-orders/:id (read)
- [ ] PUT /purchase-orders/:id (update)
- [ ] DELETE /purchase-orders/:id (delete)
- [ ] Filter por contractId, status, fechas
- [ ] Validación de campos
- [ ] Tests completos

**Estimación:** 8 puntos
**Prioridad:** Crítica
**Dependencias:** HU-013

---

### HU-020: Purchase Order Volume Validation
**Como** usuario
**Quiero** que el sistema valide volúmenes de PO
**Para que** no se exceda el volumen disponible del contrato

**Criterios de aceptación:**
- [ ] Validar que PO.volume <= Contract.pendingVolume
- [ ] Error descriptivo si se excede
- [ ] Validar al crear y actualizar PO
- [ ] Considerar volumen de PO existente al actualizar
- [ ] Tests de validación

**Estimación:** 5 puntos
**Prioridad:** Crítica
**Dependencias:** HU-019, HU-015

---

### HU-021: Purchase Order Status Management
**Como** usuario
**Quiero** cambiar el estado de órdenes de compra
**Para que** pueda marcar entregas o cancelaciones

**Criterios de aceptación:**
- [ ] Estados: pending, delivered, cancelled
- [ ] POST /purchase-orders/:id/cancel endpoint
- [ ] Actualizar contract volumes al cambiar status
- [ ] Validación de transiciones de estado
- [ ] Tests de cambios de estado

**Estimación:** 5 puntos
**Prioridad:** Alta
**Dependencias:** HU-019, HU-015

---

### HU-022: Purchase Order Contract Integration
**Como** sistema
**Quiero** actualizar automáticamente los volúmenes del contrato
**Para que** los datos estén sincronizados

**Criterios de aceptación:**
- [ ] Al crear PO: actualizar contract.attendedVolume
- [ ] Al actualizar PO: recalcular volumes
- [ ] Al eliminar PO: restaurar volume a contract
- [ ] Operaciones atómicas (todo o nada)
- [ ] Tests de integración
- [ ] Rollback en caso de error

**Estimación:** 8 puntos
**Prioridad:** Crítica
**Dependencias:** HU-019, HU-015

---

## Epic 7: System Configuration

### HU-023: System Configuration Management
**Como** administrador
**Quiero** configurar parámetros del sistema
**Para que** pueda adaptar la aplicación a las necesidades

**Criterios de aceptación:**
- [ ] GET /system/configuration endpoint (admin)
- [ ] PUT /system/configuration endpoint (admin)
- [ ] Configuración de timeout de sesión
- [ ] Configuración de empresa (nombre, logo)
- [ ] Configuración regional (currency, dateFormat, timezone)
- [ ] Configuración de archivos (maxFileSize, allowedFileTypes)
- [ ] Modo mantenimiento
- [ ] Tests completos

**Estimación:** 8 puntos
**Prioridad:** Media
**Dependencias:** HU-005

---

### HU-024: System Configuration Validation
**Como** sistema
**Quiero** validar configuraciones del sistema
**Para que** no se ingresen valores inválidos

**Criterios de aceptación:**
- [ ] sessionTimeout entre 5 y 480 minutos
- [ ] maxFileSize entre 1 y 100 MB
- [ ] allowedFileTypes válidos
- [ ] currency válida
- [ ] timezone válida
- [ ] Tests de validación

**Estimación:** 3 puntos
**Prioridad:** Media
**Dependencias:** HU-023

---

## Epic 8: Backup & Recovery

### HU-025: Manual Backup System
**Como** administrador
**Quiero** crear backups manuales
**Para que** pueda respaldar datos antes de operaciones críticas

**Criterios de aceptación:**
- [ ] POST /system/backup endpoint (admin)
- [ ] Crear backup de todos los archivos JSON
- [ ] Backup comprimido (.zip)
- [ ] Backup con timestamp en nombre
- [ ] Guardar en data/backups/
- [ ] Response con detalles del backup
- [ ] Tests de creación

**Estimación:** 5 puntos
**Prioridad:** Alta
**Dependencias:** HU-002, HU-005

---

### HU-026: Automatic Backup System
**Como** administrador
**Quiero** backups automáticos programados
**Para que** los datos se respalden sin intervención manual

**Criterios de aceptación:**
- [ ] Scheduler para backups (node-cron)
- [ ] Frecuencia configurable (daily/weekly/monthly)
- [ ] Backup automático a medianoche
- [ ] Configuración en SystemConfiguration
- [ ] Logs de backups automáticos
- [ ] Tests del scheduler

**Estimación:** 5 puntos
**Prioridad:** Media
**Dependencias:** HU-025, HU-023

---

### HU-027: Backup Management
**Como** administrador
**Quiero** gestionar backups existentes
**Para que** pueda ver y limpiar backups antiguos

**Criterios de aceptación:**
- [ ] GET /system/backup/list endpoint (admin)
- [ ] Lista con paginación
- [ ] DELETE /system/backup/:backupId endpoint
- [ ] Información de tamaño y fecha
- [ ] Validación de permisos
- [ ] Tests completos

**Estimación:** 3 puntos
**Prioridad:** Baja
**Dependencias:** HU-025

---

### HU-028: Backup Retention Policy
**Como** administrador
**Quiero** que backups antiguos se eliminen automáticamente
**Para que** no se llene el disco

**Criterios de aceptación:**
- [ ] Retención de 30 días por defecto
- [ ] Limpieza automática de backups antiguos
- [ ] Configurable en SystemConfiguration
- [ ] Log de backups eliminados
- [ ] Tests de retención

**Estimación:** 3 puntos
**Prioridad:** Baja
**Dependencias:** HU-026

---

## Epic 9: API Documentation & Standards

### HU-029: OpenAPI/Swagger Documentation
**Como** desarrollador
**Quiero** documentación OpenAPI interactiva
**Para que** pueda entender y probar la API fácilmente

**Criterios de aceptación:**
- [ ] Swagger UI configurado
- [ ] OpenAPI 3.0 specification
- [ ] Todos los endpoints documentados
- [ ] Request/response schemas definidos
- [ ] Examples incluidos
- [ ] Accessible en /api/docs
- [ ] Try-it-out funcional

**Estimación:** 8 puntos
**Prioridad:** Alta
**Dependencias:** HU-001

---

### HU-030: API Response Standardization
**Como** desarrollador
**Quiero** respuestas consistentes en todos los endpoints
**Para que** el consumo de la API sea predecible

**Criterios de aceptación:**
- [ ] Middleware para formatear responses
- [ ] Success response format estándar
- [ ] Error response format estándar
- [ ] Timestamp en todas las responses
- [ ] Códigos HTTP apropiados
- [ ] Tests de formato

**Estimación:** 3 puntos
**Prioridad:** Alta
**Dependencias:** HU-001

---

### HU-031: Error Handling & Error Codes
**Como** desarrollador
**Quiero** manejo consistente de errores
**Para que** los errores sean informativos y manejables

**Criterios de aceptación:**
- [ ] Error codes documentados
- [ ] Custom error classes
- [ ] Error middleware centralizado
- [ ] Stack traces solo en development
- [ ] Mensajes descriptivos
- [ ] Tests de error handling

**Estimación:** 5 puntos
**Prioridad:** Alta
**Dependencias:** HU-030

---

### HU-032: Request Validation
**Como** desarrollador
**Quiero** validación automática de requests
**Para que** los datos de entrada sean correctos

**Criterios de aceptación:**
- [ ] Validation middleware (joi, express-validator, o zod)
- [ ] Schemas para todos los endpoints
- [ ] Validación de tipos de datos
- [ ] Validación de rangos
- [ ] Error messages descriptivos
- [ ] Tests de validación

**Estimación:** 8 puntos
**Prioridad:** Alta
**Dependencias:** HU-030, HU-031

---

### HU-033: Pagination Standardization
**Como** desarrollador
**Quiero** paginación consistente en todos los list endpoints
**Para que** pueda manejar grandes volúmenes de datos

**Criterios de aceptación:**
- [ ] Pagination utility/helper
- [ ] Query params: page, limit
- [ ] Default limit: 20
- [ ] Response con metadata de paginación
- [ ] hasNext, hasPrev calculados
- [ ] Tests de paginación

**Estimación:** 3 puntos
**Prioridad:** Media
**Dependencias:** HU-030

---

## Epic 10: Performance & Optimization

### HU-034: In-Memory Caching
**Como** sistema
**Quiero** cachear datos en memoria
**Para que** las lecturas sean más rápidas

**Criterios de aceptación:**
- [ ] Cache layer implementado (node-cache o similar)
- [ ] Cache de datos frecuentes (clients, contracts)
- [ ] TTL configurable
- [ ] Cache invalidation al modificar datos
- [ ] Cache statistics
- [ ] Tests de cache

**Estimación:** 8 puntos
**Prioridad:** Baja
**Dependencias:** HU-002

---

### HU-035: Search Optimization
**Como** usuario
**Quiero** búsquedas rápidas
**Para que** pueda encontrar información eficientemente

**Criterios de aceptación:**
- [ ] Índices en memoria para búsquedas
- [ ] Full-text search para strings
- [ ] Búsqueda case-insensitive
- [ ] Búsqueda parcial (contains)
- [ ] Performance tests
- [ ] Benchmarks documentados

**Estimación:** 5 puntos
**Prioridad:** Baja
**Dependencias:** HU-034

---

## Epic 11: Health & Monitoring

### HU-036: Health Check Endpoint
**Como** DevOps
**Quiero** un endpoint de health check
**Para que** pueda monitorear el estado de la API

**Criterios de aceptación:**
- [ ] GET /health endpoint (public)
- [ ] Verificación de archivos de datos
- [ ] Status de cada archivo (OK/ERROR)
- [ ] Version de la API
- [ ] Uptime del servidor
- [ ] Response time < 100ms
- [ ] Tests de health check

**Estimación:** 3 puntos
**Prioridad:** Alta
**Dependencias:** HU-002

---

### HU-037: API Version Endpoint
**Como** cliente de la API
**Quiero** conocer la versión de la API
**Para que** pueda verificar compatibilidad

**Criterios de aceptación:**
- [ ] GET /version endpoint (public)
- [ ] Semantic versioning (MAJOR.MINOR.PATCH)
- [ ] Version desde package.json
- [ ] Build date/commit hash (opcional)
- [ ] Tests de version endpoint

**Estimación:** 2 puntos
**Prioridad:** Media
**Dependencias:** HU-001

---

### HU-038: Request Logging & Audit Trail
**Como** administrador
**Quiero** logs de todas las operaciones
**Para que** pueda auditar acciones en el sistema

**Criterios de aceptación:**
- [ ] Log de todos los requests
- [ ] Log de modificaciones de datos (create, update, delete)
- [ ] User tracking (quién hizo qué)
- [ ] Timestamp de operaciones
- [ ] Logs rotados y archivados
- [ ] No loggear información sensible (passwords)

**Estimación:** 5 puntos
**Prioridad:** Media
**Dependencias:** HU-003

---

## Epic 12: Testing & Quality

### HU-039: Unit Testing Setup
**Como** desarrollador
**Quiero** framework de testing configurado
**Para que** pueda escribir y ejecutar tests

**Criterios de aceptación:**
- [ ] Jest o Mocha configurado
- [ ] Test script en package.json
- [ ] Coverage report configurado
- [ ] Tests en carpeta tests/
- [ ] Mocking libraries configuradas
- [ ] CI puede ejecutar tests

**Estimación:** 3 puntos
**Prioridad:** Crítica
**Dependencias:** HU-001

---

### HU-040: Integration Testing
**Como** desarrollador
**Quiero** tests de integración
**Para que** pueda verificar el funcionamiento end-to-end

**Criterios de aceptación:**
- [ ] Supertest o similar configurado
- [ ] Tests de endpoints principales
- [ ] Test data fixtures
- [ ] Database/file cleanup entre tests
- [ ] Tests de flujos completos
- [ ] Coverage de integración > 70%
- [ ] HTTP test files (.http) para cada endpoint en tests/ folder
- [ ] HTTP files organizados por módulo (auth.http, users.http, clients.http, etc.)

**Estimación:** 8 puntos
**Prioridad:** Alta
**Dependencias:** HU-039

---

### HU-041: Test Coverage Requirements
**Como** desarrollador
**Quiero** asegurar cobertura de tests
**Para que** el código esté bien testeado

**Criterios de aceptación:**
- [ ] Coverage thresholds configurados
- [ ] Funciones críticas: 90%
- [ ] Servicios: 80%
- [ ] Componentes: 70%
- [ ] Overall: 70%
- [ ] CI falla si coverage < threshold
- [ ] Coverage report en cada PR

**Estimación:** 2 puntos
**Prioridad:** Alta
**Dependencias:** HU-039, HU-040

---

## Epic 13: Development Experience

### HU-042: Development Data Seeding
**Como** desarrollador
**Quiero** poblar la base de datos con datos de prueba
**Para que** pueda desarrollar y probar fácilmente

**Criterios de aceptación:**
- [ ] POST /dev/seed-data endpoint (dev only)
- [ ] Crear usuarios de prueba
- [ ] Crear clientes de prueba
- [ ] Crear contratos de prueba
- [ ] Crear purchase orders de prueba
- [ ] Solo disponible en NODE_ENV=development

**Estimación:** 5 puntos
**Prioridad:** Media
**Dependencias:** HU-007, HU-010, HU-013, HU-019

---

### HU-043: Development Data Reset
**Como** desarrollador
**Quiero** resetear todos los datos
**Para que** pueda empezar desde cero en testing

**Criterios de aceptación:**
- [ ] DELETE /dev/reset-data endpoint (dev only)
- [ ] Eliminar todos los datos
- [ ] Recrear archivos vacíos
- [ ] Crear admin user por defecto
- [ ] Solo disponible en NODE_ENV=development
- [ ] Confirmación requerida

**Estimación:** 3 puntos
**Prioridad:** Baja
**Dependencias:** HU-042

---

### HU-044: Hot Reload Development Server
**Como** desarrollador
**Quiero** hot reload al hacer cambios
**Para que** pueda desarrollar más rápidamente

**Criterios de aceptación:**
- [ ] Nodemon o ts-node-dev configurado
- [ ] npm run dev con auto-restart
- [ ] Watch en archivos .ts
- [ ] Preservar datos entre reloads
- [ ] Fast refresh < 2 segundos

**Estimación:** 2 puntos
**Prioridad:** Alta
**Dependencias:** HU-001

---

## Epic 14: CI/CD & Deployment

### HU-045: GitHub Actions CI Pipeline
**Como** desarrollador
**Quiero** CI automatizado en GitHub
**Para que** el código se valide automáticamente

**Criterios de aceptación:**
- [ ] GitHub Actions workflow configurado
- [ ] Run tests en cada push
- [ ] Run lint en cada push
- [ ] Build verification
- [ ] Matrix testing (Node 18, 20)
- [ ] Status badges en README
- [ ] Fail PR si tests fallan

**Estimación:** 5 puntos
**Prioridad:** Alta
**Dependencias:** HU-039, HU-040

---

### HU-046: Semantic Release Setup
**Como** desarrollador
**Quiero** releases automatizados con semantic-release
**Para que** el versionado sea consistente

**Criterios de aceptación:**
- [ ] semantic-release configurado
- [ ] Conventional commits enforcement
- [ ] Auto-generate CHANGELOG.md
- [ ] Auto-bump version en package.json
- [ ] GitHub releases creados automáticamente
- [ ] Tags de git creados
- [ ] Documentación del proceso

**Estimación:** 5 puntos
**Prioridad:** Media
**Dependencias:** HU-045

---

### HU-047: Docker Configuration
**Como** DevOps
**Quiero** containerizar la aplicación
**Para que** sea fácil de desplegar

**Criterios de aceptación:**
- [ ] Dockerfile creado
- [ ] docker-compose.yml para desarrollo
- [ ] Multi-stage build para producción
- [ ] Volume para data/
- [ ] Environment variables configuradas
- [ ] Health check en container
- [ ] Documentación de comandos Docker

**Estimación:** 5 puntos
**Prioridad:** Baja
**Dependencias:** HU-001

---

### HU-048: Production Deployment Guide
**Como** DevOps
**Quiero** documentación de deployment
**Para que** pueda desplegar en producción

**Criterios de aceptación:**
- [ ] DEPLOYMENT.md creado
- [ ] Instrucciones paso a paso
- [ ] Environment variables documentadas
- [ ] File permissions documentadas
- [ ] Backup strategy documentada
- [ ] Rollback procedures documentadas
- [ ] Security checklist

**Estimación:** 3 puntos
**Prioridad:** Media
**Dependencias:** HU-047

---

## Epic 15: Advanced Features (Future)

### HU-049: Export Functionality
**Como** usuario
**Quiero** exportar datos a diferentes formatos
**Para que** pueda analizar información externamente

**Criterios de aceptación:**
- [ ] Export a CSV
- [ ] Export a Excel (XLSX)
- [ ] Export a PDF
- [ ] Export contratos y POs
- [ ] Filters aplicados al export
- [ ] Tests de export

**Estimación:** 8 puntos
**Prioridad:** Baja
**Dependencias:** HU-013, HU-019

---

### HU-050: Email Notifications
**Como** usuario
**Quiero** recibir notificaciones por email
**Para que** esté informado de eventos importantes

**Criterios de aceptación:**
- [ ] Nodemailer configurado
- [ ] Templates de email (HTML)
- [ ] Notificación de contratos próximos a vencer
- [ ] Notificación de POs entregados
- [ ] Configuración en SystemConfiguration
- [ ] Tests de envío (mocked)

**Estimación:** 8 puntos
**Prioridad:** Baja
**Dependencias:** HU-023

---

### HU-051: Advanced Reporting
**Como** usuario
**Quiero** reportes avanzados
**Para que** pueda analizar el negocio

**Criterios de aceptación:**
- [ ] GET /reports/sales endpoint
- [ ] Reports por período
- [ ] Reports por cliente
- [ ] Charts data (JSON para gráficos)
- [ ] Export de reports
- [ ] Tests de reportes

**Estimación:** 13 puntos
**Prioridad:** Baja
**Dependencias:** HU-013, HU-019

---

### HU-052: File Upload Support
**Como** usuario
**Quiero** subir archivos adjuntos
**Para que** pueda asociar documentos a contratos/POs

**Criterios de aceptación:**
- [ ] Multer configurado
- [ ] POST /files/upload endpoint
- [ ] Validación de tipo de archivo
- [ ] Validación de tamaño
- [ ] Storage en data/files/
- [ ] Asociación con contratos/POs
- [ ] Tests de upload

**Estimación:** 8 puntos
**Prioridad:** Baja
**Dependencias:** HU-023

---

## Summary

**Total User Stories:** 52
**Total Story Points:** 291 puntos

**Por Prioridad:**
- **Crítica:** 10 historias (79 puntos)
- **Alta:** 14 historias (78 puntos)
- **Media:** 15 historias (66 puntos)
- **Baja:** 13 historias (68 puntos)

**Por Epic:**
1. **Project Foundation:** 3 historias (14 puntos)
2. **Authentication:** 3 historias (18 puntos)
3. **User Management:** 3 historias (13 puntos)
4. **Client Management:** 3 historias (16 puntos)
5. **Contract Management:** 6 historias (30 puntos)
6. **Purchase Order Management:** 4 historias (26 puntos)
7. **System Configuration:** 2 historias (11 puntos)
8. **Backup & Recovery:** 4 historias (16 puntos)
9. **API Documentation:** 5 historias (27 puntos)
10. **Performance:** 2 historias (13 puntos)
11. **Health & Monitoring:** 3 historias (10 puntos)
12. **Testing:** 3 historias (13 puntos)
13. **Development Experience:** 3 historias (10 puntos)
14. **CI/CD:** 4 historias (18 puntos)
15. **Advanced Features:** 4 historias (37 puntos)

**Estimación Fibonacci:** 1, 2, 3, 5, 8, 13
**Velocidad estimada por sprint:** 20-30 puntos (2 semanas)
**Duración estimada:** 10-15 sprints (~5-7 meses)
