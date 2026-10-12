/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  InventoryItem,
  MasterCategory,
  MasterLocation,
  MasterShelf,
  MasterUnit,
  MasterPriority,
  TransactionAuditEntry,
} from '../types/inventory';

const DB_NAME = 'HomeShelf_LocalVault';
const DB_VERSION = 1;

// Default Master Categories
export const DEFAULT_CATEGORIES: MasterCategory[] = [
  { id: 'cat_dairy', name: 'Dairy & Refrigerated', icon: 'local_drink', color: '#38bdf8' },
  { id: 'cat_pantry', name: 'Pantry & Grains', icon: 'grain', color: '#fbbf24' },
  { id: 'cat_produce', name: 'Fresh Produce', icon: 'eco', color: '#34d399' },
  { id: 'cat_household', name: 'Household & Cleaning', icon: 'cleaning_services', color: '#c084fc' },
  { id: 'cat_medical', name: 'Medicine & First Aid', icon: 'medication', color: '#f87171' },
  { id: 'cat_beverages', name: 'Beverages & Coffee', icon: 'coffee', color: '#f59e0b' },
  { id: 'cat_tools', name: 'Hardware & Batteries', icon: 'build', color: '#94a3b8' },
];

// Default Master Locations (Rooms / Zones)
export const DEFAULT_LOCATIONS: MasterLocation[] = [
  { id: 'loc_kitchen', name: 'Kitchen Pantry', icon: 'kitchen', itemCount: 42 },
  { id: 'loc_basement', name: 'Basement Shelves', icon: 'shelves', itemCount: 38 },
  { id: 'loc_bath', name: 'Master Bath', icon: 'bathtub', itemCount: 19 },
  { id: 'loc_garage', name: 'Garage Tool Rack', icon: 'garage', itemCount: 24 },
  { id: 'loc_med', name: 'Medicine Cabinet', icon: 'medical_services', itemCount: 19 },
];

// Default Master Shelves
export const DEFAULT_SHELVES: MasterShelf[] = [
  {
    id: 'shelf_pantry_2',
    locationId: 'loc_kitchen',
    name: 'Shelf 2 (Dry Goods)',
    capacityPercent: 82,
    healthStatus: 'optimal',
    totalItems: 18,
  },
  {
    id: 'shelf_fridge_1',
    locationId: 'loc_kitchen',
    name: 'Refrigerator Door Shelf 1',
    capacityPercent: 75,
    healthStatus: 'optimal',
    totalItems: 14,
  },
  {
    id: 'shelf_fridge_tier2',
    locationId: 'loc_kitchen',
    name: 'Fridge Tier 2',
    capacityPercent: 68,
    healthStatus: 'optimal',
    totalItems: 10,
  },
  {
    id: 'shelf_basement_a',
    locationId: 'loc_basement',
    name: 'Heavy Shelf A',
    capacityPercent: 65,
    healthStatus: 'safe_load',
    totalItems: 24,
  },
  {
    id: 'shelf_basement_drawer3',
    locationId: 'loc_basement',
    name: 'Utility Drawer 3',
    capacityPercent: 50,
    healthStatus: 'safe_load',
    totalItems: 14,
  },
  {
    id: 'shelf_med_top',
    locationId: 'loc_med',
    name: 'Top Shelf (First Aid)',
    capacityPercent: 91,
    healthStatus: 'near_limit',
    totalItems: 19,
  },
  {
    id: 'shelf_garage_1',
    locationId: 'loc_garage',
    name: 'Tool Rack Tier 1',
    capacityPercent: 60,
    healthStatus: 'safe_load',
    totalItems: 24,
  },
  {
    id: 'shelf_bath_cabinet',
    locationId: 'loc_bath',
    name: 'Vanity Organizer',
    capacityPercent: 55,
    healthStatus: 'optimal',
    totalItems: 19,
  },
];

// Default Master Units
export const DEFAULT_UNITS: MasterUnit[] = [
  { id: 'unit_gal', label: 'Gallon', abbreviation: 'gal' },
  { id: 'unit_tub', label: 'Tubs', abbreviation: 'tubs' },
  { id: 'unit_kg', label: 'Kilograms', abbreviation: 'kg' },
  { id: 'unit_g', label: 'Grams', abbreviation: 'g' },
  { id: 'unit_can', label: 'Cans', abbreviation: 'cans' },
  { id: 'unit_pk', label: 'Pack', abbreviation: 'pk' },
  { id: 'unit_cs', label: 'Case', abbreviation: 'cs' },
  { id: 'unit_un', label: 'Unit', abbreviation: 'un' },
  { id: 'unit_btl', label: 'Bottle', abbreviation: 'bottle' },
  { id: 'unit_pod', label: 'Pods', abbreviation: 'pods' },
];

// Default Master Priorities
export const DEFAULT_PRIORITIES: MasterPriority[] = [
  { id: 'prio_critical', label: 'Critical • Expired', level: 1, badgeColor: '#ef4444' },
  { id: 'prio_replenish', label: 'Pantry • Depletion Restock', level: 2, badgeColor: '#fbbf24' },
  { id: 'prio_household', label: 'Household & Essentials', level: 3, badgeColor: '#34d399' },
  { id: 'prio_normal', label: 'Standard Supply', level: 4, badgeColor: '#94a3b8' },
];

