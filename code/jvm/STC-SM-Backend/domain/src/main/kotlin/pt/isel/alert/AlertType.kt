package pt.isel.alert

/**
 * LATE_START - the mechanic clocked in later than the allowed grace period.
 * EARLY_ENDING - the mechanic clocked off earlier than the allowed grace period.
 * OPEN_CABINET - a cabinet was left open beyond the allowed period.
 * MISSING_TOOL - a tool was reported missing.
 * BROKEN_CABINET - a cabinet was reported broken.
 *
 * The exact thresholds live in AlertService and TimerService.
 */
enum class AlertType {
    LATE_START,
    EARLY_ENDING,
    OPEN_CABINET,
    MISSING_TOOL,
    BROKEN_CABINET,
}
