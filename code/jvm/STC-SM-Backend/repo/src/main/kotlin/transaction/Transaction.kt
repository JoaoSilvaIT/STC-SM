package transaction

import RepositoryUser

interface Transaction {
    val repoUsers: RepositoryUser
    fun rollback()
}