'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Plus,
  Trash2,
  ChevronLeft,
  Save,
  Image as ImageIcon,
  Clock,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'react-hot-toast';

interface IngredientField {
  id: string;
  name: string;
  quantity: string;
}

interface RecipeData {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  instructions: string;
  ingredients: { name: string; amount: string }[];
  ownerId: string;
  prepTime?: string;
  cookTime?: string;
}

export default function EditRecipePage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const recipeId = params.recipeId as string;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [ingredients, setIngredients] = useState<IngredientField[]>([
    { id: '1', name: '', quantity: '' },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    if (!recipeId || !user) return;

    const fetchRecipe = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/recipes/${recipeId}`);
        if (!res.ok) throw new Error('Recipe not found');

        const data: RecipeData = await res.json();

        if (data.ownerId !== user.uid) {
          alert("You don't have permission to edit this recipe.");
          router.replace('/app/recipes');
          return;
        }

        setName(data.name);
        setDescription(data.description || '');
        setImageUrl(data.imageUrl || '');
        setPrepTime(data.prepTime || '');
        setCookTime(data.cookTime || '');
        setIngredients(
          data.ingredients.length > 0
            ? data.ingredients.map((ing, i) => ({
              id: `ing-${i}`,
              name: ing.name,
              quantity: ing.amount,
            }))
            : [{ id: '1', name: '', quantity: '' }]
        );
      } catch (err) {
        console.error(err);
        alert('Failed to load recipe data.');
        router.push('/app/recipes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId, user, router, API_URL]);

  const handleIngredientChange = (
    id: string,
    field: 'name' | 'quantity',
    value: string
  ) => {
    setIngredients((currentIngredients) =>
      currentIngredients.map((ing) =>
        ing.id === id ? { ...ing, [field]: value } : ing
      )
    );
  };

  const handleAddIngredient = () => {
    const newId = `ing-${Date.now()}`;
    setIngredients([...ingredients, { id: newId, name: '', quantity: '' }]);
  };

  const handleRemoveIngredient = (id: string) => {
    if (ingredients.length <= 1) return;
    setIngredients((currentIngredients) =>
      currentIngredients.filter((ing) => ing.id !== id)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    const finalIngredients = ingredients.map(({ name, quantity }) => ({
      name: name,
      amount: quantity,
    }));

    const recipeData = {
      name,
      description,
      imageUrl,
      prepTime,
      cookTime,
      ingredients: finalIngredients,
    };

    const promise = fetch(`${API_URL}/api/recipes/${recipeId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recipeData),
    }).then((res) => {
      if (!res.ok) throw new Error('Failed to update recipe.');
    });

    toast.promise(
      promise,
      {
        loading: 'Saving changes...',
        success: (data) => {
          router.push('/app/recipes');
          return 'Recipe updated successfully!';
        },
        error: (err) => err.message,
      }
    ).finally(() => setIsSubmitting(false)); 
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12 mt-10">
        <Loader2 className="h-16 w-16 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        {/* 1. Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
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
            <h1 className="text-5xl font-extrabold text-gray-800">
              Edit Recipe
            </h1>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-5 py-3 font-semibold text-white 
                       bg-green-600 rounded-lg shadow-md hover:bg-green-700 
                       focus:outline-none focus:ring-2 focus:ring-green-500 
                       focus:ring-offset-2 transition-all disabled:bg-gray-400"
          >
            <Save className="h-5 w-5" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* 2. Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Main Details */}
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg border border-gray-100 space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-bold text-gray-700 mb-2"
              >
                Recipe Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Classic Chicken Soup"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm 
                           focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-bold text-gray-700 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="A short, catchy description of your recipe..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm 
                           focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label
                htmlFor="imageUrl"
                className="block text-sm font-bold text-gray-700 mb-2"
              >
                Image URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://... (or leave blank for placeholder)"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm 
                             focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <ImageIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label
                  htmlFor="prepTime"
                  className="block text-sm font-bold text-gray-700 mb-2"
                >
                  Prep Time
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="prepTime"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    placeholder="e.g., 15 min"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm 
                               focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <Clock
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
              </div>
              <div className="flex-1">
                <label
                  htmlFor="cookTime"
                  className="block text-sm font-bold text-gray-700 mb-2"
                >
                  Cook Time
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="cookTime"
                    value={cookTime}
                    onChange={(e) => setCookTime(e.target.value)}
                    placeholder="e.g., 30 min"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm 
                               focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <Clock
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Ingredients */}
          <div className="lg:col-span-1 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Ingredients
            </h2>
            <div className="space-y-4">
              {ingredients.map((ing, index) => (
                <div key={ing.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={ing.name}
                    onChange={(e) =>
                      handleIngredientChange(ing.id, 'name', e.target.value)
                    }
                    placeholder="Item Name"
                    required
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    type="text"
                    value={ing.quantity}
                    onChange={(e) =>
                      handleIngredientChange(ing.id, 'quantity', e.target.value)
                    }
                    placeholder="Quantity"
                    required
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(ing.id)}
                    disabled={ingredients.length <= 1}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-full 
                               hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Remove Ingredient"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddIngredient}
              className="flex items-center gap-2 w-full mt-6 px-4 py-2 text-sm font-semibold 
                         text-green-700 bg-green-100 rounded-lg 
                         hover:bg-green-200 focus:outline-none 
                         focus:ring-2 focus:ring-green-500 transition-all"
            >
              <Plus className="h-5 w-5" />
              Add Ingredient
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}