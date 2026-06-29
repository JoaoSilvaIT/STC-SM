package pt.isel.model

import org.springframework.data.domain.Page

data class PageOutputModel<T>(
    val items: List<T>,
    val currentPage: Int,
    val totalPages: Int,
    val totalItems: Long
){
    companion object{
        fun <T : Any> fromDomain(page: Page<T>): PageOutputModel<T> =
            PageOutputModel(
                items = page.content,
                currentPage = page.number,
                totalPages = page.totalPages,
                totalItems = page.totalElements
            )
    }
}



