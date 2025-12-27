import React, { useState, FormEvent, useRef, useEffect } from 'react';
import type { Client, BloodworkSubmission, MealPlan, WorkoutPlan, ClientTestimonial, BloodDonationInfo } from '../types.ts';
import { Button, Card, TextArea, Tabs, Input, Select, Spinner } from './ui/common.tsx';
import { extractTextFromImage } from '../services/geminiService.ts';
import MealPlanDisplay from './shared/MealPlanDisplay.tsx';
import WorkoutPlanDisplay from './shared/WorkoutPlanDisplay.tsx';

// --- Web Speech API Type Definitions for TypeScript ---
interface SpeechRecognitionStatic {
    new(): SpeechRecognition;
}
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onend: () => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
}
interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
}
interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
}

declare var SpeechRecognition: SpeechRecognitionStatic;
declare var webkitSpeechRecognition: SpeechRecognitionStatic;

interface ClientPortalProps {
  client: Client;
  onLogout: () => void;
  onUpdateClient: (client: Client) => Promise<void>;
}

const BloodDonationManager: React.FC<{ client: Client, onUpdateClient: (client: Client) => Promise<void> }> = ({ client, onUpdateClient }) => {
    const [status, setStatus] = useState<BloodDonationInfo['status']>(client.bloodDonationStatus?.status || 'Unknown');
    const [notes, setNotes] = useState(client.bloodDonationStatus?.notes || '');
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const updatedStatus: BloodDonationInfo = {
            status,
            notes,
            lastChecked: new Date().toISOString(),
        };
        await onUpdateClient({ ...client, bloodDonationStatus: updatedStatus });
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
    };

    return (
        <Card className="bg-gray-900/40">
            <h3 className="text-lg font-bold text-white mb-3">Update Blood Donation Status</h3>
            <p className="text-sm text-gray-400 mb-4">Keeping this updated is important for health tracking, especially if your hematocrit levels are a concern.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Select
                    label="Current Eligibility Status"
                    id="donationStatus"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as BloodDonationInfo['status'])}
                >
                    <option value="Unknown">Unknown</option>
                    <option value="Eligible">Eligible to Donate</option>
                    <option value="Ineligible - Temporary">Ineligible (Temporary)</option>
                    <option value="Ineligible - Permanent">Ineligible (Permanent)</option>
                </Select>
                <TextArea
                    label="Notes (Optional)"
                    id="donationNotes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="e.g., Deferred for 2 months due to recent travel. Next eligibility date is..."
                />
                <Button type="submit" className="w-full">
                    <i className="fa-solid fa-save mr-2"></i>
                    Save Status
                </Button>
                {showSuccessMessage && <p className="text-green-400 text-center text-sm">Your donation status has been updated!</p>}
            </form>
        </Card>
    );
};