// Initial Core Items matching the Stitch designs exactly
export const INITIAL_FEATURED_ITEMS: InventoryItem[] = [
  {
    id: 'item_milk',
    name: 'Organic Whole Milk',
    description: '1 Gallon • Grade A Pasteurized',
    categoryId: 'cat_dairy',
    locationId: 'loc_kitchen',
    shelfId: 'shelf_fridge_1',
    shelfLocation: 'Kitchen Refrigerator Door Shelf 1',
    quantity: 0,
    targetQuantity: 1,
    unitId: 'unit_gal',
    price: 5.49,
    expirationDate: '2026-10-09', // Expired yesterday
    priorityId: 'prio_critical',
    status: 'expired',
    barcode: '011110416001',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCWTQujmg0kSNjLrtYfeR241vZ7IYOFqQHeGcucry4owbQeMgSKNdTc-LgFvI0BNH9ZgmPSWa9M8OeMUR2A0v9rgQpMGkl3pmuJHJ1I3_gfUaueMZ4b7ehsGv0H5p_px1viGnyrAWZrcaTMplDPqk7fcDaaOls4MdSLKOlF9YXFCK3YWhPXET-Xz_Y4l6VdsrC05_8cDIkhKC-pgPcaji5VSEFfFE0kik9eMBjoGNZYX2ZCHLwMVYj',
    inShoppingList: true,
    shoppingQuantity: 1,
    lastAudited: '2026-10-10T00:15:00Z',
  },
  {
    id: 'item_yogurt',
    name: 'Greek Yogurt (Plain)',
    description: '32 oz • Whole Milk Probiotic',
    categoryId: 'cat_dairy',
    locationId: 'loc_kitchen',
    shelfId: 'shelf_fridge_tier2',
    shelfLocation: 'Fridge Tier 2',
    quantity: 2,
    targetQuantity: 2,
    unitId: 'unit_tub',
    price: 8.20,
    expirationDate: '2026-10-10', // Expires tonight
    priorityId: 'prio_critical',
    status: 'expiring_soon',
    barcode: '022220416002',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAB1r0OxfTzGRbPCvTCylBHYHFHYLixtZoE7TF7VJaIpdUHceU-8Abn3x7sNIixE4J0-9IRBJ6B2dG1iLqm7tpxFaWca4BIqWPVBad519JhtqoZtjQvSnh4BKi_iJQBCsiVroBIVPRTqMT-EbDbG0-k11sk6XxyCqdvSRLWSCWLtJoYzh3lPXPcOOSITh0G30mHydOCJnhd92dytwth679xFsFAWWIJF3yqcbXD3S8n4ERCBvS2mv5w',
    inShoppingList: true,
    shoppingQuantity: 2,
    lastAudited: '2026-10-10T00:15:00Z',
  },
  {
    id: 'item_spinach',
    name: 'Baby Spinach',
    description: 'Fresh organic greens • 300g tub',
    categoryId: 'cat_produce',
    locationId: 'loc_kitchen',
    shelfId: 'shelf_fridge_tier2',
    shelfLocation: 'Fridge Tier 2',
    quantity: 1,
    targetQuantity: 1,
    unitId: 'unit_g',
    price: 4.50,
    expirationDate: '2026-10-12', // Expiring in 2 days
    priorityId: 'prio_critical',
    status: 'expiring_soon',
    barcode: '033330416003',
    inShoppingList: true,
    shoppingQuantity: 1,
    lastAudited: '2026-10-10T00:15:00Z',
  },
  {
    id: 'item_olive_oil',
    name: 'Extra Virgin Olive Oil',
    description: '1L Cold Pressed Glass Bottle',
    categoryId: 'cat_pantry',
    locationId: 'loc_kitchen',
    shelfId: 'shelf_pantry_2',
    shelfLocation: 'Pantry Shelf 2',
    quantity: 1,
    targetQuantity: 2,
    unitId: 'unit_btl',
    price: 18.90,
    expirationDate: '2027-04-15',
    priorityId: 'prio_replenish',
    status: 'low_stock',
    barcode: '044440416004',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHgM1oaQ3QYKbd3j2S-WnA3wqzfEIocQO3WgdT7KQixEiQCnLM5JhnUJVNpmCxALAbS5fjoaatGcF-1ZdBNvSHOxLsvWmqjxa3Bx4H2-W_jHXud54g5LQ4UO8hXsA24oOrncctLKuqwnLf_4LUCtqCTwTKF1FoKxzunzgH_P2hYoBa7L_e93S7FCKplodNVZJqmfmAB8E8WqmfMU2DmgPg10BuAA8DYGdFV9cehwZSOHMEY-_NH4Kz',
    inShoppingList: true,
    shoppingQuantity: 2,
    lastAudited: '2026-10-10T00:15:00Z',
  },
  {
    id: 'item_coffee',
    name: 'Ground Dark Roast Coffee',
    description: '340g French Roast Coarse',
    categoryId: 'cat_beverages',
    locationId: 'loc_kitchen',
    shelfId: 'shelf_pantry_2',
    shelfLocation: 'Coffee Station Bin',
    quantity: 100, // 100g left
    targetQuantity: 500,
    unitId: 'unit_g',
    price: 14.50,
    expirationDate: '2027-01-20',
    priorityId: 'prio_replenish',
    status: 'low_stock',
    barcode: '055550416005',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwfezhi9i-BCSNwzjtdzE9Wa4lin0h5Iu6wCBFowgUJNm1b1M0xGllwcfwlClZN67E-Z-fw9Jq0kR5c7RoOGjtT8tLDcOQaf7T_OxykI0LG6Et87OIyBYuUI968giqrN1GGmNJTE0-vWC0JnSJ54HheKg9xEPH7YtKj66l6334cx4rO-XuacIW_yyK67oP2JZG55WGJr6bF8CZBT39xozwcq3mvqNPhzGi_EfoKNWItHluO27rhZnF',
    inShoppingList: true,
    shoppingQuantity: 1,
    lastAudited: '2026-10-10T00:15:00Z',
  },
  {
    id: 'item_dishwasher_pods',
    name: 'Dishwasher Pods',
    description: '60 Count • Platinum Action',
    categoryId: 'cat_household',
    locationId: 'loc_kitchen',
    shelfId: 'shelf_pantry_2',
    shelfLocation: 'Under Sink Basket',
    quantity: 3, // 3 pods left
    targetQuantity: 15,
    unitId: 'unit_pod',
    price: 19.99,
    expirationDate: '2028-06-01',
    priorityId: 'prio_household',
    status: 'low_stock',
    barcode: '066660416006',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBosbBecAqkPB9GKj3kf1cemDcZRO8oflbiwixEXbKdjkx0Cd27GUVls24qYBFdClSoTqRcc66OE9ZnaGwGfFM418gV3V_XlNJG6etzLFE-2m9s26RaaGHTXyBqq7KAMnid7sGCU9P9L3TOZEx58gAebs9KCROxpPDO5ltgKlpwCb6OI5Zrn7xHYhJHkrt_BkaCKBZCOluvj6_AA1M_UvDMKs-u2AngWYmxrxIwEPtHGbibCfaUrTz5',
    inShoppingList: true,
    shoppingQuantity: 1,
    lastAudited: '2026-10-10T00:15:00Z',
  },
  {
    id: 'item_batteries',
    name: 'AAA Alkaline Batteries',
    description: '16 Pack • Long Life',
    categoryId: 'cat_tools',
    locationId: 'loc_basement',
    shelfId: 'shelf_basement_drawer3',
    shelfLocation: 'Basement Utility Drawer 3',
    quantity: 2,
    targetQuantity: 16,
    unitId: 'unit_pk',
    price: 13.99,
    expirationDate: '2030-12-31',
    priorityId: 'prio_household',
    status: 'low_stock',
    barcode: '077770416007',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDq3GSNUdMmO_0YptkXLv1S_1dqWXY2mBHed3uHJ8JVTktJmLuN1Ab1Cjch5Rg0H3-XqR1bvRb7G1hRVpsD9dMCr5i8dCHOzohnfprJpQBb-4Q7lXR__k2FYloPZkONdSPesYyuskk0wJX0Qit6C46nYuxsh9j8T3BBGYJEjwWN7WjydPaSTkCos1vYAwPrEkACmXpJsgqUmN_qpax1a4oVadqJRGarTdnzol3mGIrQmI1so0XRBEPc',
    inShoppingList: true,
    shoppingQuantity: 1,
    lastAudited: '2026-10-10T00:15:00Z',
  },
  {
    id: 'item_allergy_med',
    name: "Children's Allergy Relief",
    description: 'Oral suspension 4 fl oz',
    categoryId: 'cat_medical',
    locationId: 'loc_med',
    shelfId: 'shelf_med_top',
    shelfLocation: 'Medicine Cabinet',
    quantity: 1,
    targetQuantity: 1,
    unitId: 'unit_btl',
    price: 24.51,
    expirationDate: '2023-11-15', // Expired Nov '23
    priorityId: 'prio_critical',
    status: 'expired',
    barcode: '088880416008',
    inShoppingList: true,
    shoppingQuantity: 1,
    lastAudited: '2026-10-10T00:15:00Z',
  },
  {
    id: 'item_cough_syrup',
    name: 'Cough Syrup (Nighttime)',
    description: 'Adult formula 8 oz',
    categoryId: 'cat_medical',
    locationId: 'loc_med',
    shelfId: 'shelf_med_top',
    shelfLocation: 'Medicine Cabinet',
    quantity: 1,
    targetQuantity: 1,
    unitId: 'unit_btl',
    price: 11.20,
    expirationDate: '2023-11-20',
    priorityId: 'prio_critical',
    status: 'expired',
    barcode: '099990416009',
    inShoppingList: false,
    lastAudited: '2026-10-10T00:15:00Z',
  },
  {
    id: 'item_rice',
    name: 'Jasmine Rice',
    description: 'Thai Hom Mali long grain',
    categoryId: 'cat_pantry',
    locationId: 'loc_kitchen',
    shelfId: 'shelf_pantry_2',
    shelfLocation: 'Pantry Shelf 2',
    quantity: 2,
    targetQuantity: 2,
    unitId: 'unit_kg',
    price: 6.99,
    expirationDate: '2027-08-10',
    priorityId: 'prio_normal',
    status: 'optimal',
    barcode: '101010416010',
    inShoppingList: false,
    lastAudited: '2026-10-10T00:15:00Z',
  },
  {
    id: 'item_oats',
    name: 'Rolled Oats',
    description: 'Whole grain organic oats tub',
    categoryId: 'cat_pantry',
    locationId: 'loc_kitchen',
    shelfId: 'shelf_pantry_2',
    shelfLocation: 'Pantry Shelf 2',
    quantity: 1,
    targetQuantity: 2,
    unitId: 'unit_tub',
    price: 4.89,
    expirationDate: '2027-02-15',
    priorityId: 'prio_replenish',
    status: 'low_stock',
    barcode: '111110416011',
    inShoppingList: false,
    lastAudited: '2026-10-10T00:15:00Z',
  },
  {
    id: 'item_tomatoes',
    name: 'Crushed Tomatoes',
    description: 'San Marzano Italian organic cans',
    categoryId: 'cat_pantry',
    locationId: 'loc_kitchen',
    shelfId: 'shelf_pantry_2',
    shelfLocation: 'Pantry Shelf 2',
    quantity: 4,
    targetQuantity: 4,
    unitId: 'unit_can',
    price: 2.79,
    expirationDate: '2027-11-30',
    priorityId: 'prio_normal',
    status: 'optimal',
    barcode: '121210416012',
    inShoppingList: false,
    lastAudited: '2026-10-10T00:15:00Z',
  },
  {
    id: 'item_led_bulbs',
    name: 'LED Bulbs 60W',
    description: 'Warm white soft light 8-pack',
    categoryId: 'cat_tools',
    locationId: 'loc_basement',
    shelfId: 'shelf_basement_a',
    shelfLocation: 'Heavy Shelf A',
    quantity: 8,
    targetQuantity: 8,
    unitId: 'unit_pk',
    price: 16.50,
    expirationDate: '2035-01-01',
    priorityId: 'prio_normal',
    status: 'optimal',
    barcode: '131310416013',
    inShoppingList: false,
    lastAudited: '2026-10-10T00:15:00Z',
  },
  {
    id: 'item_water',
    name: 'Spring Water Cases',
    description: '24 x 500ml pure mountain spring water',
    categoryId: 'cat_beverages',
    locationId: 'loc_basement',
    shelfId: 'shelf_basement_a',
    shelfLocation: 'Heavy Shelf A',
    quantity: 3,
    targetQuantity: 3,
    unitId: 'unit_cs',
    price: 8.99,
    expirationDate: '2027-05-15',
    priorityId: 'prio_normal',
    status: 'optimal',
    barcode: '141410416014',
    inShoppingList: false,
    lastAudited: '2026-10-10T00:15:00Z',
  },
  {
    id: 'item_hepa',
    name: 'HEPA Filters',
    description: 'Replacement air purifier grade H13',
    categoryId: 'cat_household',
    locationId: 'loc_basement',
    shelfId: 'shelf_basement_a',
    shelfLocation: 'Heavy Shelf A',
    quantity: 4,
    targetQuantity: 4,
    unitId: 'unit_un',
    price: 29.99,
    expirationDate: '2030-01-01',
    priorityId: 'prio_normal',
    status: 'optimal',
    barcode: '151510416015',
    inShoppingList: false,
    lastAudited: '2026-10-10T00:15:00Z',
  },
];

