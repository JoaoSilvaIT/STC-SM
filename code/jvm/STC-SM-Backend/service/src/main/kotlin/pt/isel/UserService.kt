package pt.isel

import pt.isel.errors.UserError
import pt.isel.user.UserRepository
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.data.repository.findByIdOrNull
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import pt.isel.auth.PasswordValidationInfo
import pt.isel.user.User
import pt.isel.user.UserStatus
import pt.isel.utils.Either
import pt.isel.utils.failure
import pt.isel.utils.success

@Service
class UserService(
    private val passwordEncoder: PasswordEncoder,
    private val userRepo: UserRepository,
    private val profileRepo: ProfileRepository
) {
    @Transactional
    fun createUser(
        name: String,
        email: String,
        password: String,
        profileId: Int
    ): Either<UserError, User> {
        if (name.isBlank()) return failure(UserError.BlankName)
        if (email.isBlank()) return failure(UserError.BlankEmail)
        if (password.isBlank()) return failure(UserError.BlankPassword)

        val emailTrimmed = email.trim()

        if (userRepo.findByEmail(emailTrimmed) != null) {
            return failure(UserError.EmailAlreadyInUse)
        }

        val profile = profileRepo.findByIdOrNull(profileId)
            ?: return failure(UserError.InvalidProfileId)
        val newPassword = createPasswordValidationInformation(password)

        val newUser = User(
            name = name,
            email = emailTrimmed,
            profile = profile,
            status = UserStatus.ACTIVE,
            passwordValidation = newPassword,
        )

        return try {
            success(userRepo.saveAndFlush(newUser))
        } catch (_: DataIntegrityViolationException) {
            failure(UserError.EmailAlreadyInUse)
        }
    }

    @Transactional
    fun deleteUser(id: Int): Either<UserError, Unit> {
        val user = userRepo.findByIdOrNull(id)
            ?: return failure(UserError.UserNotFound)
        userRepo.delete(user)
        return success(Unit)
    }

    // The !! is used because @Nullable is on the encode function even though never returns null unless the parameter passed is null
    private fun createPasswordValidationInformation(password: String) =
        PasswordValidationInfo(hash = passwordEncoder.encode(password)!!)
}