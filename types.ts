export enum Tool {
  MealPlan = 'Meal Plan Generator',
  Workout = 'Workout Generator',
  Supplements = 'Supplement Stack Generator',
  Bloodwork = 'Bloodwork Analyzer',
  Intake = 'Client Intake',
  Protocols = 'Wellness Protocols',
  Clients = 'Clients',
  Financials = 'Financials',
  Settings = 'Settings',
}

export interface Meal {
  name: string;
  description: string;
  calories: number;
  macronutrients: {
    protein: string;
    carbohydrates: string;
    fat: string;
  };
}

export interface MealPlan {
  id: string;
  status: 'draft' | 'approved';
  daily_calories_goal: number;
  meals: Meal[];
}

export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  notes?: string;
}

export interface WorkoutDay {
  day: number;
  focus: string;
  exercises: Exercise[];
  recovery_notes?: string;
}

export interface WorkoutPlan {
  id: string;
  status: 'draft' | 'approved';
  plan_name: string;
  weekly_schedule: WorkoutDay[];
}

export interface Supplement {
    name: string;
    dosage: string;
    timing: string;
    purpose: string;
}

export interface SupplementStack {
    goal: string;
    stack: Supplement[];
}

export interface CheatMeal {
    meal_name: string;
    description: string;
    healthier_alternatives: string[];
    portion_control_tips: string;
}

export interface Testimonial {
  name:string;
  quote: string;
  imageUrl: string;
}

export interface ProgressLog {
  date: string;
  weight: number;
  notes: string;
}

export interface Payment {
  id: string;
  service: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  issueDate: string;
  dueDate: string;
}

export interface Message {
  id: string;
  sender: 'coach' | 'client';
  text: string;
  timestamp: string;
}

export interface BloodworkSubmission {
  date: string;
  text: string;
  analysis?: string;
  status: 'Pending Review' | 'Reviewed';
}

export interface StorePrice {
    storeName: string;
    price: string; // e.g., "$7.99/lb"
}

export interface GroceryListItem {
    name: string;
    quantity: string;
    storePrices: StorePrice[];
}

export interface GroceryListCategory {
    category: string;
    items: GroceryListItem[];
}

export interface StructuredGroceryList {
    categories: GroceryListCategory[];
    shoppingTips: string;
    disclaimer: string;
}

export interface ClientTestimonial {
  date: string;
  rating: number; // 1-5 stars
  text: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface Client {
  id: string;
  created_at: string;
  name: string;
  email: string;
  goal: string;
  status: 'prospect' | 'active' | 'inactive';
  paymentStatus?: 'unpaid' | 'paid';
  profile: {
    age: string;
    gender: 'male' | 'female';
    weight: string;
    height: string;
    experience: 'beginner' | 'intermediate' | 'advanced';
    activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
    bloodType?: 'A' | 'B' | 'AB' | 'O' | 'Unknown';
    status: 'natural' | 'enhanced';
    notificationPreferences: {
      email: boolean;
      sms: boolean;
      inApp: boolean;
    };
  };
  intakeData: {
    injuries: string;
    meds: string;
    diet: string;
    workSchedule: string;
    healthConditions: string;
    allergies: string;
  },
  progress: ProgressLog[];
  generatedPlans: {
    mealPlans: MealPlan[];
    workoutPlans: WorkoutPlan[];
  },
  payments: Payment[];
  communication: {
    messages: Message[];
  };
  bloodworkHistory: BloodworkSubmission[];
  clientTestimonials: ClientTestimonial[];
}

export interface ProtocolDetailSection {
    title: string;
    content: string | string[];
    isWarning?: boolean;
}

export interface Protocol {
  id: string;
  name: string;
  category: 
    | 'Overviews'
    | 'Safety Notes'
    | 'Testosterone Bases'
    | 'Mass Builders'
    | 'Strength & Power Builders'
    | 'Cutting & Hardening Compounds'
    | 'Specialty Compounds'
    | 'SARMs'
    | 'Peptides & Growth Factors'
    | 'Fat Burners & Cutting Aids'
    | 'Herbal & Natural Support'
    | 'Cycle Support & AIs'
    | 'Post Cycle Therapy (PCT)'
    | 'Insulin & Growth Factors'
    | 'Digestive Health & Detox';
  description: string;
  details: ProtocolDetailSection[];
}

export interface SiteContent {
  heroVideo?: string;
  heroImage: string;
  transformationBefore: string;
  transformationAfter: string;
}