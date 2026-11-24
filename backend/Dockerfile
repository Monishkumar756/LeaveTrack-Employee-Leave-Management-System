# ---- Stage 1: Build the JAR ----
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom first (layer cache for dependencies)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# ---- Stage 2: Run the JAR ----
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built JAR from stage 1
COPY --from=build /app/target/*.jar app.jar

# Expose port (Render sets $PORT dynamically, defaults to 8080)
EXPOSE 8080

# Run with memory constraints optimized for Render Free Tier (512MB RAM)
ENTRYPOINT ["java", "-XX:+UseSerialGC", "-Xss512k", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
