plugins {
    // Spring and JPA stuff
    alias(libs.plugins.spring.boot)
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
}


