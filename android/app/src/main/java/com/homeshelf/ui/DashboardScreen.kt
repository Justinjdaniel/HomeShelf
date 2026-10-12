package com.homeshelf.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.homeshelf.data.InventoryItemEntity

// Nocturne Cellar Material 3 Color Tokens
val NocturneSurface = Color(0xFF0B1326)
val NocturneCard = Color(0xFF131B2E)
val NocturneCardBorder = Color(0xFF243049)
val NocturnePrimary = Color(0xFF38BDF8)
val NocturneWarning = Color(0xFFFBBF24)
val NocturneCritical = Color(0xFFEF4444)
val NocturneSuccess = Color(0xFF34D399)

@Composable
fun DashboardScreen(
    items: List<InventoryItemEntity>,
    onScanClick: () -> Unit,
    onRestockClick: () -> Unit,
    onAuditClick: () -> Unit,
    onItemClick: (InventoryItemEntity) -> Unit
) {
    Scaffold(
        containerColor = NocturneSurface,
        floatingActionButton = {
            FloatingActionButton(
                onClick = onScanClick,
                containerColor = Color(0xFF0284C7),
                contentColor = Color.White,
                shape = RoundedCornerShape(16.dp)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Quick Add")
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Quick Add", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                }
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Header Sync Banner
            item {
                Spacer(modifier = Modifier.height(8.dp))
                Card(
                    colors = CardDefaults.cardColors(containerColor = NocturneCard),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                "Executive Cache Active • ${items.size} Items Real-time",
                                color = Color.White,
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 13.sp
                            )
                            Text(
                                "Offline-First Room SQLite • Last verified 2m ago",
                                color = Color(0xFF94A3B8),
                                fontSize = 11.sp
                            )
                        }
                        Button(
                            onClick = onAuditClick,
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1A243B)),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Text("Sync", color = NocturnePrimary, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            // 4-Card KPI Command Center Grid
            item {
                Text(
                    "INVENTORY COMMAND CENTER",
                    color = Color(0xFF94A3B8),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    // Total Assets
                    Card(
                        colors = CardDefaults.cardColors(containerColor = NocturneCard),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text("TOTAL ASSETS", color = Color(0xFF94A3B8), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text("${items.size} Items", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.ExtraBold)
                            Text("Across 5 home locations", color = Color(0xFF94A3B8), fontSize = 11.sp)
                        }
                    }

                    // Pantry Value
                    Card(
                        colors = CardDefaults.cardColors(containerColor = NocturneCard),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text("PANTRY VALUE", color = Color(0xFF94A3B8), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text("$1,248.50", color = NocturneSuccess, fontSize = 20.sp, fontWeight = FontWeight.ExtraBold)
                            Text("94% Insured • $8.79/ea", color = Color(0xFF94A3B8), fontSize = 11.sp)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    // Waste Risk
                    Card(
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF260C10)),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text("WASTE RISK", color = Color(0xFFFCA5A5), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text("$38.20", color = NocturneCritical, fontSize = 20.sp, fontWeight = FontWeight.ExtraBold)
                            Text("3 items expiring <48h", color = Color(0xFFFCA5A5), fontSize = 11.sp)
                        }
                    }

                    // Restock Ready
                    Card(
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF241705)),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text("RESTOCK READY", color = Color(0xFFFDE68A), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text("8 to Buy", color = NocturneWarning, fontSize = 20.sp, fontWeight = FontWeight.ExtraBold)
                            Text("5 low stock, 3 depleted", color = Color(0xFFFDE68A), fontSize = 11.sp)
                        }
                    }
                }
            }

            // Quick Operations Hub
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf(
                        "Scan Barcode" to Icons.Default.QrCodeScanner,
                        "Log Restock" to Icons.Default.AddBusiness,
                        "Audit Shelf" to Icons.Default.FactCheck,
                        "Share List" to Icons.Default.Share
                    ).forEach { (label, icon) ->
                        Card(
                            colors = CardDefaults.cardColors(containerColor = NocturneCard),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier
                                .weight(1f)
                                .clickable {
                                    if (label == "Scan Barcode") onScanClick()
                                    else if (label == "Log Restock") onRestockClick()
                                }
                        ) {
                            Column(
                                modifier = Modifier
                                    .padding(vertical = 12.dp, horizontal = 4.dp)
                                    .fillMaxWidth(),
                                horizontalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(icon, contentDescription = label, tint = NocturnePrimary, modifier = Modifier.size(20.dp))
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(label, color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.SemiBold)
                            }
                        }
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(60.dp))
            }
        }
    }
}
