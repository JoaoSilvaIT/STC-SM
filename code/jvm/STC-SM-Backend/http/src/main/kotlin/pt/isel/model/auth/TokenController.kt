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
import pt.isel.model.user.toProblemResponse
import pt.isel.utils.Either
import java.time.Duration

@RestController
class TokenController (
    private val authService: AuthService
) {
    @PostMapping("/api/users/login")
    fun login(@RequestBody loginInput: LoginInput): ResponseEntity<*> {
        return when(val result = authService.login(loginInput.username, loginInput.password)) {
            is Either.Success -> {
                val accessToken = result.value.accessToken
                val refreshToken = result.value.refreshToken
                // Web
                val cookie = ResponseCookie
                    .from("token", refreshToken)
                    .httpOnly(true) // to block js code to gain access to it
                    .path("/api/users/refresh") // only this rote will be able to get access to this token
                    .maxAge(Duration.ofDays(30)) // the token will be available for 30 days
                    .sameSite("Strict") // blocks the attacks made from a different origin than the website itself
                    .build()

                ResponseEntity
                    .status(HttpStatus.OK)
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    // Mobile
                    .body(LoginOutput(accessToken))
            }
            is Either.Failure -> result.value.toProblemResponse()
        }
    }

    @PostMapping("/api/users/refresh")
    fun refresh(
        @CookieValue(name = "refreshToken", required = false) refreshTokenCookie: String?
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
}