// Generate remainder items to reach exact 142 total asset count
function generateFullDemoInventory(): InventoryItem[] {
  const items: InventoryItem[] = [...INITIAL_FEATURED_ITEMS];
  
  // Create 127 additional distinct realistic household items
  const titles = [
    { name: 'Quinoa Grain Organic', cat: 'cat_pantry', loc: 'loc_kitchen', shelf: 'shelf_pantry_2', p: 7.20, u: 'unit_kg' },
    { name: 'Spaghetti Pasta No. 5', cat: 'cat_pantry', loc: 'loc_kitchen', shelf: 'shelf_pantry_2', p: 2.10, u: 'unit_pk' },
    { name: 'Black Beans Organic', cat: 'cat_pantry', loc: 'loc_kitchen', shelf: 'shelf_pantry_2', p: 1.89, u: 'unit_can' },
    { name: 'Coconut Milk Unsweetened', cat: 'cat_pantry', loc: 'loc_kitchen', shelf: 'shelf_pantry_2', p: 3.25, u: 'unit_can' },
    { name: 'Almond Flour Finely Ground', cat: 'cat_pantry', loc: 'loc_kitchen', shelf: 'shelf_pantry_2', p: 9.40, u: 'unit_kg' },
    { name: 'Pure Maple Syrup Grade A', cat: 'cat_pantry', loc: 'loc_kitchen', shelf: 'shelf_pantry_2', p: 12.50, u: 'unit_btl' },
    { name: 'Raw Honey Organic', cat: 'cat_pantry', loc: 'loc_kitchen', shelf: 'shelf_pantry_2', p: 11.20, u: 'unit_btl' },
    { name: 'Apple Cider Vinegar', cat: 'cat_pantry', loc: 'loc_kitchen', shelf: 'shelf_pantry_2', p: 6.80, u: 'unit_btl' },
    { name: 'Balsamic Vinegar Modena', cat: 'cat_pantry', loc: 'loc_kitchen', shelf: 'shelf_pantry_2', p: 14.90, u: 'unit_btl' },
    { name: 'Sea Salt Coarse Grinder', cat: 'cat_pantry', loc: 'loc_kitchen', shelf: 'shelf_pantry_2', p: 4.50, u: 'unit_btl' },
    { name: 'Peanut Butter Creamy', cat: 'cat_pantry', loc: 'loc_kitchen', shelf: 'shelf_pantry_2', p: 5.20, u: 'unit_tub' },
    { name: 'Green Tea Matcha Powder', cat: 'cat_beverages', loc: 'loc_kitchen', shelf: 'shelf_pantry_2', p: 18.00, u: 'unit_can' },
    { name: 'Earl Grey Black Tea Bags', cat: 'cat_beverages', loc: 'loc_kitchen', shelf: 'shelf_pantry_2', p: 5.90, u: 'unit_pk' },
    { name: 'Sparkling Mineral Water', cat: 'cat_beverages', loc: 'loc_kitchen', shelf: 'shelf_fridge_1', p: 7.99, u: 'unit_cs' },
    { name: 'Cheddar Cheese Block Sharp', cat: 'cat_dairy', loc: 'loc_kitchen', shelf: 'shelf_fridge_1', p: 6.50, u: 'unit_un' },
    { name: 'Parmigiano Reggiano Wedge', cat: 'cat_dairy', loc: 'loc_kitchen', shelf: 'shelf_fridge_1', p: 13.40, u: 'unit_un' },
    { name: 'Butter Unsalted Sweet Cream', cat: 'cat_dairy', loc: 'loc_kitchen', shelf: 'shelf_fridge_1', p: 5.80, u: 'unit_pk' },
    { name: 'Eggs Pasture-Raised 12pk', cat: 'cat_dairy', loc: 'loc_kitchen', shelf: 'shelf_fridge_1', p: 6.29, u: 'unit_pk' },
    { name: 'Heavy Whipping Cream', cat: 'cat_dairy', loc: 'loc_kitchen', shelf: 'shelf_fridge_1', p: 4.10, u: 'unit_btl' },
    { name: 'Garlic Bulbs 3pk', cat: 'cat_produce', loc: 'loc_kitchen', shelf: 'shelf_pantry_2', p: 2.50, u: 'unit_pk' },
    { name: 'Yellow Onions 3lb Bag', cat: 'cat_produce', loc: 'loc_kitchen', shelf: 'shelf_pantry_2', p: 3.99, u: 'unit_pk' },
    { name: 'Lemons Organic 5pk', cat: 'cat_produce', loc: 'loc_kitchen', shelf: 'shelf_fridge_tier2', p: 4.20, u: 'unit_pk' },
    { name: 'Avocados Hass 4pk', cat: 'cat_produce', loc: 'loc_kitchen', shelf: 'shelf_fridge_tier2', p: 5.50, u: 'unit_pk' },
    { name: 'Carrots Organic 2lb', cat: 'cat_produce', loc: 'loc_kitchen', shelf: 'shelf_fridge_tier2', p: 2.99, u: 'unit_pk' },
    { name: 'Microfiber Cleaning Cloths', cat: 'cat_household', loc: 'loc_basement', shelf: 'shelf_basement_drawer3', p: 12.00, u: 'unit_pk' },
    { name: 'Multi-Surface Cleaner Spray', cat: 'cat_household', loc: 'loc_basement', shelf: 'shelf_basement_a', p: 4.80, u: 'unit_btl' },
    { name: 'Laundry Detergent Pods 42ct', cat: 'cat_household', loc: 'loc_basement', shelf: 'shelf_basement_a', p: 17.50, u: 'unit_pod' },
    { name: 'Paper Towels Ultra 6pk', cat: 'cat_household', loc: 'loc_basement', shelf: 'shelf_basement_a', p: 14.20, u: 'unit_pk' },
    { name: 'Trash Bags Heavy Duty 13gal', cat: 'cat_household', loc: 'loc_basement', shelf: 'shelf_basement_a', p: 16.90, u: 'unit_pk' },
    { name: 'AA Alkaline Batteries 24pk', cat: 'cat_tools', loc: 'loc_basement', shelf: 'shelf_basement_drawer3', p: 18.50, u: 'unit_pk' },
    { name: '9V Smoke Alarm Battery 4pk', cat: 'cat_tools', loc: 'loc_basement', shelf: 'shelf_basement_drawer3', p: 11.20, u: 'unit_pk' },
    { name: 'Duct Tape Industrial Grade', cat: 'cat_tools', loc: 'loc_garage', shelf: 'shelf_garage_1', p: 8.50, u: 'unit_un' },
    { name: 'Screwdriver Set 12pc', cat: 'cat_tools', loc: 'loc_garage', shelf: 'shelf_garage_1', p: 24.99, u: 'unit_pk' },
    { name: 'Socket Wrench Metric Kit', cat: 'cat_tools', loc: 'loc_garage', shelf: 'shelf_garage_1', p: 42.00, u: 'unit_un' },
    { name: 'Cordless Drill 18V', cat: 'cat_tools', loc: 'loc_garage', shelf: 'shelf_garage_1', p: 89.00, u: 'unit_un' },
    { name: 'Work Gloves Leather L', cat: 'cat_tools', loc: 'loc_garage', shelf: 'shelf_garage_1', p: 14.00, u: 'unit_pk' },
    { name: 'Motor Oil 5W-30 Full Synth', cat: 'cat_tools', loc: 'loc_garage', shelf: 'shelf_garage_1', p: 32.50, u: 'unit_gal' },
    { name: 'Ibuprofen 200mg 100ct', cat: 'cat_medical', loc: 'loc_med', shelf: 'shelf_med_top', p: 8.99, u: 'unit_btl' },
    { name: 'Acetaminophen 500mg 100ct', cat: 'cat_medical', loc: 'loc_med', shelf: 'shelf_med_top', p: 9.40, u: 'unit_btl' },
    { name: 'Adhesive Bandages Variety 80ct', cat: 'cat_medical', loc: 'loc_med', shelf: 'shelf_med_top', p: 6.50, u: 'unit_pk' },
    { name: 'Antiseptic Rubbing Alcohol 16oz', cat: 'cat_medical', loc: 'loc_med', shelf: 'shelf_med_top', p: 3.20, u: 'unit_btl' },
    { name: 'Hydrogen Peroxide 3% 16oz', cat: 'cat_medical', loc: 'loc_med', shelf: 'shelf_med_top', p: 2.50, u: 'unit_btl' },
    { name: 'Hydrocortisone Cream 1%', cat: 'cat_medical', loc: 'loc_med', shelf: 'shelf_med_top', p: 5.90, u: 'unit_un' },
    { name: 'Digital Oral Thermometer', cat: 'cat_medical', loc: 'loc_med', shelf: 'shelf_med_top', p: 12.99, u: 'unit_un' },
    { name: 'Moisturizing Body Wash 18oz', cat: 'cat_household', loc: 'loc_bath', shelf: 'shelf_bath_cabinet', p: 7.80, u: 'unit_btl' },
    { name: 'Shampoo Daily Moisture', cat: 'cat_household', loc: 'loc_bath', shelf: 'shelf_bath_cabinet', p: 9.20, u: 'unit_btl' },
    { name: 'Toothpaste Fluoride 3pk', cat: 'cat_household', loc: 'loc_bath', shelf: 'shelf_bath_cabinet', p: 8.40, u: 'unit_pk' },
    { name: 'Dental Floss Mint 3pk', cat: 'cat_household', loc: 'loc_bath', shelf: 'shelf_bath_cabinet', p: 5.50, u: 'unit_pk' },
    { name: 'Hand Soap Refill 32oz', cat: 'cat_household', loc: 'loc_bath', shelf: 'shelf_bath_cabinet', p: 6.99, u: 'unit_btl' },
  ];

  let currentIdx = 0;
  while (items.length < 142) {
    const template = titles[currentIdx % titles.length];
    const indexSuffix = Math.floor(currentIdx / titles.length) + 1;
    const name = indexSuffix > 1 ? `${template.name} (Batch #${indexSuffix})` : template.name;
    const id = `item_gen_${items.length + 1}`;
    
    items.push({
      id,
      name,
      description: `Reserve domestic inventory asset`,
      categoryId: template.cat,
      locationId: template.loc,
      shelfId: template.shelf,
      shelfLocation: `${template.loc === 'loc_kitchen' ? 'Kitchen Pantry' : template.loc === 'loc_basement' ? 'Basement Utility' : template.loc === 'loc_med' ? 'Medicine Cabinet' : template.loc === 'loc_garage' ? 'Garage Storage' : 'Master Bath'} Tier`,
      quantity: 3,
      targetQuantity: 3,
      unitId: template.u,
      price: template.p,
      expirationDate: '2027-09-20',
      priorityId: 'prio_normal',
      status: 'optimal',
      barcode: `200000${String(items.length).padStart(6, '0')}`,
      inShoppingList: false,
      lastAudited: '2026-10-10T00:15:00Z',
    });
    
    currentIdx++;
  }

  return items;
}

