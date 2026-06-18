plugins {
    // Spring and JPA stuff
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.kotlin.spring)
    alias(libs.plugins.spring.dependency.management)
}

dependencies {
    // To use classes from domain
    implementation(project(":domain"))

    // Inject dependency on services
    implementation(project(":service"))

    implementation(libs.spring.webmvc)
    implementation(libs.spring.validation)
    implementation(libs.spring.websocket)

    // Password Encoder
    api(libs.spring.security)
}

tasks.bootJar { enabled = false }
tasks.jar { enabled = true }
