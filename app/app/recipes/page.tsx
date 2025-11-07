'use client'; // This page needs state and event handlers

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Pencil, ClipboardPlus, BookOpen } from 'lucide-react';

// --- Define the data types ---
interface Ingredient {
  id: string;
  name: string;
  quantity: string;
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  ingredients: Ingredient[];
}

// --- Mock Data (Backend replacement) ---
const MOCK_RECIPES: Recipe[] = [
  {
    id: 'r1',
    name: 'Classic Chicken Soup',
    description: 'A comforting and nourishing classic, perfect for a cold day.',
    imageUrl: 'https://placehold.co/600x400/a7f3d0/34495e?text=Chicken+Soup',
    ingredients: [
      { id: 'i1', name: 'Chicken Breast', quantity: '2 lbs' },
      { id: 'i2', name: 'Carrots', quantity: '3' },
      { id: 'i3', name: 'Celery', quantity: '3 stalks' },
    ],
  },
  {
    id: 'r2',
    name: 'Spaghetti Carbonara',
    description: 'A quick and delicious Italian pasta dish for any night.',
    imageUrl: 'https://placehold.co/600x400/fde68a/34495e?text=Carbonara',
    ingredients: [
      { id: 'i4', name: 'Spaghetti', quantity: '400g' },
      { id: 'i5', name: 'Guanciale', quantity: '150g' },
      { id: 'i6', name: 'Pecorino Cheese', quantity: '1 cup' },
      { id: 'i7', name: 'Eggs', quantity: '3' },
    ],
  },
  {
    id: 'r3',
    name: 'Avocado Toast',
    description: 'The quintessential modern breakfast. Simple and satisfying.',
    imageUrl: 'https://placehold.co/600x400/bef264/34495e?text=Avocado+Toast',
    ingredients: [
      { id: 'i8', name: 'Sourdough Bread', quantity: '2 slices' },
      { id: 'i9', name: 'Avocado', quantity: '1' },
      { id: 'i10', name: 'Red Pepper Flakes', quantity: '1 tsp' },
    ],
  },
];

// --- Main Page Component ---
export default function MyRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>(MOCK_RECIPES);
  const router = useRouter();

  /**
   * Handles adding all ingredients from a recipe to the main grocery list.
   * (This would call your backend in a real app)
   */
  const handleAddToList = (recipe: Recipe) => {
    // 1. Get ingredients from the recipe
    const itemsToAdd = recipe.ingredients
      .map((ing) => `${ing.name} (${ing.quantity})`)
      .join('\n');

    // 2. Mock the "add to list" functionality
    alert(`The following items would be added to your 'Weekly Shop':\n${itemsToAdd}`);

    // 3. (Future) Call your backend API:
    // await fetch(`/api/lists/YOUR_ACTIVE_LIST_ID/items`, {
    //   method: 'POST',
    //   body: JSON.stringify(recipe.ingredients.map(ing => ({ name: ing.name, quantity: ing.quantity })))
    // });
  };

  /**
   * Handles deleting a recipe.
   */
  const handleDelete = (recipeId: string) => {
    if (
      window.confirm('Are you sure you want to delete this recipe?')
    ) {
      setRecipes(recipes.filter((r) => r.id !== recipeId));
      // (Future) Call backend:
      // await fetch(`/api/recipes/${recipeId}`, { method: 'DELETE' });
    }
  };

  /**
   * Handles navigating to the edit page.
   */
  const handleEdit = (recipeId: string) => {
    router.push(`/app/recipes/edit/${recipeId}`); // Assumes an [id] route
  };

  return (
    <div className="w-full">
      {/* 1. Page Header and "New Recipe" Button */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-extrabold text-gray-800">My Recipes</h1>
        
        <Link
          href="/app/recipes/new"
          className="flex items-center justify-center gap-2 px-5 py-3 font-semibold text-white 
                     bg-green-600 rounded-lg shadow-md hover:bg-green-700 
                     focus:outline-none focus:ring-2 focus:ring-green-500 
                     focus:ring-offset-2 transition-all"
        >
          <Plus className="h-5 w-5" />
          New Recipe
        </Link>
      </div>

      {/* 2. Recipe Grid or Empty State */}
      {recipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* --- Recipe Card (Inlined) --- */}
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="flex flex-col bg-white rounded-2xl shadow-lg 
                         overflow-hidden transition-all duration-300 hover:shadow-xl"
            >
              {/* Card Image */}
              <img
                src={recipe.imageUrl}
                alt={recipe.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/e0e0e0/7f8c8d?text=Image+Error';
                }}
              />
              
              {/* Card Content */}
              <div className="p-6 flex-1">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {recipe.name}
                </h3>
                <p className="text-gray-600 text-base line-clamp-3">
                  {recipe.description}
                </p>
              </div>

              {/* Card Actions */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 
                            flex items-center justify-between gap-2">
                
                {/* Primary Action */}
                <button
                  onClick={() => handleAddToList(recipe)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold 
                             text-green-700 bg-green-100 rounded-lg 
                             hover:bg-green-200 focus:outline-none 
                             focus:ring-2 focus:ring-green-500 transition-all"
                >
                  <ClipboardPlus className="h-4 w-4" />
                  Add to List
                </button>
                
                {/* Secondary Actions */}
                <div className="flex">
                  <button
                    onClick={() => handleEdit(recipe.id)}
                    className="p-2 text-gray-500 hover:text-blue-600 
                               rounded-full hover:bg-gray-200 transition-all"
                    title="Edit Recipe"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(recipe.id)}
                    className="p-2 text-gray-500 hover:text-red-600 
                               rounded-full hover:bg-gray-200 transition-all"
                    title="Delete Recipe"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {/* --- End of Recipe Card --- */}

        </div>
      ) : (
        
        // --- Empty State (Inlined) ---
        <div className="flex flex-col items-center justify-center 
                      text-center p-12 mt-10 bg-white 
                      rounded-2xl shadow-sm border border-gray-200"
        >
          <BookOpen className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            No Recipes Yet
          </h2>
          <p className="text-gray-500 mb-6 max-w-sm">
            Looks like you haven't added any recipes. Start by creating your first one!
          </p>
          <Link
            href="/app/recipes/new"
            className="flex items-center justify-center gap-2 px-5 py-3 font-semibold text-white 
                       bg-green-600 rounded-lg shadow-md hover:bg-green-700 
                       focus:outline-none focus:ring-2 focus:ring-green-500 
                       focus:ring-offset-2 transition-all"
          >
            <Plus className="h-5 w-5" />
            Create Your First Recipe
          </Link>
        </div>
        // --- End of Empty State ---

      )}
    </div>
  );
}