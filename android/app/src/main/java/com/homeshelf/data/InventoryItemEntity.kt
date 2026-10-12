package com.homeshelf.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "inventory_items")
data class InventoryItemEntity(
    @PrimaryKey val id: String,
    val name: String,
    val description: String,
    val categoryId: String,
    val locationId: String,
    val shelfId: String,
    val shelfLocation: String,
    val quantity: Int,
    val targetQuantity: Int,
    val unitId: String,
    val price: Double,
    val expirationDate: String,
    val priorityId: String,
    val status: String,
    val barcode: String,
    val imageUrl: String? = null,
    val inShoppingList: Boolean = false,
    val shoppingQuantity: Int = 0,
    val lastAudited: String
)

@Entity(tableName = "master_categories")
data class MasterCategoryEntity(
    @PrimaryKey val id: String,
    val name: String,
    val icon: String,
    val colorHex: String,
    val isCustom: Boolean = false
)

@Entity(tableName = "master_locations")
data class MasterLocationEntity(
    @PrimaryKey val id: String,
    val name: String,
    val icon: String,
    val itemCount: Int = 0,
    val isCustom: Boolean = false
)

@Entity(tableName = "master_shelves")
data class MasterShelfEntity(
    @PrimaryKey val id: String,
    val locationId: String,
    val name: String,
    val capacityPercent: Int,
    val healthStatus: String,
    val totalItems: Int,
    val isCustom: Boolean = false
)

@Entity(tableName = "master_units")
data class MasterUnitEntity(
    @PrimaryKey val id: String,
    val label: String,
    val abbreviation: String,
    val isCustom: Boolean = false
)

@Entity(tableName = "master_priorities")
data class MasterPriorityEntity(
    @PrimaryKey val id: String,
    val label: String,
    val level: Int,
    val badgeColorHex: String,
    val isCustom: Boolean = false
)

@Entity(tableName = "transaction_audit_log")
data class TransactionAuditEntity(
    @PrimaryKey val id: String,
    val timestamp: String,
    val action: String,
    val itemName: String,
    val itemId: String? = null,
    val quantityChange: Int = 0,
    val note: String
)
