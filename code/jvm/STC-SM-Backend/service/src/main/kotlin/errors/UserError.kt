package errors

import user.User

sealed class UserError {
    data object BlankEmail : UserError()

    data object BlankPassword : UserError()

    data object UserNotFoundOrInvalidCredentials : UserError()

    data object BlankName : UserError()

    data object EmailAlreadyInUse : UserError()
}