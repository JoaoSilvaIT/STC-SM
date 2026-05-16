package pt.isel.auth

interface TokenEncoder {
    fun createValidationInformation(token: String): TokenValidationInfo
}
