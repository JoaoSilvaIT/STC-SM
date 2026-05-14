package pt.isel.utils

sealed class Either<out F, out S> {
    data class Failure<out F>(
        val value: F,
    ) : Either<F, Nothing>()

    data class Success<out S>(
        val value: S,
    ) : Either<Nothing, S>()
}

fun <S> success(value: S) = _root_ide_package_.pt.isel.utils.Either.Success(value)

fun <F> failure(error: F) = _root_ide_package_.pt.isel.utils.Either.Failure(error)
