package transaction

import RepositoryLocker
import RepositoryTool
import RepositoryUser

interface Transaction {
    val repoUsers: RepositoryUser
    val repoTools: RepositoryTool
    val repoLockers: RepositoryLocker

    fun rollback()
}