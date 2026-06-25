# syntax=docker/dockerfile:1

# ---- Build stage: compile the Spring Boot fat jar with the Gradle wrapper ----
FROM eclipse-temurin:21-jdk AS build
WORKDIR /src

# Copy the whole multi-module project. Build outputs and caches are excluded
# via .dockerignore so the build context stays small.
COPY . .

# The Gradle wrapper (9.6) downloads its own distribution; we only need a JDK 21
# here.
RUN chmod +x ./gradlew && \
    ./gradlew :app:bootJar --no-daemon && \
    cp "$(find app/build/libs -name '*.jar' ! -name '*-plain.jar' | head -n1)" /app.jar

# ---- Runtime stage: small JRE image that just runs the jar ----
FROM eclipse-temurin:21-jre AS runtime
WORKDIR /app

# Run as a non-root user.
RUN useradd --system --uid 1001 spring
USER spring

COPY --from=build /app.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