const HealthUploads: React.FC<{ client: Client, onUpdateClient: (client: Client) => Promise<void> }> = ({ client, onUpdateClient }) => {
  const [newBloodworkText, setNewBloodworkText] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      const recognition: SpeechRecognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        setNewBloodworkText(prev => prev ? `${prev}\n${finalTranscript}` : finalTranscript);
      };
      recognition.onend = () => {
        setIsListening(false);
      };
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setError(`Speech recognition error: ${event.error}. Please ensure microphone permissions are enabled.`);
        setIsListening(false);
      };
      recognitionRef.current = recognition;
    }
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        setError('Only image files (JPG, PNG, WebP) are supported for automatic text extraction.');
        return;
    }

    setIsProcessing(true);
    setError(null);
    try {
        const text = await extractTextFromImage(file);
        setNewBloodworkText(prev => prev ? `${prev}\n\n--- Extracted from Image ---\n${text}` : text);
    } catch (e: any) {
        setError(e.message);
    } finally {
        setIsProcessing(false);
    }
    event.target.value = ''; // Allow re-uploading the same file
  };
  
  const handleMicClick = () => {
    if (!recognitionRef.current) {
      setError("Speech recognition is not supported by your browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setError(null);
      setNewBloodworkText(prev => prev ? `${prev}\n` : ''); // Add a newline before dictating
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newBloodworkText.trim()) return;

    const newSubmission: BloodworkSubmission = {
      date: new Date().toISOString(),
      text: newBloodworkText,
      status: 'Pending Review',
    };

    const updatedClient: Client = {
      ...client,
      bloodworkHistory: [...client.bloodworkHistory, newSubmission],
    };

    await onUpdateClient(updatedClient);
    setNewBloodworkText('');
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };
  
  const getStatusColor = (status: BloodworkSubmission['status']) => {
    switch (status) {
        case 'Reviewed': return 'bg-green-500/20 text-green-300';
        case 'Pending Review': return 'bg-yellow-500/20 text-yellow-300';
    }
  };

  return (
    <div className="mt-8 space-y-8">
        <BloodDonationManager client={client} onUpdateClient={onUpdateClient} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-gray-900/40">
                <h3 className="text-lg font-bold text-white mb-3">Submit New Bloodwork Report</h3>
                <p className="text-sm text-gray-400 mb-4">Use one of the options below to easily input your report, then review the text and submit.</p>
                
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                <input type="file" ref={cameraInputRef} onChange={handleFileChange} accept="image/*" capture="environment" className="hidden" />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={isProcessing}><i className="fa-solid fa-upload mr-2"></i>Upload File</Button>
                    <Button variant="secondary" onClick={() => cameraInputRef.current?.click()} disabled={isProcessing}><i className="fa-solid fa-camera mr-2"></i>Use Camera</Button>
                    <Button variant="secondary" onClick={handleMicClick} className={isListening ? 'bg-red-700' : ''}><i className={`fa-solid fa-microphone mr-2 ${isListening ? 'fa-beat-fade' : ''}`}></i>{isListening ? 'Stop' : 'Dictate'}</Button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <TextArea
                        label="Review Extracted Text"
                        id="bloodworkText"
                        value={newBloodworkText}
                        onChange={(e) => setNewBloodworkText(e.target.value)}
                        rows={12}
                        placeholder="Upload, capture, or dictate your report. The text will appear here for you to review before submitting."
                        required
                        disabled={isProcessing}
                    />
                    {isProcessing && <div className="flex items-center text-blue-300"><Spinner /> <span className="ml-2">Analyzing image...</span></div>}
                     {error && <p className="text-red-400 text-sm">{error}</p>}
                    
                    <Button type="submit" className="w-full" disabled={isProcessing}>
                        <i className="fa-solid fa-paper-plane mr-2"></i>
                        Submit for Review
                    </Button>
                    {showSuccessMessage && <p className="text-green-400 text-center text-sm">Your report has been submitted successfully!</p>}
                </form>
            </Card>

            <div className="space-y-4">
                 <h3 className="text-lg font-bold text-white mb-3">Submission History</h3>
                 {client.bloodworkHistory.length > 0 ? (
                    <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-4">
                    {[...client.bloodworkHistory].reverse().map((submission, index) => (
                         <details key={index} className="bg-gray-900/40 border border-gray-700 rounded-lg p-3">
                            <summary className="cursor-pointer font-semibold flex justify-between items-center text-sm">
                                <span>Submitted: {new Date(submission.date).toLocaleDateString()}</span>
                                <span className={`text-xs font-bold py-1 px-2 rounded-full ${getStatusColor(submission.status)}`}>
                                    {submission.status}
                                </span>
                            </summary>
                             <div className="mt-3 pt-3 border-t border-gray-600">
                                <h4 className="font-bold text-gray-300 text-xs uppercase mb-1">Submitted Data</h4>
                                <pre className="whitespace-pre-wrap font-sans text-xs bg-gray-900/50 p-2 rounded-md">{submission.text}</pre>
                                {submission.analysis && (
                                    <div className="mt-3">
                                        <h4 className="font-bold text-gray-300 text-xs uppercase mb-1">Coach's Analysis</h4>
                                         <pre className="whitespace-pre-wrap font-sans text-xs bg-gray-900/50 p-2 rounded-md border border-gray-700/50">{submission.analysis}</pre>
                                    </div>
                                )}
                            </div>
                        </details>
                    ))}
                    </div>
                 ) : (
                    <Card className="bg-gray-900/40 text-center py-8">
                        <p className="text-gray-400">You have not submitted any reports yet.</p>
                    </Card>
                 )}
            </div>
        </div>
    </div>
  );
};

