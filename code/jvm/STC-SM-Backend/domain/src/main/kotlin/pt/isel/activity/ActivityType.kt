package pt.isel.activity

enum class ActivityType {
    OPEN_CABINET,
    CLOSE_CABINET,
    REMOVE_TOOL,
    RETURN_TOOL,
    TOOL_BROKEN, // This type appends whenever a mechanic clicks on the button broken tool
    TOOL_MISSING,
    TOOL_IN_MAINTENANCE,
    CABINET_ANOMALY,
    CABINET_BROKEN,
    STARTED_SHIFT,
    ENDED_SHIFT,
}
