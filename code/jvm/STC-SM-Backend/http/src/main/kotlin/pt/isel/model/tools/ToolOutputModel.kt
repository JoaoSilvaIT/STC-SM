package pt.isel.model.tools

import com.fasterxml.jackson.annotation.JsonProperty
import pt.isel.tools.Tool

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
                status = tool.status.name,
                isActive = true,
                self = "/api/tools/${tool.id}",
                cabinet = "/api/cabinets/${tool.cabinet.id}",
            )
    }
}
