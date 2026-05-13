package auth

import jakarta.persistence.Column
import jakarta.persistence.Embeddable

@Embeddable
class TokenValidationInfo(
    @Column(name = "token_hash", nullable = false)
    val validationInfo: String = "",
)
