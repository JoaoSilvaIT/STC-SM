package pt.isel.errors

sealed class ProfileError {
    data object ProfileNotFound : ProfileError()
}
