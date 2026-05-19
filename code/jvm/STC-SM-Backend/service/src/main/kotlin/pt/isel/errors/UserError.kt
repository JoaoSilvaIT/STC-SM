package pt.isel.errors

sealed class UserError {
    data object BlankEmail : UserError()

    data object BlankPassword : UserError()

    data object BlankState : UserError()

    data object UserNotFoundOrInvalidCredentials : UserError()

    data object UserNotFound : UserError()

    data object BlankName : UserError()

    data object EmailAlreadyInUse : UserError()

    data object InvalidProfileId : UserError()

    data object InvalidState : UserError()

    data object NotAuthorized : UserError()
}