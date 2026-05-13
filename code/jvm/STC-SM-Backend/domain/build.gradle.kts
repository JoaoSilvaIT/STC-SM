// In use of JPA to connect the domain with postgres SQL
plugins {
    alias(libs.plugins.kotlin.jpa)
}

// To use annotations such as @Entity or @Id
dependencies {
    implementation(libs.jakarta.persistence)
}
