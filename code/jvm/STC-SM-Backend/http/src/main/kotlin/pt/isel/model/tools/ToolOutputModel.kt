package pt.isel.model.tools

import com.fasterxml.jackson.annotation.JsonProperty
import pt.isel.tools.Tool
import pt.isel.tools.ToolStatus

data class ToolOutputModel(
    val name: String,
    val partNumber: String,
    val status: String,
    @get:JsonProperty("isActive")
    val isActive: Boolean,
    val self: String,
    val cabinet: String,
) {
    companion object {
        fun fromDomain(tool: Tool): ToolOutputModel =
            ToolOutputModel(
                name = tool.name,
                partNumber = "",
                status = mapStatus(tool.status),
                isActive = true,
                self = "/api/tools/${tool.id}",
                cabinet = "/api/cabinets/${tool.cabinet.id}",
            )

        private fun mapStatus(status: ToolStatus): String = when (status) {
            ToolStatus.AVAILABLE -> "AVAILABLE"
            ToolStatus.BROKEN -> "BROKEN"
            ToolStatus.IN_USE -> "IN_USE"
            ToolStatus.MISSING -> "MISSING"
            ToolStatus.IN_MAINTENANCE -> "IN_MAINTENANCE"
        }
    }
}
