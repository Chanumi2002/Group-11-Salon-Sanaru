FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY target/backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 5000

ENTRYPOINT ["java", "-jar", "app.jar"]
