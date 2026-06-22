package pt.isel.alert

/**
 * LATE_START - If the mechanic arrives 20 or more minutes late from the scheduled time for him
 * EARLY_ENDING - If the mechanic leaves 20 or more minutes early from the scheduled time for him
 * OPEN_CABINET - If the mechanic keeps the cabinet open for more than 20 minutes
 * MISSING_TOOL - If the mechanic looses a tool
 * BROKEN_CABINET - If the mechanic reports a cabinet is broken
 */
enum class AlertType {
    LATE_START,
    EARLY_ENDING,
    OPEN_CABINET,
    MISSING_TOOL,
    BROKEN_CABINET,

}