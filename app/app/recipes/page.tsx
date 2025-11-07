'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  Pencil,
  ClipboardPlus,
  BookOpen,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface Ingredient {
  id?: string;
  name: string;
  amount: string;
  quantity?: string;
}

interface Recipe {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  instructions: string;
  ingredients: Ingredient[];
  ownerId: string;
  prepTime?: string; // Add new field
  cookTime?: string; // Add new field
}

const LoadingState = () => (
  <div className="flex justify-center items-center p-12 mt-10">
    <Loader2 className="h-16 w-16 text-green-600 animate-spin" />
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center text-center p-12 mt-10 bg-red-50 rounded-2xl shadow-sm border border-red-200">
    <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
    <h2 className="text-2xl font-semibold text-red-800 mb-2">
      Error Fetching Recipes
    </h2>
    <p className="text-red-600 max-w-sm">{message}</p>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center text-center p-12 mt-10 bg-white rounded-2xl shadow-sm border border-gray-200">
    <BookOpen className="h-16 w-16 text-gray-400 mb-4" />
    <h2 className="text-2xl font-semibold text-gray-800 mb-2">
      No Recipes Yet
    </h2>
    <p className="text-gray-500 mb-6 max-w-sm">
      Looks like you haven't added any recipes. Start by creating your first
      one!
    </p>
    <Link
      href="/app/recipes/new"
      className="flex items-center justify-center gap-2 px-5 py-3 font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all"
    >
      <Plus className="h-5 w-5" />
      Create Your First Recipe
    </Link>
  </div>
);

export default function MyRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    if (!user) return;

    const fetchRecipes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/api/recipes?userId=${user.uid}`);
        if (!res.ok) {
          throw new Error('Failed to fetch recipes from the server.');
        }
        const data: Recipe[] = await res.json();
        setRecipes(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, [user]);

  const handleAddToList = async (recipe: Recipe) => {
    const itemsToAdd = recipe.ingredients.map((ing) => ({
      name: `${ing.name} (${ing.amount || ing.quantity})`,
      purchased: false,
    }));

    alert(
      `Mock Add: Adding ${itemsToAdd.length} items to your grocery list.`
    );

    try {
      const listId = 'YOUR_ACTIVE_LIST_ID';
      await Promise.all(
        itemsToAdd.map(item =>
          fetch(`${API_URL}/api/lists/${listId}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
          })
        )
      );
    } catch (err) {
      console.error('Failed to add items to list:', err);
      alert('Error: Could not add items to list.');
    }
  };

  const handleDelete = async (recipeId: string) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) {
      return;
    }

    const originalRecipes = [...recipes];
    setRecipes(recipes.filter((r) => r.id !== recipeId));

    try {
      const res = await fetch(`${API_URL}/api/recipes/${recipeId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to delete on server.');
      }
    } catch (err) {
      console.error('Failed to delete recipe:', err);
      alert('Error: Could not delete recipe. Restoring list.');
      setRecipes(originalRecipes);
    }
  };

  const handleEdit = (recipeId: string) => {
    router.push(`/app/recipes/edit/${recipeId}`);
  };

  const handleSelect = (recipeId: string) => {
    router.push(`/app/recipes/${recipeId}`);
  }

  const renderContent = () => {
    if (isLoading) {
      return <LoadingState />;
    }
    if (error) {
      return <ErrorState message={error} />;
    }
    if (recipes.length === 0) {
      return <EmptyState />;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="flex flex-col bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
          >
            <img
              src={recipe.imageUrl || `https://placehold.co/600x400/a7f3d0/34495e?text=${recipe.name}`}
              alt={recipe.name}
              className="w-full h-48 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://placehold.co/600x400/e0e0e0/7f8c8d?text=Image+Error';
              }}
            />

            <div className="p-6 flex-1">
              <h3 className="text-2xl font-bold text-gray-800 mb-2" onClick={() => handleSelect(recipe.id)} style={{ cursor: 'pointer' }}>
                {recipe.name}
              </h3>
              <p className="text-gray-600 text-base line-clamp-3">
                {recipe.description
                  || (recipe.instructions ? recipe.instructions.substring(0, 100) + '...' : null)
                  || 'No description available.'}
              </p>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
              <button
                onClick={() => handleAddToList(recipe)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-green-700 bg-green-100 rounded-lg hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              >
                <ClipboardPlus className="h-4 w-4" />
                Add to List
              </button>

              <div className="flex">
                <button
                  onClick={() => handleEdit(recipe.id)}
                  className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-200 transition-all"
                  title="Edit Recipe"
                >
                  <Pencil className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(recipe.id)}
                  className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-200 transition-all"
                  title="Delete Recipe"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-extrabold text-gray-800">My Recipes</h1>
        <Link
          href="/app/recipes/new"
          className="flex items-center justify-center gap-2 px-5 py-3 font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all"
        >
          <Plus className="h-5 w-5" />
          New Recipe
        </Link>
      </div>

      {renderContent()}
    </div>
  );
}