import type { Testimonial, Client } from '../types.ts';

export const mockTestimonials: Testimonial[] = [
  {
    name: "John D.",
    quote: "Working with Tyrone completely changed my perspective on fitness. The custom plans were a game-changer, and the personal support was incredible. I lost 40 pounds and feel amazing!",
    imageUrl: "https://picsum.photos/seed/client1/100/100"
  },
  {
    name: "Sarah K.",
    quote: "I've tried so many programs, but this is the first one that stuck. The combination of data-driven plans and genuine encouragement made all the difference. I'm stronger than I've ever been.",
    imageUrl: "https://picsum.photos/seed/client2/100/100"
  },
  {
    name: "Mike R.",
    quote: "As someone with a busy schedule, the efficiency of this program was key. The workouts were tough but effective, and the meal plans were easy to follow. Highly recommend!",
    imageUrl: "https://picsum.photos/seed/client3/100/100"
  }
];

export const mockClients: Client[] = [
  {
    id: 'client-1',
    created_at: new Date('2023-01-15T09:00:00Z').toISOString(),
    name: 'Alex Donegan',
    email: 'alex.d@example.com',
    goal: 'Body Recomposition: Lose 10kg fat, gain 5kg muscle',
    status: 'active',
    paymentStatus: 'paid',
    profile: {
      age: '32',
      gender: 'male',
      weight: '90',
      height: '180',
      experience: 'intermediate',
      activityLevel: 'moderately_active',
      bloodType: 'O',
      status: 'natural',
      notificationPreferences: { email: true, sms: false, inApp: true },
    },
    intakeData: {
      injuries: 'None',
      meds: 'Daily multivitamin',
      diet: 'Prefers whole foods, avoids processed sugar.',
      workSchedule: 'Mon-Fri, 9am-6pm desk job',
      healthConditions: 'None',
      allergies: 'None',
    },
    progress: [
      { date: new Date('2023-10-01T09:00:00Z').toISOString(), weight: 90, notes: 'Starting week 1.' },
      { date: new Date('2023-10-08T09:00:00Z').toISOString(), weight: 89.5, notes: 'Feeling good, energy is high.' },
      { date: new Date('2023-10-15T09:00:00Z').toISOString(), weight: 89, notes: 'Hit personal best on deadlift.' },
    ],
    generatedPlans: {
      mealPlans: [
        {
          id: 'mp-1',
          status: 'approved',
          daily_calories_goal: 2400,
          meals: [
            { name: 'Breakfast', description: 'Oatmeal with protein powder and berries', calories: 500, macronutrients: { protein: '40g', carbohydrates: '60g', fat: '10g' } },
            { name: 'Lunch', description: 'Grilled chicken breast, quinoa, and steamed broccoli', calories: 600, macronutrients: { protein: '50g', carbohydrates: '70g', fat: '12g' } },
            { name: 'Dinner', description: 'Salmon fillet with sweet potato and asparagus', calories: 700, macronutrients: { protein: '45g', carbohydrates: '55g', fat: '30g' } },
          ],
        },
      ],
      workoutPlans: [
        {
          id: 'wp-1',
          status: 'approved',
          plan_name: 'Intermediate Hypertrophy - Phase 1',
          weekly_schedule: [
            { day: 1, focus: 'Push Day (Chest, Shoulders, Triceps)', exercises: [{ name: 'Bench Press', sets: '4', reps: '8-10', rest: '90s' }], recovery_notes: 'Stretch pecs and shoulders.' },
            { day: 2, focus: 'Pull Day (Back, Biceps)', exercises: [{ name: 'Pull-ups', sets: '4', reps: 'As many as possible', rest: '120s' }], recovery_notes: 'Foam roll lats.' },
          ],
        },
      ],
    },
    payments: [{ id: 'payment-1', service: 'Monthly Coaching', amount: 250, status: 'Paid', issueDate: new Date('2023-10-01').toISOString(), dueDate: new Date('2023-10-01').toISOString() }],
    communication: { messages: [] },
    bloodworkHistory: [],
    clientTestimonials: [],
    bloodDonationStatus: { status: 'Eligible', lastChecked: new Date('2023-09-20').toISOString(), notes: 'Cleared for donation.' },
    holisticHealth: { sleepQuality: 'Good, 7-8 hours', stressLevel: 'Low', energyLevel: 'High', herbalLog: 'None' },
  },
  {
    id: 'client-2',
    created_at: new Date().toISOString(),
    name: 'Brenda Miller',
    email: 'brenda.m@example.com',
    goal: 'Not Set',
    status: 'prospect',
    paymentStatus: 'unpaid',
    profile: {
      age: '', gender: 'female', weight: '', height: '', experience: 'beginner', activityLevel: 'sedentary', bloodType: 'Unknown', status: 'natural',
      notificationPreferences: { email: true, sms: false, inApp: true }
    },
    intakeData: { injuries: '', meds: '', diet: '', workSchedule: '', healthConditions: '', allergies: '' },
    progress: [], generatedPlans: { mealPlans: [], workoutPlans: [] }, payments: [], communication: { messages: [] }, bloodworkHistory: [], clientTestimonials: [],
    bloodDonationStatus: { status: 'Unknown', lastChecked: '', notes: '' },
    holisticHealth: { sleepQuality: '', stressLevel: '', energyLevel: '', herbalLog: '' },
  },
  {
    id: 'client-3',
    created_at: new Date('2023-05-10T09:00:00Z').toISOString(),
    name: 'Carlos Santos',
    email: 'carlos.s@example.com',
    goal: 'Contest Prep for Men\'s Physique',
    status: 'active',
    paymentStatus: 'paid',
    profile: {
      age: '28',
      gender: 'male',
      weight: '85',
      height: '175',
      experience: 'advanced',
      activityLevel: 'very_active',
      bloodType: 'A',
      status: 'enhanced',
      notificationPreferences: { email: true, sms: true, inApp: true },
    },
    intakeData: {
      injuries: 'Slight left shoulder impingement, avoid direct overhead pressing.',
      meds: 'TUDCA, Fish Oil',
      diet: 'Low carb, high protein',
      workSchedule: 'Variable, shift work',
      healthConditions: 'None',
      allergies: 'Lactose intolerant',
    },
    progress: [
      { date: new Date('2023-10-01T09:00:00Z').toISOString(), weight: 86, notes: 'Feeling flat this week.' },
      { date: new Date('2023-10-08T09:00:00Z').toISOString(), weight: 85.8, notes: 'Weight stalling. Stress is high.' },
      { date: new Date('2023-10-15T09:00:00Z').toISOString(), weight: 85.9, notes: 'Sleep has been poor, affecting recovery.' },
    ],
    generatedPlans: { mealPlans: [], workoutPlans: [] },
    payments: [
      { id: 'payment-2', service: 'Monthly Coaching', amount: 250, status: 'Paid', issueDate: new Date('2023-09-01').toISOString(), dueDate: new Date('2023-09-01').toISOString() },
      { id: 'payment-3', service: 'Monthly Coaching', amount: 250, status: 'Overdue', issueDate: new Date('2023-10-01').toISOString(), dueDate: new Date('2023-10-08').toISOString() },
    ],
    communication: { messages: [] },
    bloodworkHistory: [{ date: new Date('2023-09-25').toISOString(), text: 'Hematocrit: 53\nAST: 45\nALT: 50', status: 'Pending Review' }],
    clientTestimonials: [],
    bloodDonationStatus: { status: 'Ineligible - Temporary', lastChecked: new Date('2023-09-25').toISOString(), notes: 'Hematocrit too high, advised to donate blood.' },
    holisticHealth: { sleepQuality: 'Poor, 4-5 hours', stressLevel: 'High', energyLevel: 'Low', herbalLog: 'Ashwagandha 600mg' },
  },
];