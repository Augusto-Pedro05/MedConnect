# =============================================================
# MedConnect Backend — Multi-Stage Dockerfile
# =============================================================

# ---------- Stage 1: Build ----------
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests -B

# ---------- Stage 2: Run ----------
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# 1. Remediação IaC (CKV_DOCKER_3): Criar grupo e utilizador de sistema restrito
RUN addgroup -S medgroup && adduser -S meduser -G medgroup

COPY --from=build /app/target/*.jar app.jar

# 2. Conceder a posse estrita do binário ao utilizador isolado
RUN chown meduser:medgroup app.jar

# 3. Rebaixar os privilégios de execução antes do ponto de entrada
USER meduser

EXPOSE 8080

# 4. Remediação IaC (CKV_DOCKER_2): Sonda de Liveness TCP local via Netcat
HEALTHCHECK --interval=30s --timeout=3s \
  CMD nc -z localhost 8080 || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]