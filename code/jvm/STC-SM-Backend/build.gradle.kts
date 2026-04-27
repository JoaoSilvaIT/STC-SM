// Declaration of all the versions of the plugins in the classpath for the submodules
plugins {
    alias(libs.plugins.kotlin.jvm) apply false
    alias(libs.plugins.kotlin.spring) apply false
    alias(libs.plugins.kotlin.jpa) apply false
    alias(libs.plugins.spring.boot) apply false
    alias(libs.plugins.spring.dependency.management) apply false
    alias(libs.plugins.ktlint) apply false
}

// Configurations for the overall project
allprojects {
    // Name of our project and the
    group = "com.smart.tool.cabinets"
    // State version of the actual project
    version = "1.0.0-SNAPSHOT"
    repositories {
        mavenCentral()
    }
}




