'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import StatCard from '@/components/ui/StatCard';
import { TextInput, SelectInput, TextArea } from '@/components/ui/Input';

/* ─── Types ──────────────────────────────────────────────────────── */

interface Ingredient {
  item: string;
  qty: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  wastage: number;
}

interface SubRecipe {
  name: string;
  qty: number;
  unit: string;
  cost: number;
}

interface Recipe {
  id: number;
  name: string;
  category: string;
  sellingPrice: number;
  foodCost: number;
  foodCostPct: number;
  margin: number;
  menuCategory: 'Star' | 'Puzzle' | 'Plowhorse' | 'Dog';
  color: string;
  ingredients: Ingredient[];
  subRecipes: SubRecipe[];
  steps: string[];
  yieldQty: string;
  costPerUnit: number;
  allergens: string[];
}

/* ─── Mock Data ──────────────────────────────────────────────────── */

const mockRecipes: Recipe[] = [
  {
    id: 1,
    name: 'Butter Chicken',
    category: 'Main Course',
    sellingPrice: 380,
    foodCost: 114,
    foodCostPct: 30,
    margin: 266,
    menuCategory: 'Star',
    color: 'bg-orange-500',
    ingredients: [
      { item: 'Chicken Thigh', qty: 250, unit: 'g', unitCost: 0.28, totalCost: 70, wastage: 5 },
      { item: 'Butter', qty: 50, unit: 'g', unitCost: 0.42, totalCost: 21, wastage: 0 },
      { item: 'Tomato Puree', qty: 100, unit: 'ml', unitCost: 0.06, totalCost: 6, wastage: 2 },
      { item: 'Cream', qty: 40, unit: 'ml', unitCost: 0.18, totalCost: 7.2, wastage: 0 },
      { item: 'Kashmiri Chilli', qty: 10, unit: 'g', unitCost: 0.60, totalCost: 6, wastage: 0 },
      { item: 'Garam Masala', qty: 5, unit: 'g', unitCost: 0.76, totalCost: 3.8, wastage: 0 },
    ],
    subRecipes: [
      { name: 'Tandoori Marinade', qty: 60, unit: 'g', cost: 12 },
    ],
    steps: [
      'Marinate chicken in tandoori marinade for 4 hours.',
      'Grill or tandoor chicken until 80% cooked.',
      'Saut\u00e9 onion-tomato base with butter and spices.',
      'Add grilled chicken, simmer for 10 mins.',
      'Finish with cream and kasuri methi.',
    ],
    yieldQty: '1 portion (350g)',
    costPerUnit: 114,
    allergens: ['Dairy', 'Nuts'],
  },
  {
    id: 2,
    name: 'Hyderabadi Biryani',
    category: 'Rice & Biryani',
    sellingPrice: 320,
    foodCost: 96,
    foodCostPct: 30,
    margin: 224,
    menuCategory: 'Star',
    color: 'bg-yellow-600',
    ingredients: [
      { item: 'Basmati Rice', qty: 150, unit: 'g', unitCost: 0.12, totalCost: 18, wastage: 0 },
      { item: 'Chicken', qty: 200, unit: 'g', unitCost: 0.24, totalCost: 48, wastage: 5 },
      { item: 'Onion (fried)', qty: 80, unit: 'g', unitCost: 0.06, totalCost: 4.8, wastage: 8 },
      { item: 'Saffron', qty: 0.2, unit: 'g', unitCost: 45, totalCost: 9, wastage: 0 },
      { item: 'Yogurt', qty: 60, unit: 'g', unitCost: 0.08, totalCost: 4.8, wastage: 0 },
      { item: 'Biryani Masala', qty: 8, unit: 'g', unitCost: 1.40, totalCost: 11.2, wastage: 0 },
    ],
    subRecipes: [
      { name: 'Biryani Masala Paste', qty: 30, unit: 'g', cost: 8 },
    ],
    steps: [
      'Soak basmati rice for 30 mins, parboil with whole spices.',
      'Marinate chicken with yogurt, biryani masala, and fried onions.',
      'Layer chicken and rice in a heavy-bottomed pot.',
      'Add saffron milk, seal with dough, cook on dum for 25 mins.',
      'Rest for 5 mins, then gently mix and serve.',
    ],
    yieldQty: '1 portion (400g)',
    costPerUnit: 96,
    allergens: ['Dairy'],
  },
  {
    id: 3,
    name: 'Dal Makhani',
    category: 'Main Course',
    sellingPrice: 240,
    foodCost: 48,
    foodCostPct: 20,
    margin: 192,
    menuCategory: 'Star',
    color: 'bg-amber-800',
    ingredients: [
      { item: 'Black Urad Dal', qty: 80, unit: 'g', unitCost: 0.12, totalCost: 9.6, wastage: 0 },
      { item: 'Rajma', qty: 20, unit: 'g', unitCost: 0.10, totalCost: 2, wastage: 0 },
      { item: 'Butter', qty: 30, unit: 'g', unitCost: 0.42, totalCost: 12.6, wastage: 0 },
      { item: 'Cream', qty: 30, unit: 'ml', unitCost: 0.18, totalCost: 5.4, wastage: 0 },
      { item: 'Tomato Puree', qty: 80, unit: 'ml', unitCost: 0.06, totalCost: 4.8, wastage: 2 },
      { item: 'Spices Blend', qty: 10, unit: 'g', unitCost: 0.80, totalCost: 8, wastage: 0 },
    ],
    subRecipes: [],
    steps: [
      'Soak urad dal and rajma overnight.',
      'Pressure cook until soft and creamy.',
      'Prepare tomato-onion base with butter and spices.',
      'Combine dal with the base, simmer on low heat for 2 hours.',
      'Finish with cream and butter.',
    ],
    yieldQty: '1 portion (300g)',
    costPerUnit: 48,
    allergens: ['Dairy'],
  },
  {
    id: 4,
    name: 'Paneer Tikka',
    category: 'Starters',
    sellingPrice: 280,
    foodCost: 84,
    foodCostPct: 30,
    margin: 196,
    menuCategory: 'Puzzle',
    color: 'bg-red-500',
    ingredients: [
      { item: 'Paneer', qty: 200, unit: 'g', unitCost: 0.30, totalCost: 60, wastage: 3 },
      { item: 'Bell Peppers', qty: 60, unit: 'g', unitCost: 0.08, totalCost: 4.8, wastage: 10 },
      { item: 'Yogurt', qty: 50, unit: 'g', unitCost: 0.08, totalCost: 4, wastage: 0 },
      { item: 'Tikka Masala', qty: 10, unit: 'g', unitCost: 0.90, totalCost: 9, wastage: 0 },
      { item: 'Mustard Oil', qty: 15, unit: 'ml', unitCost: 0.14, totalCost: 2.1, wastage: 0 },
    ],
    subRecipes: [
      { name: 'Tikka Marinade', qty: 40, unit: 'g', cost: 6 },
    ],
    steps: [
      'Cut paneer into 1-inch cubes.',
      'Prepare tikka marinade with yogurt, mustard oil, and spices.',
      'Marinate paneer and vegetables for 2 hours.',
      'Skewer and grill in tandoor at high heat for 8-10 mins.',
      'Serve with mint chutney and onion rings.',
    ],
    yieldQty: '1 portion (280g)',
    costPerUnit: 84,
    allergens: ['Dairy'],
  },
  {
    id: 5,
    name: 'Chicken 65',
    category: 'Starters',
    sellingPrice: 260,
    foodCost: 91,
    foodCostPct: 35,
    margin: 169,
    menuCategory: 'Plowhorse',
    color: 'bg-red-700',
    ingredients: [
      { item: 'Chicken Breast', qty: 200, unit: 'g', unitCost: 0.26, totalCost: 52, wastage: 8 },
      { item: 'Corn Flour', qty: 30, unit: 'g', unitCost: 0.06, totalCost: 1.8, wastage: 0 },
      { item: 'Rice Flour', qty: 20, unit: 'g', unitCost: 0.05, totalCost: 1, wastage: 0 },
      { item: 'Curry Leaves', qty: 5, unit: 'g', unitCost: 0.40, totalCost: 2, wastage: 0 },
      { item: 'Vegetable Oil', qty: 150, unit: 'ml', unitCost: 0.11, totalCost: 16.5, wastage: 0 },
      { item: 'Spice Mix', qty: 15, unit: 'g', unitCost: 1.18, totalCost: 17.7, wastage: 0 },
    ],
    subRecipes: [],
    steps: [
      'Cut chicken into bite-sized pieces.',
      'Marinate with ginger-garlic paste, chilli powder, and yogurt for 1 hour.',
      'Coat in corn flour and rice flour mixture.',
      'Deep fry at 180\u00b0C until golden and crispy.',
      'Temper with curry leaves, green chillies, and garlic.',
    ],
    yieldQty: '1 portion (250g)',
    costPerUnit: 91,
    allergens: ['Gluten'],
  },
  {
    id: 6,
    name: 'Gulab Jamun',
    category: 'Desserts',
    sellingPrice: 120,
    foodCost: 24,
    foodCostPct: 20,
    margin: 96,
    menuCategory: 'Star',
    color: 'bg-pink-600',
    ingredients: [
      { item: 'Khoya', qty: 50, unit: 'g', unitCost: 0.20, totalCost: 10, wastage: 0 },
      { item: 'Maida', qty: 15, unit: 'g', unitCost: 0.04, totalCost: 0.6, wastage: 0 },
      { item: 'Sugar', qty: 60, unit: 'g', unitCost: 0.04, totalCost: 2.4, wastage: 0 },
      { item: 'Cardamom', qty: 2, unit: 'g', unitCost: 2.00, totalCost: 4, wastage: 0 },
      { item: 'Ghee (frying)', qty: 40, unit: 'ml', unitCost: 0.46, totalCost: 18.4, wastage: 0 },
    ],
    subRecipes: [
      { name: 'Sugar Syrup', qty: 100, unit: 'ml', cost: 3 },
    ],
    steps: [
      'Knead khoya with maida and a pinch of baking soda.',
      'Shape into smooth, crack-free balls.',
      'Fry on low heat in ghee until deep brown.',
      'Prepare sugar syrup with cardamom and rose water.',
      'Soak fried balls in warm syrup for at least 2 hours.',
    ],
    yieldQty: '2 pieces per portion',
    costPerUnit: 24,
    allergens: ['Dairy', 'Gluten'],
  },
  {
    id: 7,
    name: 'Masala Dosa',
    category: 'Starters',
    sellingPrice: 180,
    foodCost: 63,
    foodCostPct: 35,
    margin: 117,
    menuCategory: 'Plowhorse',
    color: 'bg-yellow-500',
    ingredients: [
      { item: 'Dosa Batter', qty: 120, unit: 'g', unitCost: 0.06, totalCost: 7.2, wastage: 5 },
      { item: 'Potato', qty: 150, unit: 'g', unitCost: 0.03, totalCost: 4.5, wastage: 10 },
      { item: 'Onion', qty: 40, unit: 'g', unitCost: 0.03, totalCost: 1.2, wastage: 8 },
      { item: 'Mustard Seeds', qty: 3, unit: 'g', unitCost: 0.30, totalCost: 0.9, wastage: 0 },
      { item: 'Oil', qty: 20, unit: 'ml', unitCost: 0.11, totalCost: 2.2, wastage: 0 },
    ],
    subRecipes: [
      { name: 'Coconut Chutney', qty: 40, unit: 'g', cost: 5 },
      { name: 'Sambar', qty: 100, unit: 'ml', cost: 8 },
    ],
    steps: [
      'Prepare potato masala with boiled potatoes, onions, and tempering.',
      'Heat dosa tawa and spread batter into thin crepe.',
      'Drizzle oil and cook until crispy and golden.',
      'Place potato masala filling and fold.',
      'Serve with coconut chutney and sambar.',
    ],
    yieldQty: '1 dosa with sides',
    costPerUnit: 63,
    allergens: ['None'],
  },
  {
    id: 8,
    name: 'Fish Curry',
    category: 'Main Course',
    sellingPrice: 350,
    foodCost: 140,
    foodCostPct: 40,
    margin: 210,
    menuCategory: 'Dog',
    color: 'bg-teal-600',
    ingredients: [
      { item: 'Fish (Surmai)', qty: 200, unit: 'g', unitCost: 0.50, totalCost: 100, wastage: 12 },
      { item: 'Coconut Milk', qty: 100, unit: 'ml', unitCost: 0.14, totalCost: 14, wastage: 0 },
      { item: 'Tamarind Paste', qty: 15, unit: 'g', unitCost: 0.20, totalCost: 3, wastage: 0 },
      { item: 'Kokum', qty: 5, unit: 'g', unitCost: 0.60, totalCost: 3, wastage: 0 },
      { item: 'Spice Paste', qty: 20, unit: 'g', unitCost: 0.80, totalCost: 16, wastage: 0 },
    ],
    subRecipes: [
      { name: 'Goan Spice Paste', qty: 20, unit: 'g', cost: 6 },
    ],
    steps: [
      'Clean and cut fish into steaks.',
      'Prepare Goan spice paste with dried chillies, coriander, and coconut.',
      'Saut\u00e9 paste with oil, add coconut milk and tamarind.',
      'Add fish pieces, cook gently for 8-10 mins.',
      'Finish with kokum and fresh coriander.',
    ],
    yieldQty: '1 portion (350g)',
    costPerUnit: 140,
    allergens: ['Fish', 'Coconut'],
  },
  {
    id: 9,
    name: 'Veg Manchurian',
    category: 'Starters',
    sellingPrice: 220,
    foodCost: 55,
    foodCostPct: 25,
    margin: 165,
    menuCategory: 'Puzzle',
    color: 'bg-green-600',
    ingredients: [
      { item: 'Cabbage (grated)', qty: 100, unit: 'g', unitCost: 0.03, totalCost: 3, wastage: 12 },
      { item: 'Carrot (grated)', qty: 50, unit: 'g', unitCost: 0.04, totalCost: 2, wastage: 10 },
      { item: 'Corn Flour', qty: 40, unit: 'g', unitCost: 0.06, totalCost: 2.4, wastage: 0 },
      { item: 'Soy Sauce', qty: 15, unit: 'ml', unitCost: 0.20, totalCost: 3, wastage: 0 },
      { item: 'Vegetable Oil', qty: 100, unit: 'ml', unitCost: 0.11, totalCost: 11, wastage: 0 },
      { item: 'Spring Onion', qty: 20, unit: 'g', unitCost: 0.10, totalCost: 2, wastage: 5 },
    ],
    subRecipes: [
      { name: 'Manchurian Sauce', qty: 60, unit: 'ml', cost: 8 },
    ],
    steps: [
      'Grate cabbage and carrot finely, squeeze out excess water.',
      'Mix with corn flour, maida, and seasoning to form balls.',
      'Deep fry until golden and crispy.',
      'Prepare Manchurian sauce with soy sauce, chilli sauce, and vinegar.',
      'Toss fried balls in the sauce, garnish with spring onions.',
    ],
    yieldQty: '1 portion (220g)',
    costPerUnit: 55,
    allergens: ['Gluten', 'Soy'],
  },
  {
    id: 10,
    name: 'Tandoori Roti',
    category: 'Breads',
    sellingPrice: 40,
    foodCost: 8,
    foodCostPct: 20,
    margin: 32,
    menuCategory: 'Plowhorse',
    color: 'bg-amber-600',
    ingredients: [
      { item: 'Whole Wheat Flour', qty: 60, unit: 'g', unitCost: 0.04, totalCost: 2.4, wastage: 0 },
      { item: 'Salt', qty: 1, unit: 'g', unitCost: 0.02, totalCost: 0.02, wastage: 0 },
      { item: 'Water', qty: 35, unit: 'ml', unitCost: 0, totalCost: 0, wastage: 0 },
      { item: 'Ghee', qty: 5, unit: 'g', unitCost: 0.46, totalCost: 2.3, wastage: 0 },
    ],
    subRecipes: [],
    steps: [
      'Mix whole wheat flour with salt and water to form soft dough.',
      'Rest dough for 20 minutes.',
      'Divide into balls, roll into circles.',
      'Slap onto tandoor wall, cook until puffed and charred.',
      'Brush with ghee and serve hot.',
    ],
    yieldQty: '1 roti',
    costPerUnit: 8,
    allergens: ['Gluten'],
  },
];