// Initial Transaction Audit Entries with realistic 7-day relative timestamps
export function generateInitialAuditLog(): TransactionAuditEntry[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  return [
    {
      id: 'log_d0_1',
      timestamp: new Date(now - 0.2 * dayMs).toISOString(),
      action: 'CONSUME',
      itemName: 'Organic Whole Milk',
      itemId: 'item_milk',
      quantityChange: -1,
      note: 'Breakfast use logged',
    },
    {
      id: 'log_d0_2',
      timestamp: new Date(now - 0.5 * dayMs).toISOString(),
      action: 'CONSUME',
      itemName: 'Ground Dark Roast Coffee',
      itemId: 'item_coffee',
      quantityChange: -50,
      note: 'Morning brew consumption',
    },
    {
      id: 'log_d1_1',
      timestamp: new Date(now - 1.1 * dayMs).toISOString(),
      action: 'CONSUME',
      itemName: 'Extra Virgin Olive Oil',
      itemId: 'item_olive_oil',
      quantityChange: -1,
      note: 'Dinner cooking usage',
    },
    {
      id: 'log_d1_2',
      timestamp: new Date(now - 1.4 * dayMs).toISOString(),
      action: 'CONSUME',
      itemName: 'Dishwasher Pods',
      itemId: 'item_dishwasher_pods',
      quantityChange: -2,
      note: 'Kitchen cleanup cycle',
    },
    {
      id: 'log_d2_1',
      timestamp: new Date(now - 2.2 * dayMs).toISOString(),
      action: 'CONSUME',
      itemName: 'Greek Yogurt Vanilla',
      itemId: 'item_yogurt',
      quantityChange: -2,
      note: 'Snack consumption',
    },
    {
      id: 'log_d2_2',
      timestamp: new Date(now - 2.6 * dayMs).toISOString(),
      action: 'RESTOCK',
      itemName: 'LED Bulbs 60W',
      itemId: 'item_led_bulbs',
      quantityChange: 8,
      note: 'Restocked into Basement Heavy Shelf A',
    },
    {
      id: 'log_d3_1',
      timestamp: new Date(now - 3.1 * dayMs).toISOString(),
      action: 'CONSUME',
      itemName: 'Organic Whole Milk',
      itemId: 'item_milk',
      quantityChange: -2,
      note: 'Baking and daily consumption',
    },
    {
      id: 'log_d3_2',
      timestamp: new Date(now - 3.5 * dayMs).toISOString(),
      action: 'CONSUME',
      itemName: 'Ground Dark Roast Coffee',
      itemId: 'item_coffee',
      quantityChange: -60,
      note: 'Daily brew replenishment',
    },
    {
      id: 'log_d4_1',
      timestamp: new Date(now - 4.2 * dayMs).toISOString(),
      action: 'CONSUME',
      itemName: 'Sourdough Bread',
      itemId: 'item_bread',
      quantityChange: -1,
      note: 'Sandwich preparation',
    },
    {
      id: 'log_d5_1',
      timestamp: new Date(now - 5.3 * dayMs).toISOString(),
      action: 'CONSUME',
      itemName: 'Extra Virgin Olive Oil',
      itemId: 'item_olive_oil',
      quantityChange: -1,
      note: 'Meal prep batch',
    },
    {
      id: 'log_d6_1',
      timestamp: new Date(now - 6.1 * dayMs).toISOString(),
      action: 'CONSUME',
      itemName: 'Greek Yogurt Vanilla',
      itemId: 'item_yogurt',
      quantityChange: -3,
      note: 'Family brunch usage',
    },
    {
      id: 'log_d6_2',
      timestamp: new Date(now - 6.5 * dayMs).toISOString(),
      action: 'AUDIT',
      itemName: 'Pantry Shelf 2',
      note: 'Zone audit verified',
    },
  ];
}

