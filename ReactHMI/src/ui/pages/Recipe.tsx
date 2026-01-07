import React, { useState } from 'react';
import './Recipe.css';

interface Recipe {
  id: number;
  name: string;
  speed: number;
  temperature: number;
  duration: number;
  active: boolean;
}

const sampleRecipes: Recipe[] = [
  { id: 1, name: 'Standard Production', speed: 2.5, temperature: 185, duration: 120, active: true },
  { id: 2, name: 'High Speed Mode', speed: 3.8, temperature: 195, duration: 90, active: false },
  { id: 3, name: 'Quality Control', speed: 1.2, temperature: 175, duration: 180, active: false },
  { id: 4, name: 'Energy Saver', speed: 1.8, temperature: 165, duration: 150, active: false },
];

export default function RecipePage() {
  const [recipes, setRecipes] = useState<Recipe[]>(sampleRecipes);

  const handleActivate = (id: number) => {
    setRecipes(recipes.map(r => ({ ...r, active: r.id === id })));
  };

  return (
    <div className="recipePage">
      <div className="recipeHeader">
        <h2>Production Recipes</h2>
        <p>Select and manage machine operation profiles</p>
      </div>
      <div className="recipeGrid">
        {recipes.map(recipe => (
          <div key={recipe.id} className="recipeCard">
            <h3>{recipe.name}</h3>
            <div>
              <div className="recipeParam">
                <span className="recipeParam__label">Conveyor Speed</span>
                <span className="recipeParam__value">{recipe.speed} m/s</span>
              </div>
              <div className="recipeParam">
                <span className="recipeParam__label">Temperature</span>
                <span className="recipeParam__value">{recipe.temperature} °C</span>
              </div>
              <div className="recipeParam">
                <span className="recipeParam__label">Duration</span>
                <span className="recipeParam__value">{recipe.duration} s</span>
              </div>
            </div>
            <div className="recipeActions">
              <button 
                className={`recipeBtn ${recipe.active ? 'recipeBtn--primary' : 'recipeBtn--secondary'}`}
                onClick={() => handleActivate(recipe.id)}
                disabled={recipe.active}
              >
                {recipe.active ? '✓ Active' : 'Activate'}
              </button>
              <button className="recipeBtn recipeBtn--secondary">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