/* ─── Constants ──────────────────────────────────────────────────── */

const CATEGORY_OPTIONS = [
  { value: 'Starters', label: 'Starters' },
  { value: 'Main Course', label: 'Main Course' },
  { value: 'Breads', label: 'Breads' },
  { value: 'Rice & Biryani', label: 'Rice & Biryani' },
  { value: 'Desserts', label: 'Desserts' },
  { value: 'Beverages', label: 'Beverages' },
  { value: 'Sides', label: 'Sides' },
];

const ALLERGEN_OPTIONS = [
  'Dairy', 'Gluten', 'Nuts', 'Soy', 'Fish', 'Shellfish', 'Eggs', 'Coconut', 'Sesame', 'None',
];

const UNIT_OPTIONS = [
  { value: 'g', label: 'g' },
  { value: 'kg', label: 'kg' },
  { value: 'ml', label: 'ml' },
  { value: 'L', label: 'L' },
  { value: 'pcs', label: 'pcs' },
  { value: 'tbsp', label: 'tbsp' },
  { value: 'tsp', label: 'tsp' },
];

const menuCategoryConfig: Record<string, { badge: 'success' | 'warning' | 'info' | 'danger'; label: string }> = {
  Star: { badge: 'success', label: 'Star' },
  Puzzle: { badge: 'warning', label: 'Puzzle' },
  Plowhorse: { badge: 'info', label: 'Plowhorse' },
  Dog: { badge: 'danger', label: 'Dog' },
};

