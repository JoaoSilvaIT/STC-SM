package errors

sealed class ProfileError {
    data object ProfileNotFound : ProfileError()
}
