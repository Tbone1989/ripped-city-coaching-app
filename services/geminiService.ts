import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { MealPlan, WorkoutPlan, SupplementStack, CheatMeal, StructuredGroceryList, Client } from '../types.ts';

// The API key MUST be obtained exclusively from the environment variable `process.env.API_KEY`.
export const isGeminiConfigured = !!process.env.API_KEY;

// Per guidelines, initialize directly with process.env.API_KEY.
// The app execution environment is responsible for providing this variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const textModel = 'gemini-2.5-flash';

if (!isGeminiConfigured) {
    console.warn("Gemini API key not found in process.env.API_KEY. AI features will be disabled or fail. Ensure the API_KEY environment variable is set.");
}

const checkApiKey = () => {
    if (!isGeminiConfigured) {
        throw new Error("AI features are disabled because the Gemini API Key is not configured in the environment variables.");
    }
};

const generateWithSchema = async <T,>(prompt: string, schema: object): Promise<T> => {
    checkApiKey();
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: textModel,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as T;
    } catch (error) {
        console.error("Error generating content with schema:", error);
        throw new Error("Failed to generate structured content. Please check the console for details.");
    }
};

export const generateMealPlan = (details: { age: string; gender: string; weight: string; height: string; activityLevel: string; goal: string; dietaryRestrictions: string; workSchedule: string; bloodType?: string; status: 'natural' | 'enhanced', healthConditions: string; allergies: string; }): Promise<MealPlan> => {
    const bloodTypePrompt = details.bloodType && details.bloodType !== 'Unknown' 
        ? `
      - Blood Type Guidance: The client's blood type is ${details.bloodType}. Strictly adhere to the following nutritional principles for this blood type:
        - Type O: Emphasize high-protein, lean, organic meats. Include fish and poultry. Limit grains (especially wheat), beans, and legumes. Avoid dairy.
        - Type A: Focus on a primarily vegetarian diet with soy proteins, grains, and organic vegetables. Avoid red meat entirely. Light-to-moderate fish is acceptable.
        - Type B: A balanced omnivorous diet is best. Include a variety of meats (avoiding chicken), dairy, grains, and vegetables.
        - Type AB: A mixed diet in moderation. Focus on foods like tofu, seafood, dairy, and green vegetables. Avoid smoked or cured meats.
    ` : '';
    
    const contestPrepPrompt = details.goal.toLowerCase().includes('contest prep')
        ? `- Contest Prep: This is a contest preparation plan. Incorporate principles like carb cycling. The meal descriptions should be precise with measurements (e.g., '150g grilled chicken breast', '1 cup steamed asparagus').`
        : '';
    
    const statusPrompt = `- Client Status: The client is ${details.status}. Tailor food choices accordingly (e.g., enhanced athletes may require higher protein and more precise nutrient timing).`;

    const workSchedulePrompt = details.workSchedule
        ? `- Work Schedule Consideration: The client's work schedule is '${details.workSchedule}'. Plan meal and snack timings to be practical around this schedule. For example, suggest a quick, easy-to-eat lunch and schedule snacks during typical break times.`
        : '';
        
    const healthPrompt = details.healthConditions && details.healthConditions.toLowerCase() !== 'none' && details.healthConditions.trim() !== ''
        ? `- CRITICAL HEALTH CONSIDERATIONS: The client has the following health conditions: '${details.healthConditions}'. The meal plan MUST be designed to support these conditions. For example, if 'high blood pressure' is mentioned, the plan must be low in sodium. If 'diabetes' is mentioned, it should manage carbohydrate intake and focus on low-glycemic foods.`
        : '';

    const allergiesPrompt = details.allergies && details.allergies.toLowerCase() !== 'none' && details.allergies.trim() !== ''
        ? `- ALLERGIES: The client is allergic to '${details.allergies}'. The meal plan MUST NOT contain any of these ingredients or their derivatives.`
        : '';


    const prompt = `
        Create a detailed one-day meal plan for a ${details.age}-year-old ${details.gender}.
        Their stats: weight ${details.weight}kg, height ${details.height}cm.
        Activity level: '${details.activityLevel}'. Primary goal: '${details.goal}'.
        Dietary restrictions: '${details.dietaryRestrictions}'.
        
        The plan must follow these critical rules:
        ${healthPrompt}
        ${allergiesPrompt}
        ${bloodTypePrompt}
        ${contestPrepPrompt}
        ${statusPrompt}
        ${workSchedulePrompt}
        
        The plan should consist of 3 main meals and 2 snacks. Provide precise calorie and macro breakdowns for each meal.
    `;
    const mealPlanSchema = {
        type: Type.OBJECT,
        properties: {
            daily_calories_goal: { type: Type.NUMBER, description: "Total estimated daily calorie goal." },
            meals: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: "e.g., Breakfast, Lunch, Dinner, Snack 1" },
                        description: { type: Type.STRING, description: "Detailed description of the food items." },
                        calories: { type: Type.NUMBER },
                        macronutrients: {
                            type: Type.OBJECT,
                            properties: {
                                protein: { type: Type.STRING, description: "Protein in grams, e.g., '30g'" },
                                carbohydrates: { type: Type.STRING, description: "Carbohydrates in grams, e.g., '50g'" },
                                fat: { type: Type.STRING, description: "Fat in grams, e.g., '15g'" },
                            },
                            required: ["protein", "carbohydrates", "fat"]
                        },
                    },
                     required: ["name", "description", "calories", "macronutrients"]
                }
            }
        },
        required: ["daily_calories_goal", "meals"]
    };
    return generateWithSchema<MealPlan>(prompt, mealPlanSchema);
};

