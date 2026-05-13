package auth

import jakarta.persistence.Column
import jakarta.persistence.Embeddable

@Embeddable
class PasswordValidationInfo(
    @Column(nullable = false)
    val hash: String = "",
) {
}
