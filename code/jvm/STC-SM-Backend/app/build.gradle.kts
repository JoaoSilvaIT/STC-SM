plugins {
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.kotlin.spring)
    alias(libs.plugins.kotlin.jpa)
    alias(libs.plugins.spring.dependency.management)
}

dependencies {
    implementation(project(":http"))
    implementation(project(":repo"))
    implementation(project(":domain"))
    implementation(project(":service"))

    // Libraries needed for a Repository Class
    implementation(libs.spring.jpa)
    implementation(libs.kotlin.reflect)
    implementation(libs.jakarta.persistence)

    implementation(libs.spring.webmvc)
}
