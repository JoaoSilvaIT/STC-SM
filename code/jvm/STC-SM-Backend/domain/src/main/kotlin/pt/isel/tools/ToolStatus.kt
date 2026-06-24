package pt.isel.tools

/**
 * AVAILABLE      - Tool is inside the cabinet and ready for use.
 * IN_USE         - Tool is currently checked out and outside the cabinet.
 * IN_MAINTENANCE - Tool is undergoing calibration or maintenance and is temporarily unavailable.
 * BROKEN         - Tool is permanently damaged. Record is kept in the database to preserve historical data.
 * MISSING        - Tool is lost or unaccounted for.
 */
enum class ToolStatus {
    AVAILABLE,
    IN_USE,
    IN_MAINTENANCE,
    BROKEN,
    MISSING,
}
