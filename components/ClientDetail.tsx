import React, { useState, FormEvent } from 'react';
import type { Client, MealPlan, WorkoutPlan, SupplementStack, Meal, Supplement, WorkoutDay, Exercise, CheatMeal, Payment, Message, BloodworkSubmission, StructuredGroceryList, ClientTestimonial, BloodDonationInfo } from '../types.ts';
import { Button, Card, Input, Select, TextArea, Spinner, Tabs } from './ui/common.tsx';
import { generateMealPlan, generateWorkoutPlan, generateSupplementStack, analyzeBloodwork, generateGroceryList, analyzeDrugInteractions, generateHealthyCheatMeal } from '../services/geminiService.ts';
import MealPlanDisplay from './shared/MealPlanDisplay.tsx';
import WorkoutPlanDisplay from './shared/WorkoutPlanDisplay.tsx';

interface ClientDetailProps {
  client: Client;
  onBack: () => void;
  onUpdateClient: (client: Client) => Promise<void>;
  onLoginAsClient: () => void;
}

const SupplementStackDisplay: React.FC<{ stackData: SupplementStack }> = ({ stackData }) => (
    <div className="prose prose-invert max-w-none text-gray-300 mt-6">
        <h4 className="text-lg font-bold text-red-400 border-b border-gray-600 pb-2 mb-3">Supplement Stack for: {stackData.goal}</h4>
         <ul className="list-disc list-inside text-gray-300 space-y-2">
            {stackData.stack.map((sup: Supplement, idx: number) => (
                <li key={idx}>
                    <strong>{sup.name}</strong> ({sup.dosage}, {sup.timing})
                    <p className="text-sm text-gray-400 pl-4">{sup.purpose}</p>
                </li>
            ))}
        </ul>
        <p className="text-xs text-yellow-400 italic mt-4">Disclaimer: This is a system-generated suggestion and not medical advice. Consult a healthcare professional before starting any new supplement regimen.</p>
    </div>
);

const CheatMealDisplay: React.FC<{ meal: CheatMeal }> = ({ meal }) => (
    <div className="prose prose-invert max-w-none text-gray-300 mt-6 p-4 bg-gray-900/40 rounded-lg border border-gray-700">
        <h4 className="text-lg font-bold text-white mt-0">{meal.meal_name}</h4>
        <p>{meal.description}</p>
        <div className="my-3">
            <h5 className="font-semibold text-gray-200">Healthier Swaps:</h5>
            <ul className="list-disc list-inside text-sm">
                {meal.healthier_alternatives.map((alt, i) => <li key={i}>{alt}</li>)}
            </ul>
        </div>
        <div>
            <h5 className="font-semibold text-gray-200">Portion Control:</h5>
            <p className="text-sm">{meal.portion_control_tips}</p>
        </div>
    </div>
);

