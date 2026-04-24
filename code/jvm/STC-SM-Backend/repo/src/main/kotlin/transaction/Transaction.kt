package transaction

import UserRepository
import TokenRepository
import ActivityRepository
import CabinetRepository
import ProfileRepository
import ShiftRepository
import ToolRepository

interface Transaction {
    val userRepository: UserRepository
    val tokenRepository: TokenRepository
    val activityRepository: ActivityRepository
    val cabinetRepository: CabinetRepository
    val profileRepository: ProfileRepository
    val shiftRepository: ShiftRepository
    val toolRepository: ToolRepository
    
    fun rollback()
}