/* ─── Helpers ────────────────────────────────────────────────────── */

function formatCurrency(amount: number): string {
  return '\u20b9' + amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

/* ─── Page Component ─────────────────────────────────────────────── */

export default function RecipeCostingPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [recipes, setRecipes] = useState<Recipe[]>(mockRecipes);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const tabs = [
    { id: 'all', label: 'All Recipes', count: recipes.length },
    { id: 'matrix', label: 'Menu Engineering Matrix' },
    { id: 'sub', label: 'Sub-Recipes' },
  ];

  const filteredRecipes = recipes.filter((r: Recipe) => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || r.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stars = recipes.filter((r: Recipe) => r.menuCategory === 'Star');
  const puzzles = recipes.filter((r: Recipe) => r.menuCategory === 'Puzzle');
  const plowhorses = recipes.filter((r: Recipe) => r.menuCategory === 'Plowhorse');
  const dogs = recipes.filter((r: Recipe) => r.menuCategory === 'Dog');

  // Collect unique sub-recipes from all recipes
  const allSubRecipes = recipes.flatMap((r: Recipe) =>
    r.subRecipes.map((sr: SubRecipe) => ({ ...sr, parentRecipe: r.name }))
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recipe Costing & Menu Engineering</h1>
          <p className="text-gray-500 mt-1">Manage recipes, costs, and menu performance analysis</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="mt-4 sm:mt-0">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Recipe
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Recipes"
          value={24}
          subtitle="Across all categories"
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          }
        />
        <StatCard
          title="Avg Food Cost %"
          value="32.5%"
          subtitle="Target: < 35%"
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          }
        />
        <StatCard
          title="Stars"
          value={8}
          subtitle="High profit, high popularity"
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          }
        />
        <StatCard
          title="Dogs"
          value={3}
          subtitle="Review or remove"
          color="red"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          }
        />
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-6">
        {/* ── All Recipes Tab ─────────────────────────────────────── */}
        {activeTab === 'all' && (
          <div>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.5 10.5a7.5 7.5 0 0013.15 6.15z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    placeholder="Search recipes..."
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="w-48">
                <select
                  value={categoryFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategoryFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">All Categories</option>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Recipe Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredRecipes.map((recipe: Recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onClick={() => setSelectedRecipe(recipe)}
                />
              ))}
            </div>

            {filteredRecipes.length === 0 && (
              <div className="text-center py-16">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <p className="font-medium text-gray-600">No recipes found</p>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        )}

        {/* ── Menu Engineering Matrix Tab ─────────────────────────── */}
        {activeTab === 'matrix' && (
          <MenuEngineeringMatrix
            stars={stars}
            puzzles={puzzles}
            plowhorses={plowhorses}
            dogs={dogs}
            onRecipeClick={setSelectedRecipe}
          />
        )}

        {/* ── Sub-Recipes Tab ─────────────────────────────────────── */}
        {activeTab === 'sub' && (
          <SubRecipesTab subRecipes={allSubRecipes} />
        )}
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}

      {/* Add Recipe Modal */}
      {showAddModal && (
        <AddRecipeModal
          onClose={() => setShowAddModal(false)}
          onSave={(newRecipe: Recipe) => {
            setRecipes((prev: Recipe[]) => [...prev, newRecipe]);
            setShowAddModal(false);
          }}
          nextId={recipes.length + 1}
        />
      )}
    </div>
  );
}

