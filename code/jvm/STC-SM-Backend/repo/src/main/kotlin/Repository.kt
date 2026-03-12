interface Repository<T> {
    fun findById(id: Int): T?

    fun findAll(): List<T>

    fun save(entity: T): Unit

    fun delete(id: Int): Unit

    fun clear()
}