const ClientPlans: React.FC<{ client: Client }> = ({ client }) => {
    const approvedMealPlans = client.generatedPlans.mealPlans.filter(p => p.status === 'approved');
    const approvedWorkoutPlans = client.generatedPlans.workoutPlans.filter(p => p.status === 'approved');
    
    const latestMealPlan = approvedMealPlans.length > 0 ? [...approvedMealPlans].reverse()[0] : null;
    const latestWorkoutPlan = approvedWorkoutPlans.length > 0 ? [...approvedWorkoutPlans].reverse()[0] : null;

    return (
        <div className="mt-8 space-y-8">
            <div>
                <h3 className="text-xl font-bold text-white mb-4">My Meal Plan</h3>
                {latestMealPlan ? (
                    <MealPlanDisplay plan={latestMealPlan} clientName={client.name} />
                ) : (
                    <p className="text-gray-400">Your coach has not sent you a meal plan yet. Complete your profile so they can get started!</p>
                )}
            </div>
            <hr className="border-gray-700"/>
             <div>
                <h3 className="text-xl font-bold text-white mb-4">My Workout Plan</h3>
                {latestWorkoutPlan ? (
                     <WorkoutPlanDisplay plan={latestWorkoutPlan} clientName={client.name} />
                ) : (
                    <p className="text-gray-400">Your coach has not sent you a workout plan yet. Complete your profile so they can get started!</p>
                )}
            </div>
        </div>
    )
};

