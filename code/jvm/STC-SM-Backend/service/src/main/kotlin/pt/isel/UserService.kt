package pt.isel

import pt.isel.errors.UserError
import org.springframework.data.repository.findByIdOrNull
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import pt.isel.auth.PasswordValidationInfo
import pt.isel.profile.Role
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
        profile: Int,
        admin: User
    ): Either<UserError, User> {
        if (name.isBlank()) return failure(UserError.BlankName)
        if (email.isBlank()) return failure(UserError.BlankEmail)
        if (password.isBlank()) return failure(UserError.BlankPassword)

        if(admin.profile.role != Role.ADMIN) return failure(UserError.NotAuthorized)

        val emailTrimmed = email.trim()

        if(userRepo.findByEmail(emailTrimmed) != null) {
            return failure(UserError.EmailAlreadyInUse)
        }

        val profile = profileRepo.getReferenceById(profile)
        val newPassword = createPasswordValidationInformation(password)

        val newUser = User(
            name = name,
            email = emailTrimmed,
            profile = profile,
            status = UserStatus.ACTIVE,
            passwordValidation = newPassword,
        )

        return success(userRepo.save(newUser))
    }

    @Transactional
    fun updateUser(
        state: String,
        uid: Int
    ): Either<UserError, User> {
        if (state.isBlank()) return failure(UserError.BlankState)

        val user = userRepo.findByIdOrNull(uid) ?: return failure(UserError.UserNotFound)
        val status = state.toUserStatus() ?: return failure(UserError.InvalidState)

        val newUser = user.copy(status = status)

        return success(userRepo.save(newUser))
    }

    fun getAllUsers(admin: User): Either<UserError, List<User>> {
        if (admin.profile.role != Role.ADMIN) return failure(UserError.NotAuthorized)
        return success(userRepo.findAll())
    }

    // The !! is used because @Nullable is on the encode function even though never returns null unless the parameter passed is null
    private fun createPasswordValidationInformation(password: String) =
        PasswordValidationInfo(hash = passwordEncoder.encode(password)!!)
}
