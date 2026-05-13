package user

import auth.Token
import auth.TokenValidationInfo
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import user.User

@Repository
interface TokenRepository : JpaRepository<Token, Int> {
    fun findByTokenValidationInfo(validationInfo: TokenValidationInfo): Token?

    fun deleteByUser(user: User): Int
}