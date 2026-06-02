package pt.isel.cabinet

/**
 * BROKEN   - Cabinet is permanently out of order. Record is kept in the database to prevent historical data loss.
 * INACTIVE - Cabinet is temporarily disabled for maintenance or updates.
 * OPEN     - Cabinet is operational and the door is currently open.
 * CLOSED   - Cabinet is operational and the door is currently closed.
 */
enum class CabinetStatus {
    BROKEN,
    INACTIVE,
    OPEN,
    CLOSED
}