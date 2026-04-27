package user

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.persistence.autoconfigure.EntityScan

@SpringBootApplication
@EntityScan(basePackages = ["user", "auth", ""])
class TestApp