const DrugInteractionAnalyzer: React.FC = () => {
    const [compounds, setCompounds] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string|null>(null);
    const [analysis, setAnalysis] = useState<string|null>(null);

    const handleAnalyze = async () => {
        if (!compounds) return;
        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        try {
            const result = await analyzeDrugInteractions(compounds);
            setAnalysis(result);
        } catch (e: any) {
            setError(e.message || 'Failed to analyze.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="p-4 bg-gray-900/40 border border-gray-700 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-300">Drug Interaction Analyzer</h4>
            <TextArea 
                label="Compounds to analyze"
                placeholder="List compounds, one per line (e.g., Testosterone Cypionate, Trenbolone Acetate, Anadrol)"
                value={compounds}
                onChange={e => setCompounds(e.target.value)}
                rows={4}
                className="mt-2"
            />
            <Button onClick={handleAnalyze} disabled={isLoading || !compounds} className="mt-2">
                {isLoading ? <Spinner /> : 'Analyze Interactions'}
            </Button>
            {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
            {analysis && (
                <div className="mt-4 prose prose-invert max-w-none text-sm text-gray-300">
                     <pre className="whitespace-pre-wrap font-sans bg-gray-900/50 p-3 rounded-md">{analysis}</pre>
                </div>
            )}
        </div>
    );
};

const HealthyCheatMealGenerator: React.FC = () => {
    const [cravings, setCravings] = useState('');
    const [dietary, setDietary] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string|null>(null);
    const [cheatMeal, setCheatMeal] = useState<CheatMeal|null>(null);

    const handleGenerate = async () => {
        if (!cravings) return;
        setIsLoading(true);
        setError(null);
        setCheatMeal(null);
        try {
            const result = await generateHealthyCheatMeal({cravings, dietaryRestrictions: dietary});
            setCheatMeal(result);
        } catch (e: any) {
            setError(e.message || 'Failed to generate.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="p-4 bg-gray-900/40 border border-gray-700 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-300">Healthy Cheat Meal Generator</h4>
            <div className="space-y-2 mt-2">
                 <Input label="What is the client craving?" placeholder="e.g., Pizza, burger and fries" value={cravings} onChange={e => setCravings(e.target.value)} />
                 <Input label="Any dietary restrictions?" placeholder="e.g., Gluten-free, dairy-free" value={dietary} onChange={e => setDietary(e.target.value)} />
            </div>
            <Button onClick={handleGenerate} disabled={isLoading || !cravings} className="mt-2">
                {isLoading ? <Spinner /> : 'Generate Healthy Cheat Meal'}
            </Button>
            {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
            {cheatMeal && <CheatMealDisplay meal={cheatMeal} />}
        </div>
    );
};

const ClientProfile: React.FC<{ client: Client }> = ({ client }) => {
    const getDonationStatusColor = (status: BloodDonationInfo['status']) => {
        switch (status) {
            case 'Eligible': return 'bg-green-500/20 text-green-300';
            case 'Ineligible - Temporary': return 'bg-yellow-500/20 text-yellow-300';
            case 'Ineligible - Permanent': return 'bg-red-500/20 text-red-300';
            case 'Unknown':
            default:
                return 'bg-gray-500/20 text-gray-300';
        }
    };

    return (
    <div className="space-y-6 text-gray-300">
        <div>
            <h3 className="text-xl font-semibold text-white">Client Profile</h3>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-900/40 border border-gray-700 rounded-lg">
                <div><strong>Name:</strong> {client.name}</div>
                <div><strong>Email:</strong> {client.email}</div>
                <div><strong className="text-red-400">Main Goal:</strong> {client.goal}</div>
                <div><strong>Age:</strong> {client.profile.age}</div>
                <div><strong>Gender:</strong> {client.profile.gender}</div>
                <div><strong>Weight:</strong> {client.profile.weight} kg</div>
                <div><strong>Height:</strong> {client.profile.height} cm</div>
                <div><strong>Experience:</strong> {client.profile.experience}</div>
                <div><strong>Blood Type:</strong> {client.profile.bloodType || 'N/A'}</div>
                <div><strong>Status:</strong> <span className={`capitalize font-semibold py-0.5 px-2 rounded ${client.profile.status === 'enhanced' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300'}`}>{client.profile.status}</span></div>
                 {client.bloodDonationStatus && (
                    <div className="col-span-2 md:col-span-1">
                        <strong>Donation Status:</strong>
                        <span className={`ml-2 capitalize font-semibold py-0.5 px-2 rounded ${getDonationStatusColor(client.bloodDonationStatus.status)}`}>
                            {client.bloodDonationStatus.status}
                        </span>
                        {client.bloodDonationStatus.lastChecked && <p className="text-xs text-gray-400">Checked: {new Date(client.bloodDonationStatus.lastChecked).toLocaleDateString()}</p>}
                    </div>
                 )}
            </div>
             {client.bloodDonationStatus?.notes && (
                <div className="mt-2 p-2 bg-gray-800/50 rounded-md">
                     <p className="text-sm"><strong className="text-gray-400">Donation Notes:</strong> {client.bloodDonationStatus.notes}</p>
                </div>
            )}
        </div>
        <div>
            <h3 className="text-xl font-semibold text-white">Holistic Health Log</h3>
            <div className="mt-2 p-4 bg-gray-900/40 border border-gray-700 rounded-lg space-y-3">
                <div><strong className="text-gray-400">Sleep Quality:</strong><p className="ml-2 inline">{client.holisticHealth?.sleepQuality || 'Not specified.'}</p></div>
                <div><strong className="text-gray-400">Reported Stress Level:</strong><p className="ml-2 inline">{client.holisticHealth?.stressLevel || 'Not specified.'}</p></div>
                <div><strong className="text-gray-400">Reported Energy Level:</strong><p className="ml-2 inline">{client.holisticHealth?.energyLevel || 'Not specified.'}</p></div>
                <div><strong className="text-gray-400">Current Herbal Supplements:</strong><p className="whitespace-pre-wrap mt-1 p-2 bg-gray-800/50 rounded-md text-sm">{client.holisticHealth?.herbalLog || 'None specified.'}</p></div>
            </div>
        </div>
        <div>
            <h3 className="text-xl font-semibold text-white pt-4">Intake & Preferences</h3>
            <div className="mt-2 p-4 bg-gray-900/40 border border-gray-700 rounded-lg space-y-3">
                <div><strong className="text-gray-400">Work Schedule:</strong><p>{client.intakeData.workSchedule || 'Not specified.'}</p></div>
                <div><strong className="text-gray-400">Known Health Conditions:</strong><p className="text-yellow-300">{client.intakeData.healthConditions || 'None specified.'}</p></div>
                <div><strong className="text-gray-400">Allergies:</strong><p className="text-yellow-300">{client.intakeData.allergies || 'None specified.'}</p></div>
                <div><strong className="text-gray-400">Injuries/Limitations:</strong><p>{client.intakeData.injuries || 'None specified.'}</p></div>
                <div><strong className="text-gray-400">Medications/Supplements:</strong><p>{client.intakeData.meds || 'None specified.'}</p></div>
                <div><strong className="text-gray-400">Dietary Preferences/Restrictions:</strong><p>{client.intakeData.diet || 'None specified.'}</p></div>
            </div>
        </div>
    </div>
    );
};

const ClientOnboarding: React.FC<{ client: Client, onUpdateClient: (client: Client) => Promise<void> }> = ({ client, onUpdateClient }) => {

    const handleGeneratePaymentLink = () => {
        alert(`Payment Link Generated:\nhttps://buy.stripe.com/mock-link-for-${client.name.replace(/\s+/g, '-').toLowerCase()}`);
    };
    
    const handleMarkAsPaid = async () => {
        await onUpdateClient({ ...client, paymentStatus: 'paid', status: 'active' });
        alert(`${client.name} has been marked as paid and their status is now 'Active'. They can now log in and complete their profile.`);
    };

    const handleGenerateProfileLink = () => {
        alert(`Client Profile Setup Link:\nhttps://rippedcitycoaching.app/portal?login_email=${client.email}\n\n(For this demo, the client can now log in using their email and a password you set for them in Supabase.)`);
    };

    return (
        <Card className="bg-gray-800/60">
            <h3 className="text-2xl font-semibold text-white mb-2">Onboarding Checklist</h3>
            <p className="text-gray-400 mb-6">Follow these steps to onboard your new prospect.</p>

            <div className="space-y-6">
                <div className="flex items-center gap-6 p-4 bg-gray-900/40 rounded-lg border border-gray-700">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xl">1</div>
                    <div>
                        <h4 className="font-bold text-lg text-white">Generate Payment Link</h4>
                        <p className="text-gray-400 text-sm">Create and send a payment link to the client for the initial consultation or first month.</p>
                    </div>
                    <Button onClick={handleGeneratePaymentLink} variant="secondary" className="ml-auto">Generate Link</Button>
                </div>

                <div className="flex items-center gap-6 p-4 bg-gray-900/40 rounded-lg border border-gray-700">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${client.paymentStatus === 'paid' ? 'bg-green-600' : 'bg-red-600'}`}>2</div>
                    <div>
                        <h4 className="font-bold text-lg text-white">Confirm Payment</h4>
                        <p className="text-gray-400 text-sm">Once payment is received, mark the client as 'Paid' to activate their account.</p>
                    </div>
                     {client.paymentStatus === 'unpaid' ? (
                        <Button onClick={handleMarkAsPaid} variant="primary" className="ml-auto">Mark as Paid</Button>
                     ) : (
                         <div className="ml-auto text-green-400 font-semibold flex items-center gap-2">
                             <i className="fa-solid fa-check-circle"></i>
                             Paid & Active
                         </div>
                     )}
                </div>
                
                <div className="flex items-center gap-6 p-4 bg-gray-900/40 rounded-lg border border-gray-700">
                     <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${client.paymentStatus === 'paid' ? 'bg-red-600' : 'bg-gray-600'}`}>3</div>
                    <div>
                        <h4 className="font-bold text-lg text-white">Send Profile Setup Link</h4>
                        <p className="text-gray-400 text-sm">Generate a link for the client to log in, create their password, and fill out their detailed profile information.</p>
                    </div>
                    <Button onClick={handleGenerateProfileLink} variant="secondary" className="ml-auto" disabled={client.paymentStatus !== 'paid'}>Generate Link</Button>
                </div>
            </div>
        </Card>
    );
};


const ClientPlanGenerators: React.FC<{ client: Client, onUpdateClient: (client: Client) => Promise<void>; }> = ({ client, onUpdateClient }) => {
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({ meal: false, workout: false, supplement: false });
    const [error, setError] = useState<Record<string, string | null>>({ meal: null, workout: null, supplement: null });
    
    const [draftMealPlan, setDraftMealPlan] = useState<MealPlan | null>(null);
    const [editableMealPlan, setEditableMealPlan] = useState<MealPlan | null>(null);

    const [draftWorkoutPlan, setDraftWorkoutPlan] = useState<WorkoutPlan | null>(null);
    const [editableWorkoutPlan, setEditableWorkoutPlan] = useState<WorkoutPlan | null>(null);

    const [supplementStack, setSupplementStack] = useState<SupplementStack | null>(null);

    const [dietaryRestrictions, setDietaryRestrictions] = useState(client.intakeData.diet);
    const [daysPerWeek, setDaysPerWeek] = useState('4');
    const [availableEquipment, setAvailableEquipment] = useState('Standard gym equipment (barbells, dumbbells, machines, cables)');
    const [supplementGoal, setSupplementGoal] = useState(client.goal);
    
    const handleApprovePlan = async (type: 'meal' | 'workout') => {
        let planToApprove: MealPlan | WorkoutPlan | null = null;
        if (type === 'meal' && (draftMealPlan || editableMealPlan)) {
            planToApprove = editableMealPlan ? { ...editableMealPlan, status: 'approved', id: `plan_${Date.now()}` } : { ...draftMealPlan!, status: 'approved', id: `plan_${Date.now()}` };
            await onUpdateClient({ ...client, generatedPlans: { ...client.generatedPlans, mealPlans: [...client.generatedPlans.mealPlans, planToApprove as MealPlan] } });
            setDraftMealPlan(null);
            setEditableMealPlan(null);
        } else if (type === 'workout' && (draftWorkoutPlan || editableWorkoutPlan)) {
            planToApprove = editableWorkoutPlan ? { ...editableWorkoutPlan, status: 'approved', id: `plan_${Date.now()}` } : { ...draftWorkoutPlan!, status: 'approved', id: `plan_${Date.now()}` };
            await onUpdateClient({ ...client, generatedPlans: { ...client.generatedPlans, workoutPlans: [...client.generatedPlans.workoutPlans, planToApprove as WorkoutPlan] } });
            setDraftWorkoutPlan(null);
            setEditableWorkoutPlan(null);
        }
    };

    const handleGenerate = async (tool: 'meal' | 'workout' | 'supplement') => {
        setIsLoading(prev => ({ ...prev, [tool]: true }));
        setError(prev => ({...prev, [tool]: null}));
        try {
            switch (tool) {
                case 'meal':
                    setDraftMealPlan(null);
                    setEditableMealPlan(null);
                    const mp = await generateMealPlan({ ...client.profile, goal: client.goal, dietaryRestrictions, workSchedule: client.intakeData.workSchedule, healthConditions: client.intakeData.healthConditions, allergies: client.intakeData.allergies });
                    setDraftMealPlan({ ...mp, id: `draft_${Date.now()}`, status: 'draft' });
                    break;
                case 'workout':
                    setDraftWorkoutPlan(null);
                    setEditableWorkoutPlan(null);
                    const wp = await generateWorkoutPlan({ ...client.profile, goal: client.goal, daysPerWeek, availableEquipment, injuries: client.intakeData.injuries });
                    setDraftWorkoutPlan({ ...wp, id: `draft_${Date.now()}`, status: 'draft' });
                    break;
                case 'supplement':
                     setSupplementStack(null);
                     const ss = await generateSupplementStack({ age: client.profile.age, gender: client.profile.gender, goal: supplementGoal, healthInfo: `Current goal: ${client.goal}. Stated diet: ${client.intakeData.diet}. Injuries: ${client.intakeData.injuries}. Medications: ${client.intakeData.meds}`, bloodType: client.profile.bloodType });
                     setSupplementStack(ss);
                    break;
            }
        } catch (e: any) {
            console.error(`Error generating ${tool}:`, e);
            setError(prev => ({...prev, [tool]: e.message || `Failed to generate ${tool} plan.`}));
        } finally {
            setIsLoading(prev => ({ ...prev, [tool]: false }));
        }
    };
    
    return (
    <div className="space-y-8">
        <Card className="bg-gray-800/60">
            <h3 className="text-xl font-semibold text-white mb-4">Meal Plan Generator</h3>
            <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-300 mb-2">Approved Meal Plans ({client.generatedPlans.mealPlans.filter(p=>p.status === 'approved').length})</h4>
                 {client.generatedPlans.mealPlans.filter(p=>p.status === 'approved').length > 0 ? (
                    [...client.generatedPlans.mealPlans.filter(p=>p.status === 'approved')].reverse().map(plan => 
                        <details key={plan.id} className="bg-gray-900/40 border border-gray-700 rounded-lg p-3 mb-2">
                            <summary className="cursor-pointer font-semibold">Plan from {new Date(parseInt(plan.id.split('_')[1])).toLocaleDateString()}</summary>
                            <MealPlanDisplay plan={plan} clientName={client.name} />
                        </details>
                    )
                ) : (
                    <p className="text-gray-400 text-sm">No meal plans have been approved yet.</p>
                )}
            </div>
            <div className="mt-6 p-4 border-t border-gray-700">
                <h4 className="text-lg font-semibold text-gray-300 mb-2">Generate New Draft</h4>
                <TextArea label="Dietary Restrictions & Preferences" id="dietaryRestrictions" value={dietaryRestrictions} onChange={e => setDietaryRestrictions(e.target.value)} rows={3} />
                <Button onClick={() => handleGenerate('meal')} disabled={isLoading.meal} className="mt-4">
                    {isLoading.meal ? <Spinner /> : 'Generate Meal Plan'}
                </Button>
                {error.meal && <p className="text-red-400 mt-2 text-sm">{error.meal}</p>}
            </div>

            {editableMealPlan ? (
                <div>
                    <MealPlanDisplay plan={editableMealPlan} clientName={client.name} isDraft isEditable onPlanChange={setEditableMealPlan} />
                    <div className="flex gap-4 mt-4 p-4">
                        <Button onClick={() => { setDraftMealPlan(editableMealPlan); setEditableMealPlan(null); }}>Save Edits</Button>
                        <Button variant="secondary" onClick={() => { setEditableMealPlan(null); setDraftMealPlan(draftMealPlan); }}>Cancel Edits</Button>
                    </div>
                </div>
            ) : draftMealPlan && (
                <div>
                    <MealPlanDisplay plan={draftMealPlan} clientName={client.name} isDraft />
                    <div className="flex gap-4 mt-4 p-4">
                        <Button onClick={() => handleApprovePlan('meal')}>Approve & Send to Client</Button>
                        <Button variant="secondary" onClick={() => setEditableMealPlan(draftMealPlan)}>Edit</Button>
                        <Button variant="secondary" onClick={() => setDraftMealPlan(null)}>Discard</Button>
                    </div>
                </div>
            )}
        </Card>

        <Card className="bg-gray-800/60">
            <h3 className="text-xl font-semibold text-white mb-4">Workout Plan Generator</h3>
            <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-300 mb-2">Approved Workout Plans ({client.generatedPlans.workoutPlans.filter(p=>p.status === 'approved').length})</h4>
                {client.generatedPlans.workoutPlans.filter(p=>p.status === 'approved').length > 0 ? (
                    [...client.generatedPlans.workoutPlans.filter(p=>p.status === 'approved')].reverse().map(plan => (
                        <details key={plan.id} className="bg-gray-900/40 border border-gray-700 rounded-lg p-3 mb-2">
                            <summary className="cursor-pointer font-semibold">{plan.plan_name}</summary>
                            <WorkoutPlanDisplay plan={plan} clientName={client.name} />
                        </details>
                    ))
                ) : (
                    <p className="text-gray-400 text-sm">No workout plans have been approved yet.</p>
                )}
            </div>

            <div className="mt-6 p-4 border-t border-gray-700">
                <h4 className="text-lg font-semibold text-gray-300 mb-2">Generate New Draft</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select label="Days per week" value={daysPerWeek} onChange={e => setDaysPerWeek(e.target.value)}>
                        <option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option>
                    </Select>
                    <Input label="Available Equipment" value={availableEquipment} onChange={e => setAvailableEquipment(e.target.value)} />
                </div>
                <Button onClick={() => handleGenerate('workout')} disabled={isLoading.workout} className="mt-4">
                    {isLoading.workout ? <Spinner /> : 'Generate Workout Plan'}
                </Button>
                {error.workout && <p className="text-red-400 mt-2 text-sm">{error.workout}</p>}
            </div>
            
            {editableWorkoutPlan ? (
                <div>
                    <WorkoutPlanDisplay plan={editableWorkoutPlan} clientName={client.name} isDraft isEditable onPlanChange={setEditableWorkoutPlan} />
                    <div className="flex gap-4 mt-4 p-4">
                        <Button onClick={() => { setDraftWorkoutPlan(editableWorkoutPlan); setEditableWorkoutPlan(null); }}>Save Edits</Button>
                        <Button variant="secondary" onClick={() => { setEditableWorkoutPlan(null); setDraftWorkoutPlan(draftWorkoutPlan); }}>Cancel Edits</Button>
                    </div>
                </div>
            ) : draftWorkoutPlan && (
                <div>
                    <WorkoutPlanDisplay plan={draftWorkoutPlan} clientName={client.name} isDraft />
                    <div className="flex gap-4 mt-4 p-4">
                        <Button onClick={() => handleApprovePlan('workout')}>Approve & Send to Client</Button>
                        <Button variant="secondary" onClick={() => setEditableWorkoutPlan(draftWorkoutPlan)}>Edit</Button>
                        <Button variant="secondary" onClick={() => setDraftWorkoutPlan(null)}>Discard</Button>
                    </div>
                </div>
            )}
        </Card>
        
        <Card className="bg-gray-800/60">
            <h3 className="text-xl font-semibold text-white mb-4">Supplement & Specialty Tools</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h4 className="text-lg font-semibold text-gray-300 mb-2">Supplement Stack Generator</h4>
                    <Input label="Goal for this stack" value={supplementGoal} onChange={e => setSupplementGoal(e.target.value)} className="mb-4" />
                    <Button onClick={() => handleGenerate('supplement')} disabled={isLoading.supplement}>
                        {isLoading.supplement ? <Spinner /> : 'Generate Supplement Stack'}
                    </Button>
                    {error.supplement && <p className="text-red-400 mt-2 text-sm">{error.supplement}</p>}
                    {supplementStack && <SupplementStackDisplay stackData={supplementStack} />}
                </div>
                <div className="space-y-6">
                    <DrugInteractionAnalyzer />
                    <HealthyCheatMealGenerator />
                </div>
            </div>
        </Card>
    </div>
    );
};

const ClientBloodwork: React.FC<{ client: Client, onUpdateClient: (client: Client) => Promise<void> }> = ({ client, onUpdateClient }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const handleAnalyze = async (submission: BloodworkSubmission) => {
        setIsLoading(true);
        setError(null);
        try {
            const analysis = await analyzeBloodwork(submission.text, client.profile.bloodType);
            const updatedSubmissions = client.bloodworkHistory.map(s => 
                s.date === submission.date ? { ...s, analysis, status: 'Reviewed' as const } : s
            );
            await onUpdateClient({ ...client, bloodworkHistory: updatedSubmissions });
        } catch(e: any) {
            setError(e.message || "Failed to analyze bloodwork.");
        } finally {
            setIsLoading(false);
        }
    }
    
    const getStatusColor = (status: BloodworkSubmission['status']) => {
        switch (status) {
            case 'Reviewed': return 'bg-green-500/20 text-green-300';
            case 'Pending Review': return 'bg-yellow-500/20 text-yellow-300';
        }
    };
    
    return (
        <div>
            <h3 className="text-xl font-semibold text-white mb-4">Bloodwork Submissions</h3>
             {client.bloodworkHistory.length > 0 ? (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {[...client.bloodworkHistory].reverse().map((submission) => (
                    <Card key={submission.date} className="bg-gray-900/40">
                         <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold text-white">Submitted: {new Date(submission.date).toLocaleDateString()}</h4>
                            <span className={`text-xs font-bold py-1 px-2 rounded-full ${getStatusColor(submission.status)}`}>{submission.status}</span>
                         </div>
                         <pre className="whitespace-pre-wrap font-sans text-xs bg-gray-900/50 p-2 rounded-md">{submission.text}</pre>
                         
                         {submission.analysis && (
                            <div className="mt-4 pt-4 border-t border-gray-700">
                                <h5 className="font-bold text-red-400">System Analysis</h5>
                                <pre className="whitespace-pre-wrap font-sans text-sm mt-2 bg-gray-900/50 p-3 rounded-md">{submission.analysis}</pre>
                            </div>
                         )}

                         {submission.status === 'Pending Review' && (
                             <div className="mt-4">
                                 <Button onClick={() => handleAnalyze(submission)} disabled={isLoading}>
                                     {isLoading ? <Spinner/> : <><i className="fa-solid fa-wand-magic-sparkles mr-2"></i>Analyze Now</>}
                                 </Button>
                                 {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
                             </div>
                         )}
                    </Card>
                ))}
                </div>
             ) : (
                <p className="text-gray-400">This client has not submitted any bloodwork reports.</p>
             )}
        </div>
    );
};

const ClientTestimonialManager: React.FC<{ client: Client, onUpdateClient: (client: Client) => Promise<void> }> = ({ client, onUpdateClient }) => {
    
    const handleStatusChange = async (testimonialDate: string, newStatus: ClientTestimonial['status']) => {
        const updatedTestimonials = client.clientTestimonials.map(t => 
            t.date === testimonialDate ? { ...t, status: newStatus } : t
        );
        await onUpdateClient({ ...client, clientTestimonials: updatedTestimonials });
    };

    const getStatusColor = (status: ClientTestimonial['status']) => {
        switch (status) {
            case 'Approved': return 'bg-green-500/20 text-green-300';
            case 'Pending': return 'bg-yellow-500/20 text-yellow-300';
            case 'Rejected': return 'bg-red-500/20 text-red-300';
        }
    };
    
    const StarRating = ({ rating }: { rating: number }) => (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <i key={i} className={`fa-solid fa-star ${i < rating ? 'text-yellow-400' : 'text-gray-600'}`}></i>
            ))}
        </div>
    );

    return (
        <div>
            <h3 className="text-xl font-semibold text-white mb-4">Client Testimonials ({client.clientTestimonials.length})</h3>
            {client.clientTestimonials.length > 0 ? (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    {[...client.clientTestimonials].reverse().map(testimonial => (
                        <Card key={testimonial.date} className="bg-gray-900/40">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <StarRating rating={testimonial.rating} />
                                    <p className="text-sm text-gray-400 mt-1">Submitted: {new Date(testimonial.date).toLocaleString()}</p>
                                </div>
                                <span className={`text-xs font-bold py-1 px-2 rounded-full ${getStatusColor(testimonial.status)}`}>{testimonial.status}</span>
                            </div>
                            <p className="italic text-gray-300">"{testimonial.text}"</p>
                            
                            {testimonial.status === 'Pending' && (
                                <div className="mt-4 pt-3 border-t border-gray-700 flex gap-4">
                                    <Button onClick={() => handleStatusChange(testimonial.date, 'Approved')} className="bg-green-600 hover:bg-green-700 focus:ring-green-500">
                                        <i className="fa-solid fa-check mr-2"></i>Approve
                                    </Button>
                                    <Button onClick={() => handleStatusChange(testimonial.date, 'Rejected')} variant="secondary">
                                        <i className="fa-solid fa-times mr-2"></i>Reject
                                    </Button>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            ) : (
                <p className="text-gray-400">This client has not submitted any testimonials.</p>
            )}
        </div>
    );
};

const PlaceholderComponent: React.FC<{title: string}> = ({title}) => (
    <Card className="text-center">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="text-gray-400 mt-2">This feature is under construction.</p>
    </Card>
);

const ClientDetail: React.FC<ClientDetailProps> = ({ client, onBack, onUpdateClient, onLoginAsClient }) => {
    
    if (client.status === 'prospect') {
        return (
            <div>
                <Button onClick={onBack} variant="secondary" className="mb-6">
                    <i className="fa-solid fa-arrow-left mr-2"></i>
                    Back to Client List
                </Button>
                <ClientOnboarding client={client} onUpdateClient={onUpdateClient} />
            </div>
        );
    }
    
    const TABS = ['Profile', 'Plans & Generators', 'Bloodwork', 'Testimonials', 'Check-ins', 'Payments', 'Communication'];
    const [activeTab, setActiveTab] = useState(TABS[0]);
    
    const renderTabContent = () => {
        switch(activeTab) {
            case 'Profile':
                return <ClientProfile client={client} />;
            case 'Plans & Generators':
                return <ClientPlanGenerators client={client} onUpdateClient={onUpdateClient} />;
            case 'Bloodwork':
                return <ClientBloodwork client={client} onUpdateClient={onUpdateClient} />;
            case 'Testimonials':
                return <ClientTestimonialManager client={client} onUpdateClient={onUpdateClient} />;
            case 'Check-ins':
                return <PlaceholderComponent title="Client Check-ins"/>
            case 'Payments':
                return <PlaceholderComponent title="Client Payments"/>
            case 'Communication':
                return <PlaceholderComponent title="Client Communication"/>
            default:
                return null;
        }
    }

    return (
        <div>
             <div className="flex items-center gap-4 mb-6">
                <Button onClick={onBack} variant="secondary">
                    <i className="fa-solid fa-arrow-left mr-2"></i>
                    Back to Client List
                </Button>
                <Button onClick={onLoginAsClient}>
                    <i className="fa-solid fa-eye mr-2"></i>
                    View as Client
                </Button>
            </div>
            <Card>
                <Tabs tabs={TABS} activeTab={activeTab} onTabClick={setActiveTab} />
                <div className="mt-8">
                    {renderTabContent()}
                </div>
            </Card>
        </div>
    );
};

export default ClientDetail;