export const generateWorkoutPlan = (details: { age: string; gender: string; experience: string; goal: string; daysPerWeek: string; availableEquipment: string; status: 'natural' | 'enhanced', injuries: string }): Promise<WorkoutPlan> => {
    const contestPrepPrompt = details.goal.toLowerCase().includes('contest prep')
        ? `
        - Contest Prep Focus: This is for an ${details.status} athlete. The plan must be intense, emphasizing conditioning and muscle preservation. Include specific cardio recommendations (type, duration, frequency).
        - Recovery: Provide detailed recovery notes for each day, including specific stretching, foam rolling, or mobility exercises relevant to the muscles worked.
        `
        : `
        - Recovery: Provide brief recovery notes for each day, like key muscles to stretch.
        `;

    const injuryPrompt = details.injuries
        ? `
        - CRITICAL INJURY CONSIDERATION: The client has the following injuries/limitations: '${details.injuries}'.
        For any exercise that could stress these areas (e.g., heavy squats for knee pain, overhead press for shoulder impingement), you MUST provide a safe, alternative exercise. For each alternative, you must briefly explain WHY it is a better choice for this client. DO NOT suggest any exercises that would aggravate the stated injury. The entire plan should be built around working safely with these limitations.
        `
        : '';

    const prompt = `
        Create a ${details.daysPerWeek}-day per week workout plan for a ${details.age}-year-old ${details.gender} with ${details.experience} experience.
        Their primary goal is '${details.goal}'. They are an '${details.status}' athlete.
        They have access to: '${details.availableEquipment}'.
        
        ${contestPrepPrompt}
        ${injuryPrompt}
        
        Structure the response with a plan name and weekly schedule. For each day, detail the focus, exercises (sets, reps, rest), and specific recovery notes.
    `;
    const workoutPlanSchema = {
        type: Type.OBJECT,
        properties: {
            plan_name: { type: Type.STRING, description: "A catchy name for the workout plan." },
            weekly_schedule: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        day: { type: Type.NUMBER, description: "Workout day number." },
                        focus: { type: Type.STRING, description: "e.g., Full Body, Upper Body, Push Day" },
                        exercises: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    sets: { type: Type.STRING },
                                    reps: { type: Type.STRING },
                                    rest: { type: Type.STRING, description: "e.g., '60-90s'" },
                                    notes: { type: Type.STRING, description: "Optional notes, tips, or safe alternatives for the exercise." }
                                },
                                required: ["name", "sets", "reps", "rest"]
                            }
                        },
                        recovery_notes: { type: Type.STRING, description: "Specific recovery advice for the day, e.g., 'Foam roll quads, stretch hamstrings.'" }
                    },
                    required: ["day", "focus", "exercises", "recovery_notes"]
                }
            }
        },
        required: ["plan_name", "weekly_schedule"]
    };
    return generateWithSchema<WorkoutPlan>(prompt, workoutPlanSchema);
};