const ClientProfileEditor: React.FC<{ client: Client, onUpdateClient: (client: Client) => Promise<void> }> = ({ client, onUpdateClient }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Client>(client);

    useEffect(() => {
        // When client data is updated from parent, refresh the form data if not in editing mode
        if (!isEditing) {
            setFormData(client);
        }
    }, [client, isEditing]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const keys = name.split('.');
        setFormData(prevData => {
            const newData = JSON.parse(JSON.stringify(prevData)); // Deep copy to avoid mutation issues
            let currentLevel: any = newData;
            for (let i = 0; i < keys.length - 1; i++) {
                currentLevel = currentLevel[keys[i]];
            }
            currentLevel[keys[keys.length - 1]] = value;
            return newData;
        });
    };

    const handleSave = async () => {
        await onUpdateClient(formData);
        setIsEditing(false);
    };

    if (!isEditing) {
        return (
            <div className="mt-8">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">My Profile & Health Data</h3>
                    <Button onClick={() => setIsEditing(true)}>
                        <i className="fa-solid fa-pencil mr-2"></i>
                        Edit My Information
                    </Button>
                </div>
                <div className="space-y-4 text-gray-300">
                    <p><strong>Main Goal:</strong> {client.goal}</p>
                    <p><strong>Work Schedule:</strong> {client.intakeData.workSchedule}</p>
                    <p><strong>Known Health Conditions:</strong> {client.intakeData.healthConditions || 'Not specified.'}</p>
                    <p><strong>Allergies:</strong> {client.intakeData.allergies || 'Not specified.'}</p>
                    <p><strong>Injuries/Limitations:</strong> {client.intakeData.injuries}</p>
                    <p><strong>Dietary Preferences:</strong> {client.intakeData.diet}</p>
                    <p><strong>Current Medications:</strong> {client.intakeData.meds}</p>
                    <div className="pt-4 mt-4 border-t border-gray-700/50">
                        <h4 className="text-lg font-semibold text-white">Holistic Health Log</h4>
                        <p className="mt-2"><strong>Sleep Quality:</strong> {client.holisticHealth?.sleepQuality || 'Not specified.'}</p>
                        <p><strong>Stress Level:</strong> {client.holisticHealth?.stressLevel || 'Not specified.'}</p>
                        <p><strong>Energy Level:</strong> {client.holisticHealth?.energyLevel || 'Not specified.'}</p>
                        <div>
                            <strong>Current Herbal Supplements:</strong>
                             <p className="whitespace-pre-wrap mt-1 p-2 bg-gray-800/50 rounded-md text-sm">{client.holisticHealth?.herbalLog || 'Not specified.'}</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="mt-8">
            <h3 className="text-xl font-bold text-white mb-6">Edit My Information</h3>
            <Card className="bg-gray-900/40">
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Main Goal" name="goal" value={formData.goal} onChange={handleInputChange} placeholder="e.g., Build muscle, lose fat"/>
                        <Input label="Age" name="profile.age" type="number" value={formData.profile.age} onChange={handleInputChange} />
                        <Input label="Weight (kg)" name="profile.weight" type="number" value={formData.profile.weight} onChange={handleInputChange} />
                        <Input label="Height (cm)" name="profile.height" type="number" value={formData.profile.height} onChange={handleInputChange} />
                         <Select label="Gender" name="profile.gender" value={formData.profile.gender} onChange={handleInputChange}>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </Select>
                        <Select label="Experience Level" name="profile.experience" value={formData.profile.experience} onChange={handleInputChange}>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </Select>
                    </div>
                    
                    <TextArea label="Work Schedule" name="intakeData.workSchedule" value={formData.intakeData.workSchedule} onChange={handleInputChange} rows={2} placeholder="e.g., Mon-Fri 9am-5pm, lunch at 1pm"/>
                    <TextArea label="Known Health Conditions" name="intakeData.healthConditions" value={formData.intakeData.healthConditions} onChange={handleInputChange} rows={2} placeholder="e.g., High blood pressure, Type 2 Diabetes"/>
                    <TextArea label="Allergies" name="intakeData.allergies" value={formData.intakeData.allergies} onChange={handleInputChange} rows={2} placeholder="e.g., Peanuts, shellfish, gluten"/>
                    <TextArea label="Injuries or Limitations" name="intakeData.injuries" value={formData.intakeData.injuries} onChange={handleInputChange} rows={3} placeholder="e.g., Right knee pain, avoid high-impact cardio"/>
                    <TextArea label="Dietary Preferences/Restrictions" name="intakeData.diet" value={formData.intakeData.diet} onChange={handleInputChange} rows={3} placeholder="e.g., Vegetarian, allergic to nuts"/>
                    <TextArea label="Current Medications/Supplements" name="intakeData.meds" value={formData.intakeData.meds} onChange={handleInputChange} rows={3} placeholder="e.g., Daily multivitamin, fish oil"/>

                    <div className="pt-6 border-t border-gray-700">
                        <h4 className="text-lg font-semibold text-white">Holistic Health Log</h4>
                        <p className="text-gray-400 text-sm mb-4">Information for your herbalist or holistic coach.</p>
                        <div className="space-y-4">
                            <Input label="Typical Sleep Quality" name="holisticHealth.sleepQuality" value={formData.holisticHealth?.sleepQuality || ''} onChange={handleInputChange} placeholder="e.g., 7-8 hours, deep sleep"/>
                            <Input label="Average Stress Level" name="holisticHealth.stressLevel" value={formData.holisticHealth?.stressLevel || ''} onChange={handleInputChange} placeholder="e.g., Low, manageable, high due to work"/>
                            <Input label="Average Energy Level" name="holisticHealth.energyLevel" value={formData.holisticHealth?.energyLevel || ''} onChange={handleInputChange} placeholder="e.g., High in morning, dips in afternoon"/>
                            <TextArea label="Current Herbal Supplements Log" name="holisticHealth.herbalLog" value={formData.holisticHealth?.herbalLog || ''} onChange={handleInputChange} rows={4} placeholder="e.g., Ashwagandha 600mg/day, Turmeric 1g/day"/>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="submit">Save Changes</Button>
                        <Button variant="secondary" onClick={() => { setIsEditing(false); setFormData(client); }}>Cancel</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

const ClientReviewForm: React.FC<{ client: Client, onUpdateClient: (client: Client) => Promise<void> }> = ({ client, onUpdateClient }) => {
    const [rating, setRating] = useState(5);
    const [text, setText] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;

        const newTestimonial: ClientTestimonial = {
            date: new Date().toISOString(),
            rating,
            text,
            status: 'Pending',
        };

        const updatedClient = {
            ...client,
            clientTestimonials: [...client.clientTestimonials, newTestimonial]
        };
        await onUpdateClient(updatedClient);
        
        setText('');
        setRating(5);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 4000);
    };
    
    const getStatusColor = (status: ClientTestimonial['status']) => {
        switch (status) {
            case 'Approved': return 'bg-green-500/20 text-green-300';
            case 'Pending': return 'bg-yellow-500/20 text-yellow-300';
            case 'Rejected': return 'bg-red-500/20 text-red-300';
        }
    };

    return (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-gray-900/40">
                <h3 className="text-lg font-bold text-white mb-3">Leave a Review</h3>
                <p className="text-sm text-gray-400 mb-4">Your feedback is incredibly valuable. Please share your experience!</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Rating</label>
                        <div className="flex space-x-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button key={star} type="button" onClick={() => setRating(star)} aria-label={`Rate ${star} stars`}>
                                    <i className={`fa-solid fa-star text-2xl transition-colors ${rating >= star ? 'text-yellow-400' : 'text-gray-600 hover:text-gray-500'}`}></i>
                                </button>
                            ))}
                        </div>
                    </div>
                    <TextArea
                        label="Your Review"
                        id="reviewText"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        rows={6}
                        placeholder="Tell us about your journey..."
                        required
                    />
                    <Button type="submit" className="w-full">
                        <i className="fa-solid fa-paper-plane mr-2"></i>
                        Submit Review
                    </Button>
                    {showSuccess && <p className="text-green-400 text-center text-sm">Thank you! Your review has been submitted for approval.</p>}
                </form>
            </Card>
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-3">My Submitted Reviews</h3>
                {client.clientTestimonials.length > 0 ? (
                     <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
                        {[...client.clientTestimonials].reverse().map(t => (
                            <Card key={t.date} className="bg-gray-900/40">
                                <div className="flex justify-between items-center mb-2">
                                     <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <i key={i} className={`fa-solid fa-star ${i < t.rating ? 'text-yellow-400' : 'text-gray-600'}`}></i>
                                        ))}
                                    </div>
                                    <span className={`text-xs font-bold py-1 px-2 rounded-full ${getStatusColor(t.status)}`}>{t.status}</span>
                                </div>
                                <p className="text-sm text-gray-400 mb-3">Submitted: {new Date(t.date).toLocaleDateString()}</p>
                                <p className="italic text-gray-300">"{t.text}"</p>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="bg-gray-900/40 text-center py-8">
                        <p className="text-gray-400">You have not submitted any reviews yet.</p>
                    </Card>
                )}
            </div>
        </div>
    );
};


