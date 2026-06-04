package pt.isel.model.auth

import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseCookie
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.CookieValue
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import pt.isel.AuthService
import pt.isel.AuthenticationInterceptor
import pt.isel.model.user.toProblemResponse
import pt.isel.user.User
import pt.isel.utils.Either
import jakarta.servlet.http.HttpServletRequest
import java.time.Duration

private const val REFRESH_TOKEN_COOKIE = "refreshToken"

@RestController
class UserSessionController (
    private val authService: AuthService
) {
    @PostMapping("/api/users/login")
    fun login(@RequestBody loginInput: LoginInput): ResponseEntity<*> {
        return when(val result = authService.login(loginInput.username, loginInput.password)) {
            is Either.Success -> {
                val accessToken = result.value.accessToken
                val refreshToken = result.value.refreshToken
                val cookie = ResponseCookie
                    .from(REFRESH_TOKEN_COOKIE, refreshToken)
                    .httpOnly(true)
                    .path("/api/users/refresh")
                    .maxAge(Duration.ofDays(30))
                    .sameSite("Lax")  // More flexible because it's two different ports backend and frontend
                    .build()

                ResponseEntity
                    .status(HttpStatus.OK)
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(LoginOutput(accessToken))
            }
            is Either.Failure -> result.value.toProblemResponse()
        }
    }

    @PostMapping("/api/users/refresh")
    fun refresh(
        @CookieValue(name = REFRESH_TOKEN_COOKIE, required = false) refreshTokenCookie: String?
    ): ResponseEntity<*> {
        if (refreshTokenCookie == null) {
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(mapOf("error" to "Sessão expirada. Faça login."))
        }

        return when(val result = authService.refreshToken(refreshTokenCookie)) {
            is Either.Success -> {
                val newAccessToken = result.value
                ResponseEntity
                    .status(HttpStatus.OK)
                    .body(LoginOutput(newAccessToken))
                }
            is Either.Failure -> result.value.toProblemResponse()
        }
    }

    @PostMapping("/api/users/logout")
    fun logout(
        request: HttpServletRequest,
        @Suppress("UNUSED_PARAMETER") user: User,
    ): ResponseEntity<*> {
        val authHeader = request.getHeader(AuthenticationInterceptor.NAME_AUTHORIZATION_HEADER)
        val token = authHeader?.takeIf { it.startsWith("Bearer ") }?.substring(7)
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build<Unit>()
        authService.revokeToken(token)
        val clearCookie = ResponseCookie
            .from(REFRESH_TOKEN_COOKIE, "")
            .httpOnly(true)
            .path("/api/users/refresh")
            .maxAge(0)
            .sameSite("Strict")
            .build()
        return ResponseEntity
            .status(HttpStatus.NO_CONTENT)
            .header(HttpHeaders.SET_COOKIE, clearCookie.toString())
            .build<Unit>()
    }
}