export const generateSupplementStack = (details: { age: string; gender: string; goal: string; healthInfo: string; bloodType?: string; }): Promise<SupplementStack> => {
    const bloodTypePrompt = details.bloodType && details.bloodType !== 'Unknown'
        ? `- Blood Type Integration: The client's blood type is ${details.bloodType}. Consider this for supplement recommendations. For example, Type A might have lower stomach acid, so HCL could be suggested with protein-heavy meals. Type O might benefit from iodine for thyroid support. Avoid supplements known to be problematic for their blood type.`
        : '';

    const prompt = `
        Based on the following user profile, create a supplement stack.
        Age: ${details.age}, Gender: ${details.gender}, Goal: '${details.goal}'. Blood Type: ${details.bloodType || 'Unknown'}.
        Health Info/Dietary Habits: '${details.healthInfo}'.
        
        CRITICAL INSTRUCTIONS:
        ${bloodTypePrompt}
        - Timing: Ensure supplement timings are compatible and logical.
        
        For each supplement, provide its name, dosage, timing, and purpose. The goal of the stack is '${details.goal}'.
        Include a strong disclaimer that this is not medical advice.
    `;
    const supplementStackSchema = {
        type: Type.OBJECT,
        properties: {
            goal: { type: Type.STRING, description: "The main goal of this supplement stack." },
            stack: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        dosage: { type: Type.STRING },
                        timing: { type: Type.STRING, description: "e.g., 'With breakfast', 'Post-workout'" },
                        purpose: { type: Type.STRING, description: "Why this supplement is included in the stack." }
                    },
                    required: ["name", "dosage", "timing", "purpose"]
                }
            }
        },
        required: ["goal", "stack"]
    };
     return generateWithSchema<SupplementStack>(prompt, supplementStackSchema);
};


export const analyzeBloodwork = async (bloodworkText: string, bloodType: string | undefined): Promise<string> => {
    checkApiKey();
    const bloodTypePrompt = bloodType && bloodType !== 'Unknown'
        ? `- Blood Type Context: The client's blood type is ${bloodType}. Briefly mention if any biomarkers have known correlations for this blood type, but do not provide specific 'type-specific normal ranges' as these are not universally established. Frame it as a point of discussion for their doctor.`
        : '';
    const prompt = `
        A user has provided their bloodwork results. Analyze the following data and provide a general, high-level interpretation.
        DO NOT PROVIDE MEDICAL ADVICE.
        Your analysis must:
        1. Identify key biomarkers outside typical reference ranges.
        2. Explain their general health relevance.
        3. Suggest general lifestyle considerations (diet, exercise) that influence them.
        4. ${bloodTypePrompt}
        5. Emphasize STRONGLY and REPEATEDLY that this is a system-generated analysis, not a medical diagnosis, and the user MUST consult a qualified healthcare professional. Start and end with this disclaimer.

        User's bloodwork data:
        ---
        ${bloodworkText}
        ---
    `;
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: textModel,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error analyzing bloodwork:", error);
        throw new Error("Failed to analyze bloodwork. The analysis service may be unavailable.");
    }
};

