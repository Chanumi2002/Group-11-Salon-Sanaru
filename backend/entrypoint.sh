#!/bin/sh
# Build JDBC URL from Railway environment variables

echo "===== Railway Backend Startup ====="
echo "Checking environment variables..."

# Use Railway native variable names, fall back to mapped names
# Railway provides: RAILWAY_PRIVATE_DOMAIN, MYSQL_ROOT_PASSWORD, MYSQL_DATABASE
# Mapped names (if service linked): MYSQLHOST, MYSQLPASSWORD, MYSQLDATABASE
# IMPORTANT: Prioritize MYSQLHOST (mysql.railway.internal) over RAILWAY_PRIVATE_DOMAIN (backend's domain)

DB_HOST="${MYSQLHOST:-$RAILWAY_PRIVATE_DOMAIN}"
DB_PORT="${MYSQLPORT:-3306}"
DB_DATABASE="${MYSQL_DATABASE:-$MYSQLDATABASE}"
DB_USER="${MYSQLUSER}"
DB_PASSWORD="${MYSQLPASSWORD:-$MYSQL_ROOT_PASSWORD}"

# Diagnostic output
echo "Environment variables detected:"
echo "  RAILWAY_PRIVATE_DOMAIN: ${RAILWAY_PRIVATE_DOMAIN:-NOT SET}"
echo "  MYSQLHOST: ${MYSQLHOST:-NOT SET}"
echo "  MYSQL_DATABASE: ${MYSQL_DATABASE:-NOT SET}"
echo "  MYSQLDATABASE: ${MYSQLDATABASE:-NOT SET}"
echo "  MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-(hidden)}"
echo "  MYSQLPASSWORD: ${MYSQLPASSWORD:-(hidden)}"
echo "  MYSQLUSER: ${MYSQLUSER:-NOT SET}"
echo ""

# Check if all required variables are available
if [ -z "$DB_HOST" ] || [ -z "$DB_DATABASE" ] || [ -z "$DB_USER" ]; then
  echo "❌ ERROR: Required database variables not found"
  echo "  DB_HOST (RAILWAY_PRIVATE_DOMAIN or MYSQLHOST): ${DB_HOST:-NOT SET}"
  echo "  DB_DATABASE (MYSQL_DATABASE or MYSQLDATABASE): ${DB_DATABASE:-NOT SET}"
  echo "  DB_USER (MYSQLUSER): ${DB_USER:-NOT SET}"
  echo ""
  echo "  Make sure MySQL service is linked to backend in Railway dashboard"
  echo "  Expected variables: MYSQLHOST, MYSQL_DATABASE, MYSQL_ROOT_PASSWORD, MYSQLUSER"
else
  export SPRING_DATASOURCE_URL="jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_DATABASE}?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&connectTimeout=10000"
  export SPRING_DATASOURCE_USERNAME="${DB_USER}"
  export SPRING_DATASOURCE_PASSWORD="$DB_PASSWORD"
  
  echo "✅ MySQL connection configured"
  echo "  Host: $DB_HOST"
  echo "  Port: $DB_PORT"
  echo "  Database: $DB_DATABASE"
  echo "  User: $DB_USER"
fi

echo ""
echo "Starting Spring Boot application..."
echo "===== Spring Boot Logs ====="
echo ""

exec java \
  -Dspring.profiles.active=railway \
  -Dspring.jpa.hibernate.ddl-auto=validate \
  -jar app.jar
