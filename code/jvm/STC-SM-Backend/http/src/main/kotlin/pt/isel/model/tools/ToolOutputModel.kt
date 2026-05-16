package pt.isel.model.tools

import com.fasterxml.jackson.annotation.JsonProperty
import pt.isel.tools.Tool
import pt.isel.tools.ToolStatus

data class ToolOutputModel(
    val id: Int,
    val name: String,
    val partNumber: String,
    val cabinetId: Int,
    val status: String,
    @get:JsonProperty("isActive")
    val isActive: Boolean,
) {
    companion object {
        fun fromDomain(tool: Tool): ToolOutputModel =
            ToolOutputModel(
                id = tool.id,
                name = tool.name,
                partNumber = "",
                cabinetId = tool.cabinet.id,
                status = mapStatus(tool.status),
                isActive = true,
            )

        private fun mapStatus(status: ToolStatus): String = when (status) {
            ToolStatus.ACTIVE -> "AVAILABLE"
            ToolStatus.BROKEN -> "MISSING"
            ToolStatus.REPAIRING -> "MAINTENANCE"
        }
    }
}