export const analyzeDrugInteractions = async (compounds: string): Promise<string> => {
    checkApiKey();
    const prompt = `
        Analyze the following list of compounds for potential drug interactions for a bodybuilder using performance-enhancing drugs.
        Your analysis should:
        1. Identify pairs or groups of compounds with known interactions.
        2. Describe the nature of the interaction (e.g., increased liver strain, conflicting effects, exacerbated side effects).
        3. Prioritize the most serious potential interactions.
        4. ABSOLUTELY and UNEQUIVOCALLY begin and end with a disclaimer: "This is for informational purposes only, is not medical advice, and a qualified healthcare professional must be consulted. The information provided may be incomplete or inaccurate."

        Compounds to analyze:
        ---
        ${compounds}
        ---
    `;
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: textModel,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error analyzing drug interactions:", error);
        throw new Error("Failed to analyze compounds. The service may be unavailable.");
    }
};

export const generateHealthyCheatMeal = (details: { cravings: string; dietaryRestrictions: string; }): Promise<CheatMeal> => {
    const prompt = `
        A user wants a "healthy" cheat meal plan. Their cravings are: '${details.cravings}'.
        Their dietary restrictions are: '${details.dietaryRestrictions}'.
        
        Create a single cheat meal that satisfies the craving but is made with healthier ingredients.
        Provide:
        1. A meal name.
        2. A brief description of how to prepare it.
        3. A list of specific healthier alternative ingredients to use.
        4. Tips for portion control for this meal.
    `;
    const cheatMealSchema = {
        type: Type.OBJECT,
        properties: {
            meal_name: { type: Type.STRING, description: "e.g., 'Ultimate Healthy Burger'" },
            description: { type: Type.STRING, description: "A brief, appetizing description of the meal and its preparation." },
            healthier_alternatives: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of healthier ingredient swaps." },
            portion_control_tips: { type: Type.STRING, description: "Actionable tips for managing portion size." }
        },
        required: ["meal_name", "description", "healthier_alternatives", "portion_control_tips"]
    };
    return generateWithSchema<CheatMeal>(prompt, cheatMealSchema);
};

export const generateGroceryList = async (plan: MealPlan): Promise<StructuredGroceryList> => {
    const mealPlanText = plan.meals.map(meal => `${meal.name}: ${meal.description}`).join('\n');
    const prompt = `
        From the following meal plan, create a detailed, categorized grocery list for one person for one day.

        **CRITICAL INSTRUCTIONS:**
        1.  **Extract all unique ingredients** from the meal plan.
        2.  **Consolidate and estimate quantities** for each ingredient (e.g., '1 lb chicken breast', '2 apples').
        3.  **For EACH ingredient, research and provide specific prices from 2-3 different, real-world US national or large regional grocery stores.** Examples include 'Walmart', 'Kroger', 'Sprouts Farmers Market', 'Whole Foods', 'Trader Joe's', 'Safeway', 'Publix'.
        4.  **The prices must be realistic and formatted correctly** (e.g., '$7.99/lb', '$4.29 each'). You must provide the store name for each price.
        5.  **Organize the items into logical grocery store categories** (e.g., 'Produce', 'Protein', 'Pantry', 'Dairy & Alternatives').
        6.  **Provide a few actionable shopping tips** for saving money or making better choices based on the items.
        7.  **Include a mandatory disclaimer** that these are recent price estimates and will vary by location, store, and current sales.

        Meal Plan:
        ---
        ${mealPlanText}
        ---
    `;
    const groceryListSchema = {
        type: Type.OBJECT,
        properties: {
            categories: {
                type: Type.ARRAY,
                description: "Categorized list of grocery items.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        category: { type: Type.STRING, description: "e.g., Produce, Protein, Pantry" },
                        items: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING, description: "Name of the grocery item." },
                                    quantity: { type: Type.STRING, description: "Estimated quantity, e.g., '1 lb', '2 containers'" },
                                    storePrices: {
                                        type: Type.ARRAY,
                                        description: "A list of prices for this item from different real-world stores.",
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                storeName: { type: Type.STRING, description: "The name of a real grocery store, e.g., 'Sprouts Farmers Market', 'Walmart', 'Whole Foods'." },
                                                price: { type: Type.STRING, description: "The price of the item at that store, e.g., '$7.99/lb', '$4.29 each'." }
                                            },
                                            required: ["storeName", "price"]
                                        }
                                    }
                                },
                                required: ["name", "quantity", "storePrices"]
                            }
                        }
                    },
                    required: ["category", "items"]
                }
            },
            shoppingTips: { type: Type.STRING, description: "General tips for shopping for these items, like buying in bulk or looking for sales." },
            disclaimer: { type: Type.STRING, description: "Disclaimer that prices are estimates based on recent data and will vary by location and store." }
        },
        required: ["categories", "shoppingTips", "disclaimer"]
    };

    try {
        const response = await generateWithSchema<StructuredGroceryList>(prompt, groceryListSchema);
        return response;
    } catch (error) {
        console.error("Error generating grocery list:", error);
        throw new Error("Failed to generate grocery list.");
    }
};

