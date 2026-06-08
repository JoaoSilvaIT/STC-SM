package pt.isel.model.activity

import pt.isel.activity.ActivityType

data class ActivityInputModel(
    val type: ActivityType,
    val uid: Int,
    val tid: Int? = null,
    val cid: Int? = null,
    val sid: Int? = null,
    val notes: String? = null
)
