import React, { useState } from 'react';
import type { MealPlan, Meal, StructuredGroceryList } from '../../types.ts';
import { Button, Input, TextArea, Spinner } from '../ui/common.tsx';
import { generateGroceryList } from '../../services/geminiService.ts';
import GroceryListDisplay from './GroceryListDisplay.tsx';

const downloadAsText = (filename: string, text: string) => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
};

const MealPlanDisplay: React.FC<{ 
    plan: MealPlan, 
    clientName: string,
    isDraft?: boolean, 
    isEditable?: boolean, 
    onPlanChange?: (plan: MealPlan) => void 
}> = ({ plan, clientName, isDraft = false, isEditable = false, onPlanChange = () => {} }) => {
    const [groceryList, setGroceryList] = useState<StructuredGroceryList | null>(null);
    const [isLoadingList, setIsLoadingList] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateList = async () => {
        setIsLoadingList(true);
        setError(null);
        setGroceryList(null);
        try {
            const list = await generateGroceryList(plan);
            setGroceryList(list);
        } catch (e: any) {
            setError(e.message || 'Failed to generate list.');
        } finally {
            setIsLoadingList(false);
        }
    };

    const titleClass = isDraft ? "text-yellow-400" : "text-red-400";
    const titleText = isDraft 
        ? `DRAFT Meal Plan (Goal: ${plan.daily_calories_goal.toLocaleString()} kcal)`
        : `Meal Plan (Goal: ${plan.daily_calories_goal.toLocaleString()} kcal)`;

    const handleMealChange = (mealIndex: number, field: keyof Meal | keyof Meal['macronutrients'], value: any) => {
        const newMeals = [...plan.meals];
        if (field === 'protein' || field === 'carbohydrates' || field === 'fat') {
            newMeals[mealIndex].macronutrients = { ...newMeals[mealIndex].macronutrients, [field]: value };
        } else if (field === 'calories') {
             (newMeals[mealIndex] as any)[field] = parseInt(value) || 0;
        } 
        else {
            (newMeals[mealIndex] as any)[field] = value;
        }
        onPlanChange({ ...plan, meals: newMeals });
    };
    
    const formatMealPlanForDownload = (planToFormat: MealPlan): string => {
        let content = `Meal Plan for ${clientName}\n`;
        content += `Generated on: ${new Date().toLocaleDateString()}\n\n`;
        content += `Daily Calorie Goal: ${planToFormat.daily_calories_goal} kcal\n`;
        content += `========================================\n\n`;

        planToFormat.meals.forEach(meal => {
            content += `--- ${meal.name.toUpperCase()} ---\n`;
            content += `${meal.description}\n`;
            content += `Calories: ${meal.calories}\n`;
            content += `Macros: ${meal.macronutrients.protein} Protein / ${meal.macronutrients.carbohydrates} Carbs / ${meal.macronutrients.fat} Fat\n\n`;
        });
        return content;
    };

    const handleDownload = () => {
        const textContent = formatMealPlanForDownload(plan);
        const date = new Date(parseInt(plan.id.split('_')[1])).toISOString().split('T')[0];
        const filename = `MealPlan-${clientName.replace(/\s/g, '_')}-${date}.txt`;
        downloadAsText(filename, textContent);
    };

    return (
        <div className={`prose prose-invert max-w-none text-gray-300 mt-6 ${isDraft ? 'p-4 border border-dashed border-yellow-600 rounded-lg bg-yellow-900/20' : ''}`}>
             <div className={`flex justify-between items-center border-b pb-2 mb-3 ${isDraft ? 'border-yellow-700' : 'border-gray-600'}`}>
                <h4 className={`text-lg font-bold ${titleClass} border-none p-0 m-0`}>{titleText}</h4>
                {!isEditable && !isDraft && (
                    <Button variant="secondary" className="px-3 py-1 text-sm flex-shrink-0" onClick={handleDownload}>
                        <i className="fa-solid fa-download mr-2"></i>
                        Download
                    </Button>
                )}
            </div>
            {plan.meals.map((meal: Meal, mealIndex: number) => (
                <div key={meal.name} className="p-4 bg-gray-900/40 rounded-lg mb-3 border border-gray-700">
                    {isEditable ? <Input label="Meal Name" value={meal.name} onChange={e => handleMealChange(mealIndex, 'name', e.target.value)} /> : <p className="font-bold text-white">{meal.name}</p>}
                    {isEditable ? <TextArea label="Description" value={meal.description} onChange={e => handleMealChange(mealIndex, 'description', e.target.value)} rows={2}/> : <p className="text-gray-300 my-1">{meal.description}</p>}
                    {isEditable ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                           <Input label="Calories" type="number" value={meal.calories} onChange={e => handleMealChange(mealIndex, 'calories', e.target.value)} />
                           <Input label="Protein (g)" value={meal.macronutrients.protein} onChange={e => handleMealChange(mealIndex, 'protein', e.target.value)} />
                           <Input label="Carbs (g)" value={meal.macronutrients.carbohydrates} onChange={e => handleMealChange(mealIndex, 'carbohydrates', e.target.value)} />
                           <Input label="Fat (g)" value={meal.macronutrients.fat} onChange={e => handleMealChange(mealIndex, 'fat', e.target.value)} />
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400">Calories: {meal.calories} | Protein: {meal.macronutrients.protein} | Carbs: {meal.macronutrients.carbohydrates} | Fat: {meal.macronutrients.fat}</p>
                    )}
                </div>
            ))}
            {!isEditable && !isDraft && (
                 <div className="mt-6">
                    <Button onClick={handleGenerateList} disabled={isLoadingList} variant="secondary">
                        {isLoadingList ? <Spinner/> : <><i className="fa-solid fa-list-check mr-2"></i>Generate Grocery List</>}
                    </Button>
                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                    {groceryList && <GroceryListDisplay list={groceryList} />}
                </div>
            )}
        </div>
    )
};

export default MealPlanDisplay;
