## Git Workflow

- **Main branch:** `main` (production)
- **Development branch:** `develop`
- **Feature branches:** `feature/HU-XXX-description`
- **Commit format:** `type(scope): description [HU-XXX] #issue`

### Git Configuration
```bash
git config user.email "otro34@hotmail.com"
git config user.name "Juan Carlos Romaina"
```

## Proceso Estándar para Historias de Usuario

### Flujo completo para cada HU completada:

1. **Crear branch específico**
   ```bash
   git checkout -b feature/HU-XXX-description
   ```

2. **Implementar la funcionalidad**
   - Seguir las convenciones del proyecto
   - Mantener cobertura de tests
   - Validar que compile sin errores

3. **Commit con mensaje detallado**
   ```bash
   git add .
   git commit -m "$(cat <<'EOF'
   type(scope): descripción detallada [HU-XXX]

   - Lista de cambios implementados
   - Funcionalidades agregadas
   - Tests añadidos
   - Actualización de documentación

   🤖 Generated with [Claude Code](https://claude.ai/code)

   Co-Authored-By: Claude <noreply@anthropic.com>
   EOF
   )"
   ```

4. **Push y crear Pull Request**
   ```bash
   git push -u origin feature/HU-XXX-description
   ```

5. **Crear PR con MCP GitHub**
   - Usar `mcp__github__create_pull_request` con:
     - Título descriptivo con [HU-XXX]
     - Body detallado con resumen, funcionalidades y plan de pruebas
     - Base: `main`
     - Head: `feature/HU-XXX-description`

6. **Asignar revisores**
   - Asignar a `otro34` como revisor principal
   - Solicitar revisión de Copilot: `mcp__github__request_copilot_review`

7. **Actualizar seguimiento**
   - Actualizar `docs/seguimiento-historias.md`
   - Cambiar estado de 🔵 Pendiente → 🟢 Completada
   - Actualizar métricas de progreso
   - Agregar entrada en historial de cambios

### Template de PR Body:
```markdown
## 📋 Resumen
[Descripción de la historia de usuario implementada]

### ✨ Funcionalidades implementadas
- [Lista de características]

### 🧪 Testing y calidad
- [Tests añadidos]
- [Validaciones realizadas]

### 📊 Progreso del proyecto
- [Estado del sprint]
- [Progreso global]

## 🔧 Plan de pruebas
- [ ] [Lista de verificaciones]

🤖 Generated with [Claude Code](https://claude.ai/code)
```

## Testing Requirements

- Unit tests for critical functions: 90% coverage
- Component tests: 70% coverage
- Service tests: 80% coverage
- Overall minimum: 70% coverage