/* ─── Recipe Card ────────────────────────────────────────────────── */

function RecipeCard({ recipe, onClick }: { recipe: Recipe; onClick: () => void }) {
  const config = menuCategoryConfig[recipe.menuCategory];
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden"
    >
      {/* Photo placeholder */}
      <div className={`${recipe.color} h-32 flex items-center justify-center relative`}>
        <span className="text-4xl font-bold text-white/80">{recipe.name.charAt(0)}</span>
        <div className="absolute top-3 right-3">
          <Badge variant={config.badge}>{config.label}</Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
              {recipe.name}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">{recipe.category}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <p className="text-xs text-gray-500">Selling Price</p>
            <p className="text-sm font-semibold text-gray-900">{formatCurrency(recipe.sellingPrice)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Food Cost</p>
            <p className="text-sm font-semibold text-gray-900">{formatCurrency(recipe.foodCost)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Food Cost %</p>
            <p className={`text-sm font-semibold ${recipe.foodCostPct > 35 ? 'text-red-600' : recipe.foodCostPct > 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {recipe.foodCostPct}%
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Margin</p>
            <p className="text-sm font-semibold text-emerald-600">{formatCurrency(recipe.margin)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Recipe Detail Modal ────────────────────────────────────────── */

function RecipeDetailModal({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) {
  const config = menuCategoryConfig[recipe.menuCategory];
  const ingredientTotal = recipe.ingredients.reduce((sum, ing) => sum + ing.totalCost, 0);
  const subRecipeTotal = recipe.subRecipes.reduce((sum, sr) => sum + sr.cost, 0);

  return (
    <Modal isOpen={true} onClose={onClose} title={recipe.name} size="xl">
      <div className="space-y-6">
        {/* Header Info */}
        <div className="flex items-start gap-4">
          <div className={`${recipe.color} w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0`}>
            <span className="text-3xl font-bold text-white/80">{recipe.name.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg font-bold text-gray-900">{recipe.name}</h3>
              <Badge variant={config.badge}>{config.label}</Badge>
            </div>
            <p className="text-sm text-gray-500">{recipe.category}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {recipe.allergens.map((a) => (
                <span
                  key={a}
                  className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                    a === 'None'
                      ? 'bg-gray-100 text-gray-600'
                      : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200'
                  }`}
                >
                  {a === 'None' ? 'No Allergens' : a}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Cost Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gray-50 rounded-lg px-4 py-3 text-center">
            <p className="text-xs text-gray-500">Yield</p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">{recipe.yieldQty}</p>
          </div>
          <div className="bg-gray-50 rounded-lg px-4 py-3 text-center">
            <p className="text-xs text-gray-500">Cost / Unit</p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatCurrency(recipe.costPerUnit)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg px-4 py-3 text-center">
            <p className="text-xs text-gray-500">Selling Price</p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatCurrency(recipe.sellingPrice)}</p>
          </div>
          <div className={`rounded-lg px-4 py-3 text-center ${recipe.foodCostPct > 35 ? 'bg-red-50' : recipe.foodCostPct > 30 ? 'bg-amber-50' : 'bg-emerald-50'}`}>
            <p className="text-xs text-gray-500">Food Cost %</p>
            <p className={`text-sm font-semibold mt-0.5 ${recipe.foodCostPct > 35 ? 'text-red-700' : recipe.foodCostPct > 30 ? 'text-amber-700' : 'text-emerald-700'}`}>
              {recipe.foodCostPct}%
            </p>
          </div>
        </div>

        {/* Ingredients Table */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Ingredients</h4>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Item</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Qty</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Unit</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Unit Cost</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Total Cost</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Wastage %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {recipe.ingredients.map((ing, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-sm text-gray-900 font-medium">{ing.item}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-700 text-right">{ing.qty}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-700">{ing.unit}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-700 text-right font-mono">{formatCurrency(ing.unitCost)}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-900 text-right font-mono font-medium">{formatCurrency(ing.totalCost)}</td>
                    <td className="px-4 py-2.5 text-sm text-right">
                      {ing.wastage > 0 ? (
                        <span className="text-amber-600">{ing.wastage}%</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan={4} className="px-4 py-2.5 text-sm text-gray-700 text-right">Ingredients Subtotal</td>
                  <td className="px-4 py-2.5 text-sm text-gray-900 text-right font-mono">{formatCurrency(ingredientTotal)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Sub-Recipes */}
        {recipe.subRecipes.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Sub-Recipes Used</h4>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Sub-Recipe</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Qty</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Unit</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {recipe.subRecipes.map((sr, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-sm text-gray-900 font-medium">{sr.name}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-700 text-right">{sr.qty}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-700">{sr.unit}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-900 text-right font-mono font-medium">{formatCurrency(sr.cost)}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-semibold">
                    <td colSpan={3} className="px-4 py-2.5 text-sm text-gray-700 text-right">Sub-Recipes Subtotal</td>
                    <td className="px-4 py-2.5 text-sm text-gray-900 text-right font-mono">{formatCurrency(subRecipeTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Total Cost Summary */}
        <div className="bg-indigo-50 rounded-lg px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-indigo-800">Total Recipe Cost</span>
          <span className="text-lg font-bold text-indigo-900 font-mono">{formatCurrency(ingredientTotal + subRecipeTotal)}</span>
        </div>

        {/* Preparation Steps */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Preparation Steps</h4>
          <ol className="space-y-2">
            {recipe.steps.map((step, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full flex items-center justify-center mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-sm text-gray-700 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Menu Engineering Matrix ────────────────────────────────────── */

function MenuEngineeringMatrix({
  stars,
  puzzles,
  plowhorses,
  dogs,
  onRecipeClick,
}: {
  stars: Recipe[];
  puzzles: Recipe[];
  plowhorses: Recipe[];
  dogs: Recipe[];
  onRecipeClick: (r: Recipe) => void;
}) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Menu Engineering Matrix</h2>
        <p className="text-sm text-gray-500 mt-1">
          Analyze menu items by profitability and popularity to optimize your menu mix
        </p>
      </div>

      {/* Axis Labels */}
      <div className="relative">
        {/* Y-axis label */}
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">
          Popularity
        </div>

        {/* X-axis label */}
        <div className="text-center mt-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Profitability
        </div>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-2 gap-4 ml-6">
          {/* Top-Left: Plowhorses (High Pop, Low Profit) */}
          <QuadrantCard
            title="Plowhorses"
            subtitle="High Popularity, Low Profitability"
            description="Popular items with low margins. Increase prices or reduce costs."
            color="blue"
            borderColor="border-blue-300"
            bgColor="bg-blue-50"
            headerBg="bg-blue-100"
            recipes={plowhorses}
            onRecipeClick={onRecipeClick}
          />

          {/* Top-Right: Stars (High Pop, High Profit) */}
          <QuadrantCard
            title="Stars"
            subtitle="High Popularity, High Profitability"
            description="Best performers. Maintain quality and prominence on menu."
            color="green"
            borderColor="border-emerald-300"
            bgColor="bg-emerald-50"
            headerBg="bg-emerald-100"
            recipes={stars}
            onRecipeClick={onRecipeClick}
          />

          {/* Bottom-Left: Dogs (Low Pop, Low Profit) */}
          <QuadrantCard
            title="Dogs"
            subtitle="Low Popularity, Low Profitability"
            description="Consider removing or completely reworking these items."
            color="red"
            borderColor="border-red-300"
            bgColor="bg-red-50"
            headerBg="bg-red-100"
            recipes={dogs}
            onRecipeClick={onRecipeClick}
          />

          {/* Bottom-Right: Puzzles (Low Pop, High Profit) */}
          <QuadrantCard
            title="Puzzles"
            subtitle="Low Popularity, High Profitability"
            description="Profitable but underperforming. Improve visibility and marketing."
            color="yellow"
            borderColor="border-amber-300"
            bgColor="bg-amber-50"
            headerBg="bg-amber-100"
            recipes={puzzles}
            onRecipeClick={onRecipeClick}
          />
        </div>
      </div>
    </div>
  );
}

function QuadrantCard({
  title,
  subtitle,
  description,
  borderColor,
  bgColor,
  headerBg,
  recipes,
  onRecipeClick,
}: {
  title: string;
  subtitle: string;
  description: string;
  color: string;
  borderColor: string;
  bgColor: string;
  headerBg: string;
  recipes: Recipe[];
  onRecipeClick: (r: Recipe) => void;
}) {
  return (
    <div className={`rounded-xl border-2 ${borderColor} ${bgColor} overflow-hidden`}>
      <div className={`${headerBg} px-4 py-3`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-600 mt-0.5">{subtitle}</p>
          </div>
          <span className="text-2xl font-bold text-gray-700">{recipes.length}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
      <div className="p-3 space-y-2">
        {recipes.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No items in this quadrant</p>
        ) : (
          recipes.map((r) => (
            <div
              key={r.id}
              onClick={() => onRecipeClick(r)}
              className="flex items-center justify-between bg-white rounded-lg px-3 py-2.5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className={`${r.color} w-8 h-8 rounded-lg flex items-center justify-center`}>
                  <span className="text-sm font-bold text-white/90">{r.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{r.name}</p>
                  <p className="text-xs text-gray-500">{r.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{formatCurrency(r.sellingPrice)}</p>
                <p className={`text-xs font-medium ${r.foodCostPct > 35 ? 'text-red-600' : r.foodCostPct > 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {r.foodCostPct}% cost
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ─── Sub-Recipes Tab ────────────────────────────────────────────── */

function SubRecipesTab({ subRecipes }: { subRecipes: Array<{ name: string; qty: number; unit: string; cost: number; parentRecipe: string }> }) {
  // Group by sub-recipe name
  const grouped = subRecipes.reduce<Record<string, Array<{ parentRecipe: string; qty: number; unit: string; cost: number }>>>((acc, sr) => {
    if (!acc[sr.name]) acc[sr.name] = [];
    acc[sr.name].push({ parentRecipe: sr.parentRecipe, qty: sr.qty, unit: sr.unit, cost: sr.cost });
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Sub-Recipes</h2>
        <p className="text-sm text-gray-500 mt-1">
          Reusable recipe components used across multiple dishes
        </p>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16">
          <p className="font-medium text-gray-600">No sub-recipes found</p>
          <p className="text-sm text-gray-500 mt-1">Sub-recipes will appear here when added to recipes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(grouped).map(([name, usages]) => (
            <div key={name} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{name}</h3>
                  <p className="text-xs text-gray-500">Used in {usages.length} recipe{usages.length > 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {usages.map((u, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-gray-700">{u.parentRecipe}</span>
                    <span className="text-gray-500 font-mono text-xs">
                      {u.qty}{u.unit} = {formatCurrency(u.cost)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Add Recipe Modal ───────────────────────────────────────────── */

interface NewIngredient {
  item: string;
  qty: string;
  unit: string;
  unitCost: string;
}

function AddRecipeModal({
  onClose,
  onSave,
  nextId,
}: {
  onClose: () => void;
  onSave: (recipe: Recipe) => void;
  nextId: number;
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [steps, setSteps] = useState('');
  const [yieldQty, setYieldQty] = useState('');
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<NewIngredient[]>([
    { item: '', qty: '', unit: 'g', unitCost: '' },
  ]);

  const addIngredientRow = () => {
    setIngredients((prev: NewIngredient[]) => [...prev, { item: '', qty: '', unit: 'g', unitCost: '' }]);
  };

  const removeIngredientRow = (index: number) => {
    setIngredients((prev: NewIngredient[]) => prev.filter((_: NewIngredient, i: number) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof NewIngredient, value: string) => {
    setIngredients((prev: NewIngredient[]) =>
      prev.map((ing: NewIngredient, i: number) => (i === index ? { ...ing, [field]: value } : ing))
    );
  };

  const toggleAllergen = (allergen: string) => {
    setSelectedAllergens((prev: string[]) =>
      prev.includes(allergen)
        ? prev.filter((a: string) => a !== allergen)
        : [...prev, allergen]
    );
  };

  const totalCost = ingredients.reduce((sum, ing) => {
    const qty = parseFloat(ing.qty) || 0;
    const cost = parseFloat(ing.unitCost) || 0;
    return sum + qty * cost;
  }, 0);

  const sp = parseFloat(sellingPrice) || 0;
  const foodCostPct = sp > 0 ? (totalCost / sp) * 100 : 0;

  const handleSave = () => {
    if (!name || !category || !sellingPrice) return;

    const colors = ['bg-orange-500', 'bg-yellow-600', 'bg-amber-800', 'bg-red-500', 'bg-red-700', 'bg-pink-600', 'bg-yellow-500', 'bg-teal-600', 'bg-green-600', 'bg-amber-600', 'bg-blue-600', 'bg-indigo-500'];
    const randomColor = colors[nextId % colors.length];

    let menuCat: Recipe['menuCategory'] = 'Puzzle';
    if (foodCostPct <= 30) menuCat = 'Star';
    else if (foodCostPct <= 35) menuCat = 'Plowhorse';
    else if (foodCostPct > 35) menuCat = 'Dog';

    const newRecipe: Recipe = {
      id: nextId,
      name,
      category,
      sellingPrice: sp,
      foodCost: Math.round(totalCost * 100) / 100,
      foodCostPct: Math.round(foodCostPct),
      margin: Math.round((sp - totalCost) * 100) / 100,
      menuCategory: menuCat,
      color: randomColor,
      ingredients: ingredients
        .filter((ing) => ing.item)
        .map((ing) => ({
          item: ing.item,
          qty: parseFloat(ing.qty) || 0,
          unit: ing.unit,
          unitCost: parseFloat(ing.unitCost) || 0,
          totalCost: (parseFloat(ing.qty) || 0) * (parseFloat(ing.unitCost) || 0),
          wastage: 0,
        })),
      subRecipes: [],
      steps: steps.split('\n').filter((s) => s.trim()),
      yieldQty: yieldQty || '1 portion',
      costPerUnit: Math.round(totalCost * 100) / 100,
      allergens: selectedAllergens.length > 0 ? selectedAllergens : ['None'],
    };

    onSave(newRecipe);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Add New Recipe" size="xl">
      <div className="space-y-5">
        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput
            label="Recipe Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Chicken Tikka Masala"
            required
          />
          <SelectInput
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={CATEGORY_OPTIONS}
            placeholder="Select category"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput
            label="Selling Price"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            placeholder="e.g., 350"
            type="number"
            required
          />
          <TextInput
            label="Yield Quantity"
            value={yieldQty}
            onChange={(e) => setYieldQty(e.target.value)}
            placeholder="e.g., 1 portion (350g)"
          />
        </div>

        {/* Ingredients */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700">Ingredients</h4>
            <Button size="sm" variant="secondary" onClick={addIngredientRow}>
              <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Row
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Item</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 w-20">Qty</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 w-20">Unit</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 w-24">Unit Cost</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 w-24">Total</th>
                  <th className="px-3 py-2 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {ingredients.map((ing, idx) => {
                  const rowTotal = (parseFloat(ing.qty) || 0) * (parseFloat(ing.unitCost) || 0);
                  return (
                    <tr key={idx}>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={ing.item}
                          onChange={(e) => updateIngredient(idx, 'item', e.target.value)}
                          placeholder="Item name"
                          className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={ing.qty}
                          onChange={(e) => updateIngredient(idx, 'qty', e.target.value)}
                          placeholder="0"
                          className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={ing.unit}
                          onChange={(e) => updateIngredient(idx, 'unit', e.target.value)}
                          className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                        >
                          {UNIT_OPTIONS.map((u) => (
                            <option key={u.value} value={u.value}>{u.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="0.01"
                          value={ing.unitCost}
                          onChange={(e) => updateIngredient(idx, 'unitCost', e.target.value)}
                          placeholder="0.00"
                          className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-3 py-2 text-right text-sm font-mono text-gray-700">
                        {formatCurrency(rowTotal)}
                      </td>
                      <td className="px-3 py-2">
                        {ingredients.length > 1 && (
                          <button
                            onClick={() => removeIngredientRow(idx)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cost Summary */}
          <div className="flex items-center justify-between mt-3 bg-gray-50 rounded-lg px-4 py-2.5">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-xs text-gray-500">Total Cost: </span>
                <span className="text-sm font-semibold text-gray-900 font-mono">{formatCurrency(totalCost)}</span>
              </div>
              {sp > 0 && (
                <div>
                  <span className="text-xs text-gray-500">Food Cost %: </span>
                  <span className={`text-sm font-semibold font-mono ${foodCostPct > 35 ? 'text-red-600' : foodCostPct > 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {foodCostPct.toFixed(1)}%
                  </span>
                </div>
              )}
              {sp > 0 && (
                <div>
                  <span className="text-xs text-gray-500">Margin: </span>
                  <span className="text-sm font-semibold text-emerald-600 font-mono">{formatCurrency(sp - totalCost)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preparation Steps */}
        <TextArea
          label="Preparation Steps"
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          placeholder="Enter each step on a new line..."
          rows={4}
        />

        {/* Allergens */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Allergens</label>
          <div className="flex flex-wrap gap-2">
            {ALLERGEN_OPTIONS.map((allergen) => (
              <button
                key={allergen}
                type="button"
                onClick={() => toggleAllergen(allergen)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                  selectedAllergens.includes(allergen)
                    ? 'bg-red-50 text-red-700 border-red-300 ring-1 ring-red-200'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {allergen}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name || !category || !sellingPrice}
          >
            Save Recipe
          </Button>
        </div>
      </div>
    </Modal>
  );
}
