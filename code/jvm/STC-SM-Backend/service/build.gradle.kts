plugins {
    // Spring and JPA stuff
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.kotlin.spring)
    alias(libs.plugins.spring.dependency.management)
}

group = "org.example"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    // To use classes from domain
    implementation(project(":domain"))

    // Inject dependency on repo
    implementation(project(":repo"))

    implementation(libs.spring.jpa)
}