const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: {
            data: await base64EncodedDataPromise,
            mimeType: file.type,
        },
    };
};

export const extractTextFromImage = async (imageFile: File): Promise<string> => {
    checkApiKey();
    const prompt = "You are an expert at extracting structured text from documents. Analyze this image of a medical bloodwork report. Extract all biomarker names, their results, units, and reference ranges. Format the output as clean, readable text. Ignore any visual noise or artifacts from the image.";
    try {
        const imagePart = await fileToGenerativePart(imageFile);
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: textModel,
            contents: { parts: [{ text: prompt }, imagePart] },
        });
        if (!response.text) {
             throw new Error("The model returned an empty response. The image might be unclear or contain no text.");
        }
        return response.text;
    } catch (error) {
        console.error("Error extracting text from image:", error);
        throw new Error("Failed to extract text from the image. Please try again with a clearer image or enter the text manually.");
    }
};

export const generateDailyBriefing = async (client: Client): Promise<string> => {
    checkApiKey();

    // Prepare data slices
    const lastProgressLogs = client.progress.slice(-3).map(p => 
        `- Date: ${new Date(p.date).toLocaleDateString()}, Weight: ${p.weight}kg, Notes: ${p.notes || 'N/A'}`
    ).join('\n');

    const paymentsDue = client.payments.filter(p => p.status === 'Pending' || p.status === 'Overdue').map(p =>
        `- Amount: $${p.amount}, Due: ${new Date(p.dueDate).toLocaleDateString()}, Status: ${p.status}`
    ).join('\n');
    
    const holisticHealth = client.holisticHealth ? `
- Sleep Quality: ${client.holisticHealth.sleepQuality || 'N/A'}
- Stress Level: ${client.holisticHealth.stressLevel || 'N/A'}
- Energy Level: ${client.holisticHealth.energyLevel || 'N/A'}
    ` : 'No holistic health data.';

    const prompt = `
        You are an expert coaching assistant for 'Ripped City Coaching'. Your goal is to provide a concise, actionable daily briefing for the head coach about a single client.
        Analyze the provided client data and generate a summary in markdown format that includes:
        1.  **Status & Momentum:** A quick, one-sentence summary of the client's current state and momentum (e.g., "Making great progress," "Struggling with consistency," "Hitting a plateau").
        2.  **Key Data Points:** A bulleted list of 2-3 most important observations from the data. Focus on recent changes, potential issues (like poor sleep, overdue payments), or major wins.
        3.  **Suggested Action:** A specific, ready-to-send message for the coach to use for engagement. The message should be personal, encouraging, and reference a specific data point. It should sound like it comes from a caring, expert coach.

        **Client Information:**
        - Name: ${client.name}
        - Primary Goal: ${client.goal}
        - Status: ${client.status}

        **Recent Progress Logs (last 3):**
        ${lastProgressLogs || 'No recent progress logs.'}

        **Holistic Health Snapshot:**
        ${holisticHealth}

        **Pending/Overdue Payments:**
        ${paymentsDue || 'No outstanding payments.'}

        ---
        Now, generate the briefing for ${client.name}.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: textModel,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error(`Error generating briefing for ${client.name}:`, error);
        throw new Error(`Failed to generate briefing for ${client.name}. The AI service may be unavailable.`);
    }
};