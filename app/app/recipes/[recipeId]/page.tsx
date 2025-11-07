'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ChevronLeft,
  ClipboardPlus,
  Loader2,
  AlertTriangle,
  Clock,
  Book,
  Pencil,
  Trash2,
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
  prepTime?: string;
  cookTime?: string;
}

export default function RecipeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const recipeId = params.recipeId as string;
    if (!recipeId || !user) return;

    const fetchRecipe = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/api/recipes/${recipeId}`);

        if (res.status === 404) {
          throw new Error('Recipe not found.');
        }
        if (!res.ok) {
          throw new Error('Failed to fetch recipe from the server.');
        }

        const data: Recipe = await res.json();

        if (data.ownerId !== user.uid) {
          throw new Error("You don't have permission to view this recipe.");
        }

        setRecipe(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipe();
  }, [params.recipeId, user, API_URL]);

  const handleAddToList = (ingredients: Ingredient[]) => {
    const itemsToAdd = ingredients
      .map((ing) => `${ing.name} (${ing.amount || ing.quantity})`)
      .join('\n');
    alert(`Items to be added to your grocery list:\n${itemsToAdd}`);
  };

  const handleEdit = () => {
    if (!recipe) {
      return;
    }

    router.push(`/app/recipes/edit/${recipe.id}`);
  };

  const handleDelete = async () => {
    if (
      !recipe ||
      !window.confirm(`Are you sure you want to delete "${recipe.name}"?`)
    ) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/recipes/${recipe.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to delete recipe on the server.');
      }
      alert('Recipe deleted successfully.');
      router.replace('/app/recipes');
    } catch (err: any) {
      console.error('Failed to delete recipe:', err);
      alert(`Error: ${err.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12 mt-10">
        <Loader2 className="h-16 w-16 text-green-600 animate-spin" />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 mt-10 bg-red-50 rounded-2xl shadow-sm border border-red-200">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold text-red-800 mb-2">
          {error ? 'An Error Occurred' : 'Recipe Not Found'}
        </h2>
        <p className="text-red-600 max-w-sm">
          {error || "Sorry, we couldn't find the recipe you were looking for."}
        </p>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 
                     font-semibold transition-all mt-6"
        >
          <ChevronLeft className="h-5 w-5" />
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* 1. Page Header */}
      <div className="mb-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 
                     font-semibold transition-all mb-4"
          title="Go Back"
        >
          <ChevronLeft className="h-5 w-5" />
          Go Back
        </button>

        <div className="flex items-center justify-between mt-4">
          <h1 className="text-5xl font-extrabold text-gray-800">
            {recipe.name}
          </h1>

          <div className="flex">
            <button
              onClick={handleEdit}
              className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-200 transition-all"
              title="Edit Recipe"
            >
              <Pencil className="h-5 w-5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-200 transition-all"
              title="Delete Recipe"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Image & Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <img
              src={
                recipe.imageUrl ||
                'https://placehold.co/600x400/a7f3d0/34495e?text=Recipe'
              }
              alt={recipe.name}
              className="w-full h-64 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://placehold.co/600x400/e0e0e0/7f8c8d?text=Image+Error';
              }}
            />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <p className="text-gray-700 text-base leading-relaxed">
              {recipe.description}
            </p>

            <div className="mt-6 pt-4 border-t border-gray-200 space-y-3">
              <div className="flex items-center gap-4">
                <Clock className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700">
                  Prep time:
                </span>
                <span className="text-sm text-gray-600">
                  {recipe.prepTime || 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Book className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700">
                  Cook time:
                </span>
                <span className="text-sm text-gray-600">
                  {recipe.cookTime || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Ingredients & Instructions */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-800">Ingredients</h2>
              <button
                onClick={() => handleAddToList(recipe.ingredients)}
                className="flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold text-white 
                           bg-green-600 rounded-lg shadow-md hover:bg-green-700 
                           focus:outline-none focus:ring-2 focus:ring-green-500 
                           focus:ring-offset-2 transition-all"
              >
                <ClipboardPlus className="h-5 w-5" />
                Add to List
              </button>
            </div>

            <ul className="space-y-3">
              {recipe.ingredients.map((ing, index) => (
                <li key={index} className="flex items-center text-base">
                  <span className="h-2 w-2 bg-green-300 rounded-full mr-3 flex-shrink-0"></span>
                  <span className="font-semibold text-gray-700 mr-2">
                    {ing.name}:
                  </span>
                  <span className="text-gray-600">{ing.amount}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Instructions
            </h2>

            <div className="prose prose-green max-w-none text-gray-700">
              {recipe?.instructions
                ?
                recipe?.instructions.split('\n').map((step, index) => (
                  <p key={index} className="mb-4">{step}</p>
                ))
                :
                <p>No instructions available for this recipe.</p>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}