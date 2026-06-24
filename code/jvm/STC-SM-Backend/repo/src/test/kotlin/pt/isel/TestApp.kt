package pt.isel

import org.springframework.boot.autoconfigure.SpringBootApplication

/**
 * Configuration anchor for the JPA slice tests (@DataJpaTest looks up the @SpringBootConfiguration
 * from this package). Living in `pt.isel` means the default component, entity and repository scans
 * cover the repositories here and the entities in `pt.isel.*`.
 */
@SpringBootApplication
class TestApp