const ClientPortal: React.FC<ClientPortalProps> = ({ client, onLogout, onUpdateClient }) => {
  const TABS = ['My Plans', 'My Profile', 'My Health Uploads', 'Submit Review'];
  const [activeTab, setActiveTab] = useState(TABS[0]);
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-6 md:p-8">
      <header className="flex justify-between items-center mb-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Welcome, <span className="text-red-400">{client.name}</span>
          </h1>
          <p className="text-gray-400">Your personal client portal.</p>
        </div>
        <div className="flex items-center gap-4">
            <a href="https://www.rippedcityinc.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-red-400 transition-colors font-semibold hidden sm:flex items-center gap-2">
                <i className="fa-solid fa-shirt"></i> Shop Apparel
            </a>
            <Button onClick={onLogout} variant="secondary">
              <i className="fa-solid fa-power-off mr-0 md:mr-2"></i>
              <span className="hidden md:inline">Logout</span>
            </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {client.goal === 'Not Set' && (
          <Card className="mb-6 bg-blue-900/40 border-blue-700 text-center">
            <h2 className="text-xl font-bold text-white">Welcome to the Portal!</h2>
            <p className="text-gray-300 mt-2">
                Please complete your profile so your coach can create your personalized plans. Go to the{' '}
                <button onClick={() => setActiveTab('My Profile')} className="font-bold text-red-400 hover:underline">
                    My Profile
                </button>
                {' '}tab to get started.
            </p>
          </Card>
        )}

        <Card>
            <Tabs tabs={TABS} activeTab={activeTab} onTabClick={setActiveTab} />
            {activeTab === 'My Plans' && <ClientPlans client={client} />}
            {activeTab === 'My Profile' && <ClientProfileEditor client={client} onUpdateClient={onUpdateClient} />}
            {activeTab === 'My Health Uploads' && <HealthUploads client={client} onUpdateClient={onUpdateClient} />}
            {activeTab === 'Submit Review' && <ClientReviewForm client={client} onUpdateClient={onUpdateClient} />}
        </Card>
      </main>
    </div>
  );
};

export default ClientPortal;