package pt.isel.auth

interface TokenEncoder {
    fun createValidationInformation(token: String): pt.isel.auth.TokenValidationInfo
}
