'use client'; // This is a form, so it must be a Client Component

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ChevronLeft, Save, Image as ImageIcon } from 'lucide-react';

// --- Define the Ingredient data type ---
// We use a temporary string ID for React keys
interface IngredientField {
  id: string;
  name: string;
  quantity: string;
}

// --- Main Page Component ---
export default function NewRecipePage() {
  const router = useRouter();

  // --- Form State Hooks ---
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [ingredients, setIngredients] = useState<IngredientField[]>([
    { id: '1', name: '', quantity: '' }, // Start with one empty row
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Ingredient List Handlers ---

  /**
   * Updates a specific ingredient in the state array.
   */
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

  /**
   * Adds a new, empty ingredient row to the list.
   */
  const handleAddIngredient = () => {
    const newId = `ing-${Date.now()}`; // Simple unique ID
    setIngredients([...ingredients, { id: newId, name: '', quantity: '' }]);
  };

  /**
   * Removes an ingredient row by its ID.
   */
  const handleRemoveIngredient = (id: string) => {
    // Prevent removing the very last item
    if (ingredients.length <= 1) return;
    setIngredients((currentIngredients) =>
      currentIngredients.filter((ing) => ing.id !== id)
    );
  };

  /**
   * Handles the main form submission.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 1. (Future) Prepare data for the backend
    // Remove the temporary 'id' field from ingredients
    const finalIngredients = ingredients.map(({ name, quantity }) => ({ name, quantity }));
    const recipeData = {
      name,
      description,
      imageUrl,
      ingredients: finalIngredients,
    };

    // 2. (Future) Call your backend API
    // await fetch('/api/recipes', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(recipeData),
    // });

    // 3. Mock submission
    console.log('Recipe Data to Submit:', recipeData);
    await new Promise((res) => setTimeout(res, 1000)); // Simulate network delay

    setIsSubmitting(false);
    alert('Recipe saved successfully! (Mocked)');
    router.push('/app/recipes'); // Go back to the recipes page
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        {/* 1. Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="p-2 text-gray-500 hover:text-gray-900 
                         rounded-full hover:bg-gray-100 transition-all"
              title="Go Back"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-4xl font-extrabold text-gray-800">
              Create New Recipe
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
            {isSubmitting ? 'Saving...' : 'Save Recipe'}
          </button>
        </div>

        {/* 2. Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Main Details */}
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg border border-gray-100 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">
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
              <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-2">
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
              <label htmlFor="imageUrl" className="block text-sm font-bold text-gray-700 mb-2">
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
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Right Column: Ingredients */}
          <div className="lg:col-span-1 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Ingredients</h2>
            <div className="space-y-4">
              {ingredients.map((ing, index) => (
                <div key={ing.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={ing.name}
                    onChange={(e) => handleIngredientChange(ing.id, 'name', e.target.value)}
                    placeholder="Item Name"
                    required
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    type="text"
                    value={ing.quantity}
                    onChange={(e) => handleIngredientChange(ing.id, 'quantity', e.target.value)}
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