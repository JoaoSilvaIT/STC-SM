plugins {
    // Spring and JPA stuff
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.kotlin.spring)
    alias(libs.plugins.spring.dependency.management)
    alias(libs.plugins.kotlin.jpa)
}

dependencies {
    // To use classes from domain
    implementation(project(":domain"))

    // Libraries needed for a Repository Class
    implementation(libs.spring.jpa)
    implementation(libs.kotlin.reflect)
    implementation(libs.jakarta.persistence)

    // Driver for SQL in runtime
    runtimeOnly(libs.postgres.sql)

    // Libraries used in tests
    testImplementation(libs.spring.boot.test)
    testImplementation(libs.spring.jpa.test)
    testImplementation(libs.kotlin.unit.test)
    testRuntimeOnly(libs.kotlin.junit.test)
    // In-memory database so the JPA slice tests run without an external Postgres
    testRuntimeOnly(libs.h2)
}

tasks.bootJar { enabled = false }
tasks.jar { enabled = true }

tasks.withType<Test> {
    useJUnitPlatform()
}
