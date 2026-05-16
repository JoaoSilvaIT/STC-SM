package pt.isel

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.stereotype.Component
import org.springframework.web.method.HandlerMethod
import org.springframework.web.servlet.HandlerInterceptor


@Component
class AuthenticationInterceptor(
    private val authService: AuthService,
) : HandlerInterceptor {

    override fun preHandle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any,
    ): Boolean {
        if (handler !is HandlerMethod) return true

        val path = request.requestURI
        if (!path.startsWith("/api/")) return true
        if (path in PUBLIC_PATHS) return true

        val authHeader = request.getHeader(NAME_AUTHORIZATION_HEADER)
        val token = if (authHeader != null && authHeader.startsWith("Bearer ")) {
            authHeader.substring(7)
        } else null

        val user = token?.let { authService.getUserByToken(it) }

        return if (user == null) {
            response.status = 401
            response.addHeader(NAME_WWW_AUTHENTICATE_HEADER, "Bearer")
            false
        } else {
            AuthenticatedUserArgumentResolver.addUserTo(user, request)
            true
        }
    }

    companion object {
        const val NAME_AUTHORIZATION_HEADER = "Authorization"
        private const val NAME_WWW_AUTHENTICATE_HEADER = "WWW-Authenticate"

        private val PUBLIC_PATHS = setOf(
            "/api/users/login",
            "/api/users/refresh",
        )
    }
}
