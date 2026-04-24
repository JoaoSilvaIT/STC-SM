package transaction

import UserRepository
import TokenRepository

interface Transaction {
    val userRepository: UserRepository
    val tokenRepository: TokenRepository
    fun rollback()
}