package user

interface TokenEncoder {
    fun createValidationInformation(token: String): TokenValidationInfo
}