export const INITIAL_AUDIT_LOG: TransactionAuditEntry[] = generateInitialAuditLog();

// Asynchronous IndexedDB Local Vault
export class HomeShelfDatabase {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Inventory Items Store
        if (!db.objectStoreNames.contains('items')) {
          const itemStore = db.createObjectStore('items', { keyPath: 'id' });
          itemStore.createIndex('categoryId', 'categoryId', { unique: false });
          itemStore.createIndex('locationId', 'locationId', { unique: false });
          itemStore.createIndex('shelfId', 'shelfId', { unique: false });
          itemStore.createIndex('status', 'status', { unique: false });
          itemStore.createIndex('barcode', 'barcode', { unique: false });
        }

        // Master Data Stores
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('locations')) {
          db.createObjectStore('locations', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('shelves')) {
          db.createObjectStore('shelves', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('units')) {
          db.createObjectStore('units', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('priorities')) {
          db.createObjectStore('priorities', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('audit_log')) {
          db.createObjectStore('audit_log', { keyPath: 'id' });
        }
      };

      request.onsuccess = async () => {
        const db = request.result;
        // Verify if seeded, otherwise populate defaults
        const count = await this.getItemCount(db);
        if (count === 0) {
          await this.seedDefaults(db);
        }
        resolve(db);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  private getItemCount(db: IDBDatabase): Promise<number> {
    return new Promise((resolve) => {
      const tx = db.transaction('items', 'readonly');
      const store = tx.objectStore('items');
      const countReq = store.count();
      countReq.onsuccess = () => resolve(countReq.result);
      countReq.onerror = () => resolve(0);
    });
  }

  private async seedDefaults(db: IDBDatabase): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(
        ['items', 'categories', 'locations', 'shelves', 'units', 'priorities', 'audit_log'],
        'readwrite'
      );

      const itemStore = tx.objectStore('items');
      const catStore = tx.objectStore('categories');
      const locStore = tx.objectStore('locations');
      const shelfStore = tx.objectStore('shelves');
      const unitStore = tx.objectStore('units');
      const prioStore = tx.objectStore('priorities');
      const auditStore = tx.objectStore('audit_log');

      DEFAULT_CATEGORIES.forEach((c) => catStore.put(c));
      DEFAULT_LOCATIONS.forEach((l) => locStore.put(l));
      DEFAULT_SHELVES.forEach((s) => shelfStore.put(s));
      DEFAULT_UNITS.forEach((u) => unitStore.put(u));
      DEFAULT_PRIORITIES.forEach((p) => prioStore.put(p));
      INITIAL_AUDIT_LOG.forEach((a) => auditStore.put(a));

      const allDemoItems = generateFullDemoInventory();
      allDemoItems.forEach((item) => itemStore.put(item));

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- Inventory Item Operations ---

  async getItems(): Promise<InventoryItem[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('items', 'readonly');
      const store = tx.objectStore('items');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async saveItem(item: InventoryItem): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['items', 'audit_log'], 'readwrite');
      const store = tx.objectStore('items');
      store.put(item);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async deleteItem(id: string): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('items', 'readwrite');
      const store = tx.objectStore('items');
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- Master Data Operations ---

  async getCategories(): Promise<MasterCategory[]> {
    const db = await this.initDB();
    return new Promise((resolve) => {
      const tx = db.transaction('categories', 'readonly');
      const req = tx.objectStore('categories').getAll();
      req.onsuccess = () => resolve(req.result || DEFAULT_CATEGORIES);
      req.onerror = () => resolve(DEFAULT_CATEGORIES);
    });
  }

  async saveCategory(cat: MasterCategory): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve) => {
      const tx = db.transaction('categories', 'readwrite');
      tx.objectStore('categories').put(cat);
      tx.oncomplete = () => resolve();
    });
  }

  async deleteCategory(id: string): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve) => {
      const tx = db.transaction('categories', 'readwrite');
      tx.objectStore('categories').delete(id);
      tx.oncomplete = () => resolve();
    });
  }

  async getLocations(): Promise<MasterLocation[]> {
    const db = await this.initDB();
    return new Promise((resolve) => {
      const tx = db.transaction('locations', 'readonly');
      const req = tx.objectStore('locations').getAll();
      req.onsuccess = () => resolve(req.result || DEFAULT_LOCATIONS);
      req.onerror = () => resolve(DEFAULT_LOCATIONS);
    });
  }

  async saveLocation(loc: MasterLocation): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve) => {
      const tx = db.transaction('locations', 'readwrite');
      tx.objectStore('locations').put(loc);
      tx.oncomplete = () => resolve();
    });
  }

  async deleteLocation(id: string): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve) => {
      const tx = db.transaction('locations', 'readwrite');
      tx.objectStore('locations').delete(id);
      tx.oncomplete = () => resolve();
    });
  }

  async getShelves(): Promise<MasterShelf[]> {
    const db = await this.initDB();
    return new Promise((resolve) => {
      const tx = db.transaction('shelves', 'readonly');
      const req = tx.objectStore('shelves').getAll();
      req.onsuccess = () => resolve(req.result || DEFAULT_SHELVES);
      req.onerror = () => resolve(DEFAULT_SHELVES);
    });
  }

  async saveShelf(shelf: MasterShelf): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve) => {
      const tx = db.transaction('shelves', 'readwrite');
      tx.objectStore('shelves').put(shelf);
      tx.oncomplete = () => resolve();
    });
  }

  async deleteShelf(id: string): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve) => {
      const tx = db.transaction('shelves', 'readwrite');
      tx.objectStore('shelves').delete(id);
      tx.oncomplete = () => resolve();
    });
  }

  async getUnits(): Promise<MasterUnit[]> {
    const db = await this.initDB();
    return new Promise((resolve) => {
      const tx = db.transaction('units', 'readonly');
      const req = tx.objectStore('units').getAll();
      req.onsuccess = () => resolve(req.result || DEFAULT_UNITS);
      req.onerror = () => resolve(DEFAULT_UNITS);
    });
  }

  async saveUnit(unit: MasterUnit): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve) => {
      const tx = db.transaction('units', 'readwrite');
      tx.objectStore('units').put(unit);
      tx.oncomplete = () => resolve();
    });
  }

  async deleteUnit(id: string): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve) => {
      const tx = db.transaction('units', 'readwrite');
      tx.objectStore('units').delete(id);
      tx.oncomplete = () => resolve();
    });
  }

  async getPriorities(): Promise<MasterPriority[]> {
    const db = await this.initDB();
    return new Promise((resolve) => {
      const tx = db.transaction('priorities', 'readonly');
      const req = tx.objectStore('priorities').getAll();
      req.onsuccess = () => resolve(req.result || DEFAULT_PRIORITIES);
      req.onerror = () => resolve(DEFAULT_PRIORITIES);
    });
  }

  async savePriority(prio: MasterPriority): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve) => {
      const tx = db.transaction('priorities', 'readwrite');
      tx.objectStore('priorities').put(prio);
      tx.oncomplete = () => resolve();
    });
  }

  async deletePriority(id: string): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve) => {
      const tx = db.transaction('priorities', 'readwrite');
      tx.objectStore('priorities').delete(id);
      tx.oncomplete = () => resolve();
    });
  }

  // --- Audit Log ---

  async getAuditLog(): Promise<TransactionAuditEntry[]> {
    const db = await this.initDB();
    return new Promise((resolve) => {
      const tx = db.transaction('audit_log', 'readonly');
      const req = tx.objectStore('audit_log').getAll();
      req.onsuccess = () => resolve(req.result || INITIAL_AUDIT_LOG);
      req.onerror = () => resolve(INITIAL_AUDIT_LOG);
    });
  }

  async recordAudit(entry: TransactionAuditEntry): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve) => {
      const tx = db.transaction('audit_log', 'readwrite');
      tx.objectStore('audit_log').put(entry);
      tx.oncomplete = () => resolve();
    });
  }

  // --- Backup & Restore ---

  async exportDatabase(): Promise<string> {
    const [items, categories, locations, shelves, units, priorities, auditLog] = await Promise.all([
      this.getItems(),
      this.getCategories(),
      this.getLocations(),
      this.getShelves(),
      this.getUnits(),
      this.getPriorities(),
      this.getAuditLog(),
    ]);

    const backup = {
      version: 1,
      appName: 'HomeShelf',
      exportedAt: new Date().toISOString(),
      data: { items, categories, locations, shelves, units, priorities, auditLog },
    };

    return JSON.stringify(backup, null, 2);
  }

  async importDatabase(
    jsonString: string,
    mode: 'replace' | 'merge' = 'replace'
  ): Promise<{ success: boolean; itemsCount: number; message: string }> {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || !parsed.data || !Array.isArray(parsed.data.items)) {
        return {
          success: false,
          itemsCount: 0,
          message: 'Invalid HomeShelf JSON schema: missing items collection',
        };
      }

      const db = await this.initDB();

      if (mode === 'replace') {
        return new Promise((resolve) => {
          const tx = db.transaction(
            ['items', 'categories', 'locations', 'shelves', 'units', 'priorities', 'audit_log'],
            'readwrite'
          );

          const stores = {
            items: tx.objectStore('items'),
            categories: tx.objectStore('categories'),
            locations: tx.objectStore('locations'),
            shelves: tx.objectStore('shelves'),
            units: tx.objectStore('units'),
            priorities: tx.objectStore('priorities'),
            audit_log: tx.objectStore('audit_log'),
          };

          // Clear all existing stores
          Object.values(stores).forEach((s) => s.clear());

          // Insert all parsed data
          const itemsList: InventoryItem[] = parsed.data.items || [];
          itemsList.forEach((i: InventoryItem) => stores.items.put(i));
          if (parsed.data.categories) parsed.data.categories.forEach((c: MasterCategory) => stores.categories.put(c));
          if (parsed.data.locations) parsed.data.locations.forEach((l: MasterLocation) => stores.locations.put(l));
          if (parsed.data.shelves) parsed.data.shelves.forEach((s: MasterShelf) => stores.shelves.put(s));
          if (parsed.data.units) parsed.data.units.forEach((u: MasterUnit) => stores.units.put(u));
          if (parsed.data.priorities) parsed.data.priorities.forEach((p: MasterPriority) => stores.priorities.put(p));
          if (parsed.data.auditLog) parsed.data.auditLog.forEach((a: TransactionAuditEntry) => stores.audit_log.put(a));

          // Record restoration audit log
          stores.audit_log.put({
            id: `audit_import_replace_${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: 'RESTOCK',
            itemName: 'Database Vault Restore',
            quantityChange: itemsList.length,
            note: `Full database restored from JSON backup (${itemsList.length} items loaded)`,
          });

          tx.oncomplete = () => {
            resolve({
              success: true,
              itemsCount: itemsList.length,
              message: `Successfully replaced database with ${itemsList.length} items`,
            });
          };

          tx.onerror = () => {
            resolve({
              success: false,
              itemsCount: 0,
              message: 'Database transaction error during replace restore',
            });
          };
        });
      }

      // Merge Mode: Keep existing items and append non-duplicates
      const existingItems = await this.getItems();
      const existingCats = await this.getCategories();
      const existingLocs = await this.getLocations();
      const existingShelves = await this.getShelves();
      const existingUnits = await this.getUnits();
      const existingPrios = await this.getPriorities();

      const existingItemIds = new Set(existingItems.map((i) => i.id));
      const existingItemBarcodes = new Set(existingItems.map((i) => i.barcode).filter(Boolean));
      const existingItemNames = new Set(existingItems.map((i) => i.name.trim().toLowerCase()));

      const incomingItems: InventoryItem[] = parsed.data.items || [];
      const newItemsToInsert: InventoryItem[] = [];

      for (const item of incomingItems) {
        const isDuplicate =
          existingItemIds.has(item.id) ||
          (item.barcode && existingItemBarcodes.has(item.barcode)) ||
          existingItemNames.has(item.name.trim().toLowerCase());

        if (!isDuplicate) {
          newItemsToInsert.push(item);
          existingItemIds.add(item.id);
          if (item.barcode) existingItemBarcodes.add(item.barcode);
          existingItemNames.add(item.name.trim().toLowerCase());
        }
      }

      return new Promise((resolve) => {
        const tx = db.transaction(
          ['items', 'categories', 'locations', 'shelves', 'units', 'priorities', 'audit_log'],
          'readwrite'
        );

        const stores = {
          items: tx.objectStore('items'),
          categories: tx.objectStore('categories'),
          locations: tx.objectStore('locations'),
          shelves: tx.objectStore('shelves'),
          units: tx.objectStore('units'),
          priorities: tx.objectStore('priorities'),
          audit_log: tx.objectStore('audit_log'),
        };

        // Insert new non-duplicate items
        newItemsToInsert.forEach((i) => stores.items.put(i));

        // Merge master tables
        const existingCatIds = new Set(existingCats.map((c) => c.id));
        if (parsed.data.categories) {
          parsed.data.categories.forEach((c: MasterCategory) => {
            if (!existingCatIds.has(c.id)) stores.categories.put(c);
          });
        }

        const existingLocIds = new Set(existingLocs.map((l) => l.id));
        if (parsed.data.locations) {
          parsed.data.locations.forEach((l: MasterLocation) => {
            if (!existingLocIds.has(l.id)) stores.locations.put(l);
          });
        }

        const existingShelfIds = new Set(existingShelves.map((s) => s.id));
        if (parsed.data.shelves) {
          parsed.data.shelves.forEach((s: MasterShelf) => {
            if (!existingShelfIds.has(s.id)) stores.shelves.put(s);
          });
        }

        const existingUnitIds = new Set(existingUnits.map((u) => u.id));
        if (parsed.data.units) {
          parsed.data.units.forEach((u: MasterUnit) => {
            if (!existingUnitIds.has(u.id)) stores.units.put(u);
          });
        }

        const existingPrioIds = new Set(existingPrios.map((p) => p.id));
        if (parsed.data.priorities) {
          parsed.data.priorities.forEach((p: MasterPriority) => {
            if (!existingPrioIds.has(p.id)) stores.priorities.put(p);
          });
        }

        // Record merge audit entry
        stores.audit_log.put({
          id: `audit_import_merge_${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'INTAKE',
          itemName: 'Database Merge Ingestion',
          quantityChange: newItemsToInsert.length,
          note: `Merged ${newItemsToInsert.length} new items from JSON backup into inventory`,
        });

        tx.oncomplete = () => {
          resolve({
            success: true,
            itemsCount: newItemsToInsert.length,
            message: `Merged ${newItemsToInsert.length} new items into inventory (${incomingItems.length - newItemsToInsert.length} duplicates skipped)`,
          });
        };

        tx.onerror = () => {
          resolve({
            success: false,
            itemsCount: 0,
            message: 'Database transaction error during merge import',
          });
        };
      });
    } catch (err: any) {
      return {
        success: false,
        itemsCount: 0,
        message: err?.message || 'Failed to parse JSON file',
      };
    }
  }

  async resetToDemoDefaults(): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(
        ['items', 'categories', 'locations', 'shelves', 'units', 'priorities', 'audit_log'],
        'readwrite'
      );
      tx.objectStore('items').clear();
      tx.objectStore('categories').clear();
      tx.objectStore('locations').clear();
      tx.objectStore('shelves').clear();
      tx.objectStore('units').clear();
      tx.objectStore('priorities').clear();
      tx.objectStore('audit_log').clear();

      tx.onerror = () => reject(tx.error);

      tx.oncomplete = async () => {
        try {
          await this.seedDefaults(db);
          resolve();
        } catch (err) {
          reject(err);
        }
      };
    });
  }

  /**
   * Clean Mode / Fresh Start
   * @param wipeMasterData
   * - false ("Wipe Items Only"): Clears items and audit_log; re-asserts default master taxonomy (categories, locations, shelves, units, priorities) for clean data entry.
   * - true ("Total Wipe"): Clears all 7 object stores to 0 records.
   */
  async cleanStorage(wipeMasterData: boolean = false): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const stores = [
        'items',
        'categories',
        'locations',
        'shelves',
        'units',
        'priorities',
        'audit_log',
      ];
      const tx = db.transaction(stores, 'readwrite');

      tx.objectStore('items').clear();
      tx.objectStore('audit_log').clear();

      if (wipeMasterData) {
        tx.objectStore('categories').clear();
        tx.objectStore('locations').clear();
        tx.objectStore('shelves').clear();
        tx.objectStore('units').clear();
        tx.objectStore('priorities').clear();
      } else {
        const catStore = tx.objectStore('categories');
        const locStore = tx.objectStore('locations');
        const shelfStore = tx.objectStore('shelves');
        const unitStore = tx.objectStore('units');
        const prioStore = tx.objectStore('priorities');

        DEFAULT_CATEGORIES.forEach((c) => catStore.put(c));
        DEFAULT_LOCATIONS.forEach((l) => locStore.put(l));
        DEFAULT_SHELVES.forEach((s) => shelfStore.put(s));
        DEFAULT_UNITS.forEach((u) => unitStore.put(u));
        DEFAULT_PRIORITIES.forEach((p) => prioStore.put(p));
      }

      tx.onerror = () => reject(tx.error);
      tx.oncomplete = () => resolve();
    });
  }

  // Compatibility & Helper API
  async initDatabase(): Promise<IDBDatabase> {
    return this.initDB();
  }

  async getAllItems(): Promise<InventoryItem[]> {
    return this.getItems();
  }

  async getAllMasterData(): Promise<{
    categories: MasterCategory[];
    locations: MasterLocation[];
    shelves: MasterShelf[];
    units: MasterUnit[];
    priorities: MasterPriority[];
  }> {
    const [categories, locations, shelves, units, priorities] = await Promise.all([
      this.getCategories(),
      this.getLocations(),
      this.getShelves(),
      this.getUnits(),
      this.getPriorities(),
    ]);
    return { categories, locations, shelves, units, priorities };
  }

  async getAuditLogs(): Promise<TransactionAuditEntry[]> {
    return this.getAuditLog();
  }

  async getItem(id: string): Promise<InventoryItem | undefined> {
    const items = await this.getItems();
    return items.find((i) => i.id === id);
  }

  async updateItemQuantity(id: string, qty: number): Promise<InventoryItem | null> {
    const item = await this.getItem(id);
    if (!item) return null;
    const updated: InventoryItem = {
      ...item,
      quantity: qty,
      status: qty <= 0 ? 'depleted' : qty < item.targetQuantity ? 'low_stock' : 'optimal',
      lastAudited: new Date().toISOString(),
    };
    await this.saveItem(updated);
    return updated;
  }

  async toggleShoppingList(id: string, inCart: boolean, qty: number): Promise<void> {
    const item = await this.getItem(id);
    if (!item) return;
    item.inShoppingList = inCart;
    item.shoppingQuantity = qty;
    await this.saveItem(item);
  }

  async exportDatabaseJSON(): Promise<string> {
    return this.exportDatabase();
  }

  async importDatabaseJSON(
    jsonStr: string,
    mode: 'replace' | 'merge' = 'replace'
  ): Promise<{ success: boolean; itemsCount: number; message: string }> {
    return this.importDatabase(jsonStr, mode);
  }

  async resetToFactoryDefaults(): Promise<void> {
    return this.resetToDemoDefaults();
  }

  async saveMasterCategory(c: MasterCategory): Promise<void> {
    return this.saveCategory(c);
  }

  async deleteMasterCategory(id: string): Promise<void> {
    return this.deleteCategory(id);
  }

  async saveMasterLocation(l: MasterLocation): Promise<void> {
    return this.saveLocation(l);
  }

  async deleteMasterLocation(id: string): Promise<void> {
    return this.deleteLocation(id);
  }

  async saveMasterShelf(s: MasterShelf): Promise<void> {
    return this.saveShelf(s);
  }

  async deleteMasterShelf(id: string): Promise<void> {
    return this.deleteShelf(id);
  }

  async saveMasterUnit(u: MasterUnit): Promise<void> {
    return this.saveUnit(u);
  }

  async deleteMasterUnit(id: string): Promise<void> {
    return this.deleteUnit(id);
  }

  async saveMasterPriority(p: MasterPriority): Promise<void> {
    return this.savePriority(p);
  }

  async deleteMasterPriority(id: string): Promise<void> {
    return this.deletePriority(id);
  }
}

export const dbService = new HomeShelfDatabase();
