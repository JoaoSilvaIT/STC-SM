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

    // Password Encoder
    implementation(libs.spring.security)

    implementation(libs.spring.jpa)

    testImplementation(libs.kotlin.unit.test)
    testImplementation(libs.mockk)
    testRuntimeOnly(libs.kotlin.junit.test)
}

tasks.bootJar { enabled = false }
tasks.jar { enabled = true }

tasks.withType<Test> {
    useJUnitPlatform()
}
