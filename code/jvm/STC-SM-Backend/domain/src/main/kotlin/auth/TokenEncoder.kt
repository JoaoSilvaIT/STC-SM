package auth

interface TokenEncoder {
    fun createValidationInformation(token: String): TokenValidationInfo
}
