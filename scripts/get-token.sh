#!/bin/bash

# Script para obtener un token JWT de prueba
# Uso: ./scripts/get-token.sh

BASE_URL="http://localhost:3001/api/v1"

echo "🔐 Obteniendo token JWT..."
echo ""

# Registrar usuario admin (si no existe, fallará silenciosamente)
echo "1. Registrando usuario admin..."
curl -s -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "email": "admin@ovc-app.com",
    "name": "Administrator",
    "role": "admin"
  }' > /dev/null 2>&1

echo "   ✓ Usuario registrado (o ya existe)"
echo ""

# Login para obtener token
echo "2. Haciendo login..."
RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }')

# Extraer token de la respuesta
TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
  echo "   ❌ Error al obtener token"
  echo ""
  echo "Respuesta del servidor:"
  echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
  exit 1
fi

echo "   ✓ Login exitoso"
echo ""

# Mostrar token
echo "3. Token JWT obtenido:"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$TOKEN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Copiar al clipboard (si pbcopy está disponible en macOS)
if command -v pbcopy &> /dev/null; then
  echo "$TOKEN" | pbcopy
  echo "✓ Token copiado al clipboard"
  echo ""
fi

# Guardar en archivo temporal
echo "$TOKEN" > /tmp/ovc-token.txt
echo "✓ Token guardado en: /tmp/ovc-token.txt"
echo ""

# Mostrar cómo usarlo
echo "📝 Cómo usar el token:"
echo ""
echo "   En tests/auth.http, actualiza:"
echo "   @token = $TOKEN"
echo ""
echo "   O usa en curl:"
echo "   curl -H \"Authorization: Bearer $TOKEN\" ${BASE_URL}/auth/me"
echo ""

# Verificar el token
echo "4. Verificando token..."
VERIFY=$(curl -s -X GET "${BASE_URL}/auth/me" \
  -H "Authorization: Bearer $TOKEN")

echo "$VERIFY" | jq '.' 2>/dev/null || echo "$VERIFY"
echo ""

if echo "$VERIFY" | grep -q '"success":true'; then
  echo "✅ Token válido y funcionando correctamente"
else
  echo "❌ Token inválido o error de verificación"
fi
