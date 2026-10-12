package com.homeshelf.data

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface InventoryItemDao {
    @Query("SELECT * FROM inventory_items ORDER BY name ASC")
    fun getAllItems(): Flow<List<InventoryItemEntity>>

    @Query("SELECT * FROM inventory_items WHERE id = :id LIMIT 1")
    suspend fun getItemById(id: String): InventoryItemEntity?

    @Query("SELECT * FROM inventory_items WHERE barcode = :barcode LIMIT 1")
    suspend fun getItemByBarcode(barcode: String): InventoryItemEntity?

    @Query("SELECT * FROM inventory_items WHERE inShoppingList = 1")
    fun getShoppingListItems(): Flow<List<InventoryItemEntity>>

    @Query("SELECT * FROM inventory_items WHERE status IN ('expired', 'expiring_soon')")
    fun getUrgentPerishables(): Flow<List<InventoryItemEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertItem(item: InventoryItemEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(items: List<InventoryItemEntity>)

    @Update
    suspend fun updateItem(item: InventoryItemEntity)

    @Delete
    suspend fun deleteItem(item: InventoryItemEntity)

    @Query("DELETE FROM inventory_items")
    suspend fun clearAll()
}

@Dao
interface MasterDataDao {
    @Query("SELECT * FROM master_categories")
    fun getCategories(): Flow<List<MasterCategoryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCategory(cat: MasterCategoryEntity)

    @Query("SELECT * FROM master_locations")
    fun getLocations(): Flow<List<MasterLocationEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLocation(loc: MasterLocationEntity)

    @Query("SELECT * FROM master_shelves WHERE locationId = :locationId")
    fun getShelvesForLocation(locationId: String): Flow<List<MasterShelfEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertShelf(shelf: MasterShelfEntity)

    @Query("SELECT * FROM master_units")
    fun getUnits(): Flow<List<MasterUnitEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUnit(unit: MasterUnitEntity)

    @Query("SELECT * FROM master_priorities ORDER BY level ASC")
    fun getPriorities(): Flow<List<MasterPriorityEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPriority(prio: MasterPriorityEntity)
}

@Dao
interface AuditLogDao {
    @Query("SELECT * FROM transaction_audit_log ORDER BY timestamp DESC")
    fun getAuditEntries(): Flow<List<TransactionAuditEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun logAction(entry: TransactionAuditEntity)
}
