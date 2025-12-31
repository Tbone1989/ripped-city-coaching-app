
import React, { useState, FormEvent, useEffect } from 'react';
import { Button, Input, Card, Spinner, TextArea, Select } from './ui/common.tsx';
import { mockTestimonials } from '../data/mockData.ts';
import { protocols } from '../data/protocolsData.ts';
import { supabase, isSupabaseConfigured, type ClientInsert } from '../services/supabaseClient.ts';
import type { Provider } from '@supabase/supabase-js';
import type { SiteContent } from '../types.ts';

interface LandingPageProps {
  siteContent: SiteContent;
  onDemoLogin?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ siteContent, onDemoLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [logoClicks, setLogoClicks] = useState(0);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // --- Multi-Step Intake State ---
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [intakeStep, setIntakeStep] = useState(1);
  const [intakeSuccess, setIntakeSuccess] = useState(false);
  const [intakeSubmitting, setIntakeSubmitting] = useState(false);

  // --- Lead Magnet State ---
  const [showLeadMagnetModal, setShowLeadMagnetModal] = useState(false);

  const [intakeData, setIntakeData] = useState({
    name: '',
    email: '',
    phone: '',
    instagram: '',
    age: '',
    weight: '',
    height: '',
    bloodType: 'Unknown',
    goal: '',
    experience: 'beginner',
    struggle: '',
    injuries: '',
    healthConditions: '',
    currentSupplements: '',
    currentPharma: '',
    commitment: '10'
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = () => {
    const newCount = logoClicks + 1;
    if (newCount >= 5) {
      if (onDemoLogin) onDemoLogin();
      setLogoClicks(0);
    } else {
      setLogoClicks(newCount);
      setTimeout(() => setLogoClicks(0), 3000);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    if (!isSupabaseConfigured && email.toLowerCase() === 'tbone0189@gmail.com') {
        if (onDemoLogin) { onDemoLogin(); return; }
    }
    if (!isSupabaseConfigured) {
        setError("Backend services not configured.");
        setIsLoading(false);
        return;
    }
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });
      if (authError) setError(authError.message);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleIntakeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIntakeSubmitting(true);
    setError('');

    const newClient: ClientInsert = {
      name: intakeData.name,
      email: intakeData.email,
      goal: intakeData.goal, 
      status: 'prospect',
      paymentStatus: 'unpaid',
      profile: {
        age: intakeData.age, 
        gender: 'male', 
        weight: intakeData.weight, 
        height: intakeData.height, 
        experience: intakeData.experience as any, 
        activityLevel: 'moderately_active', 
        status: intakeData.currentPharma.trim() ? 'enhanced' : 'natural',
        bloodType: intakeData.bloodType,
        notificationPreferences: { email: true, sms: false, inApp: true }
      },
      intakeData: { 
        injuries: intakeData.injuries, 
        meds: intakeData.healthConditions, 
        diet: '', 
        workSchedule: '', 
        healthConditions: intakeData.healthConditions, 
        allergies: '',
        phone: intakeData.phone,
        currentSupplements: intakeData.currentSupplements,
        currentPharma: intakeData.currentPharma
      },
      checkins: [],
      generatedPlans: { mealPlans: [], workoutPlans: [] },
      payments: [],
      communication: { messages: [] },
      bloodworkHistory: [],
      clientTestimonials: [],
      bloodDonationStatus: { status: 'Unknown', lastChecked: '', notes: '' },
      holisticHealth: { sleepQuality: '', stressLevel: '', energyLevel: '', herbalLog: '' },
      cardioLogs: [],
      posingLogs: []
    };

    try {
      if (isSupabaseConfigured) {
          const { error: insError } = await (supabase.from('clients') as any).insert([newClient]);
          if (insError) throw insError;
      }
      setIntakeSuccess(true);
      setTimeout(() => {
        setShowIntakeModal(false);
        setIntakeSuccess(false);
        setIntakeStep(1);
      }, 3000);
    } catch (err: any) {
      setError('Submission failed. Please email us directly.');
    } finally {
      setIntakeSubmitting(false);
    }
  };

  const updateField = (field: string, value: string) => {
      setIntakeData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setIntakeStep(s => s + 1);
  const prevStep = () => setIntakeStep(s => s - 1);

  return (
    <div className="bg-gray-900 text-gray-200 font-sans">
      
      {showIntakeModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
          <Card className="w-full max-w-xl relative bg-[#121214] border-gray-800 shadow-2xl overflow-hidden">
            <button onClick={() => setShowIntakeModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white z-10"><i className="fa-solid fa-times text-xl"></i></button>
            
            {!intakeSuccess && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-800">
                    <div className="h-full bg-red-600 transition-all duration-500" style={{ width: `${(intakeStep / 5) * 100}%` }}></div>
                </div>
            )}

            {intakeSuccess ? (
              <div className="text-center py-12 px-6">
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl text-white shadow-lg shadow-green-900/50 animate-bounce">
                    <i className="fa-solid fa-check"></i>
                </div>
                <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter italic">Application Sent!</h3>
                <p className="text-gray-400">Tyrone will review your biological profile and protocols. Reach out via email within 24 hours to schedule your strategy call.</p>
              </div>
            ) : (
              <div className="p-2 sm:p-4">
                <div className="mb-8">
                    <span className="text-[10px] uppercase font-black text-red-500 tracking-[0.2em]">Step {intakeStep} of 5</span>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                        {intakeStep === 1 && "The Basics"}
                        {intakeStep === 2 && "Biological Metrics"}
                        {intakeStep === 3 && "Performance History"}
                        {intakeStep === 4 && "Protocol Audit"}
                        {intakeStep === 5 && "Health & Confirmation"}
                    </h3>
                </div>

                <form onSubmit={handleIntakeSubmit} className="space-y-6">
                    {intakeStep === 1 && (
                        <div className="space-y-4 animate-fade-in-up">
                            <Input label="Full Name" value={intakeData.name} onChange={e => updateField('name', e.target.value)} required placeholder="John Doe" />
                            <Input label="Email Address" type="email" value={intakeData.email} onChange={e => updateField('email', e.target.value)} required placeholder="john@example.com" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input label="Phone Number" value={intakeData.phone} onChange={e => updateField('phone', e.target.value)} placeholder="(555) 000-0000" />
                                <Input label="Instagram Handle" value={intakeData.instagram} onChange={e => updateField('instagram', e.target.value)} placeholder="@yourprofile" />
                            </div>
                            <Button onClick={nextStep} className="w-full mt-4" disabled={!intakeData.name || !intakeData.email}>Continue <i className="fa-solid fa-arrow-right ml-2"></i></Button>
                        </div>
                    )}

                    {intakeStep === 2 && (
                        <div className="space-y-4 animate-fade-in-up">
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Age" type="number" value={intakeData.age} onChange={e => updateField('age', e.target.value)} required />
                                <Select label="Blood Type" value={intakeData.bloodType} onChange={e => updateField('bloodType', e.target.value)}>
                                    <option value="Unknown">Unknown</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Current Weight (kg)" type="number" value={intakeData.weight} onChange={e => updateField('weight', e.target.value)} required />
                                <Input label="Height (cm)" type="number" value={intakeData.height} onChange={e => updateField('height', e.target.value)} required />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <Button variant="secondary" onClick={prevStep} className="flex-1">Back</Button>
                                <Button onClick={nextStep} className="flex-1" disabled={!intakeData.age || !intakeData.weight}>Continue</Button>
                            </div>
                        </div>
                    )}

                    {intakeStep === 3 && (
                        <div className="space-y-4 animate-fade-in-up">
                            <Select label="Training Experience" value={intakeData.experience} onChange={e => updateField('experience', e.target.value)}>
                                <option value="beginner">Beginner (0-1 Years)</option>
                                <option value="intermediate">Intermediate (2-5 Years)</option>
                                <option value="advanced">Advanced (5+ Years / Competitor)</option>
                            </Select>
                            <TextArea label="What is your #1 goal?" value={intakeData.goal} onChange={e => updateField('goal', e.target.value)} rows={2} required placeholder="e.g. Win my first show, lose 10kg of fat..." />
                            <TextArea label="What has been your biggest struggle so far?" value={intakeData.struggle} onChange={e => updateField('struggle', e.target.value)} rows={2} placeholder="e.g. Consistency with meals, plateaued on lifts..." />
                            <div className="flex gap-4 pt-4">
                                <Button variant="secondary" onClick={prevStep} className="flex-1">Back</Button>
                                <Button onClick={nextStep} className="flex-1" disabled={!intakeData.goal}>Continue</Button>
                            </div>
                        </div>
                    )}

                    {intakeStep === 4 && (
                        <div className="space-y-4 animate-fade-in-up">
                            <TextArea label="Current Supplements & Vitamins" value={intakeData.currentSupplements} onChange={e => updateField('currentSupplements', e.target.value)} rows={3} placeholder="Creatine, Whey, Vitamin D, Omega 3, etc." />
                            <TextArea label="Pharmacological Protocols (PEDs / TRT / Peptides)" value={intakeData.currentPharma} onChange={e => updateField('currentPharma', e.target.value)} rows={3} placeholder="List all current compounds, dosages, and frequency. Leave blank if natural." />
                            <p className="text-[10px] text-gray-500 uppercase font-bold italic">* This data is used by our AI expert to identify potential interactions and optimize your results.</p>
                            <div className="flex gap-4 pt-4">
                                <Button variant="secondary" onClick={prevStep} className="flex-1">Back</Button>
                                <Button onClick={nextStep} className="flex-1">Continue</Button>
                            </div>
                        </div>
                    )}

                    {intakeStep === 5 && (
                        <div className="space-y-4 animate-fade-in-up">
                            <TextArea label="Known Health Conditions / Medications" value={intakeData.healthConditions} onChange={e => updateField('healthConditions', e.target.value)} rows={2} placeholder="List any chronic issues..." />
                            <TextArea label="Current or Past Injuries" value={intakeData.injuries} onChange={e => updateField('injuries', e.target.value)} rows={2} placeholder="e.g. Lower back pain, shoulder impingement..." />
                            <div className="p-4 bg-red-900/10 border border-red-900/30 rounded-lg">
                                <p className="text-xs text-red-400 font-bold uppercase mb-2">Commitment Level (1-10)</p>
                                <input type="range" min="1" max="10" value={intakeData.commitment} onChange={e => updateField('commitment', e.target.value)} className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-600" />
                                <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-bold uppercase">
                                    <span>Casual</span>
                                    <span>Elite Focus</span>
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <Button variant="secondary" onClick={prevStep} className="flex-1">Back</Button>
                                <Button type="submit" className="flex-1" disabled={intakeSubmitting}>
                                    {intakeSubmitting ? <Spinner /> : 'Submit Application'}
                                </Button>
                            </div>
                        </div>
                    )}
                </form>
              </div>
            )}
          </Card>
        </div>
      )}

      {showLeadMagnetModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
          <Card className="w-full max-w-md relative bg-[#121214] border-gray-800 shadow-2xl overflow-hidden p-8 text-center">
            <button onClick={() => setShowLeadMagnetModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><i className="fa-solid fa-times text-xl"></i></button>
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl text-white shadow-lg">
                <i className="fa-solid fa-check"></i>
            </div>
            <h3 className="text-2xl font-black text-white mb-4 uppercase italic">Guide Sent!</h3>
            <p className="text-gray-400">Check your inbox. The "Gut Health Blueprint" is on its way to you.</p>
            <Button onClick={() => setShowLeadMagnetModal(false)} className="mt-8 w-full">Awesome</Button>
          </Card>
        </div>
      )}

      <div className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-gray-900/95 backdrop-blur-md shadow-lg py-2' : 'bg-transparent py-4'}`}>
        <nav className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <button onClick={handleLogoClick} className="text-2xl font-black text-white tracking-tighter hover:text-red-500 transition-colors uppercase italic cursor-default outline-none bg-transparent border-none">
            RIPPED<span className="text-red-500">CITY</span>
          </button>
          <div className="hidden md:flex items-center space-x-6 font-semibold">
            {['process', 'story', 'testimonials'].map(id => (
              <button key={id} onClick={() => {const el = document.getElementById(id); el?.scrollIntoView({behavior: 'smooth'})}} className="text-gray-300 hover:text-white transition uppercase text-sm tracking-wide bg-transparent border-none cursor-pointer">
                {id.replace('-', ' ')}
              </button>
            ))}
            <Button onClick={() => setShowIntakeModal(true)} variant="primary" className="px-6 py-2 uppercase tracking-wide text-sm font-bold shadow-lg shadow-red-900/20">Apply Now</Button>
          </div>
        </nav>
      </div>

      <header className="relative h-screen flex flex-col items-center justify-center text-center p-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {siteContent.heroVideo ? (
            <video autoPlay loop muted playsInline className="w-full h-full object-cover filter brightness-[0.35] contrast-[1.1]" poster={siteContent.heroImage}>
              <source src={siteContent.heroVideo} type="video/mp4" />
            </video>
          ) : (
            <div className="w-full h-full bg-cover bg-center filter brightness-[0.35]" style={{ backgroundImage: `url('${siteContent.heroImage}')` }}></div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-black/60 z-0"></div>
        <div className="relative z-10 animate-fade-in-up max-w-5xl mx-auto mt-16">
          <div className="inline-block border border-red-500/50 bg-red-900/10 backdrop-blur-sm px-4 py-1 rounded-full mb-6">
            <p className="text-red-400 font-bold tracking-widest uppercase text-xs md:text-sm"><i className="fa-solid fa-fire mr-2"></i>Elite Spots Available Now</p>
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase italic leading-none mb-6 drop-shadow-2xl">FORGE YOUR <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">LEGACY</span></h1>
          <p className="text-lg md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto font-light leading-relaxed">Stop guessing. Start evolving. We provide the elite nutrition, training, and biological analysis you need to reach your peak potential.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button onClick={() => setShowIntakeModal(true)} className="text-lg px-10 py-4 shadow-red-900/50 shadow-xl min-w-[240px] font-bold uppercase tracking-wide transform hover:scale-105 transition-transform">Start Your Transformation</Button>
            <Button onClick={() => {document.getElementById('process')?.scrollIntoView({behavior:'smooth'})}} variant="secondary" className="text-lg px-10 py-4 bg-transparent border border-white/30 hover:bg-white/10 min-w-[240px]">How It Works</Button>
          </div>
        </div>
      </header>

      <main>
        <section id="process" className="py-24 px-4 bg-gray-900 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4">The Ripped City <span className="text-red-500">Methodology</span></h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">We don't do cookie-cutter plans. Our process is designed to adapt to your unique biology and lifestyle.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-12 left-0 w-full h-1 bg-gradient-to-r from-gray-800 via-red-900 to-gray-800 -z-0"></div>
              {[
                  { icon: 'fa-clipboard-list', title: '1. Analyze', desc: 'We start with a deep dive. Intake forms, bloodwork analysis, and lifestyle assessment to understand your starting point and metabolic health.'},
                  { icon: 'fa-dna', title: '2. Blueprint', desc: 'You get a custom roadmap. Precision meal plans, progressive training blocks, and supplement protocols tailored to your specific biology.', highlight: true},
                  { icon: 'fa-trophy', title: '3. Evolve', desc: 'We execute and adjust. Bi-weekly check-ins, data-driven adjustments, and constant communication ensure you never plateau.'}
              ].map((step, idx) => (
                <div key={idx} className="relative z-10 flex flex-col items-center text-center">
                  <div className={`w-24 h-24 bg-gray-800 border-4 ${step.highlight ? 'border-red-600 shadow-red-900/20' : 'border-gray-700'} rounded-full flex items-center justify-center text-3xl ${step.highlight ? 'text-red-500' : 'text-white'} mb-6 shadow-xl`}>
                    <i className={`fa-solid ${step.icon}`}></i>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 uppercase">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed px-4">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="services" className="py-24 px-4 bg-gray-800 relative border-t border-gray-700">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-white mb-6 uppercase italic">Elite Coaching.<br/>No Compromises.</h2>
                <p className="text-gray-400 text-lg mb-8">Most apps give you a PDF and wish you luck. Ripped City is a comprehensive ecosystem designed for one thing: <strong>Results.</strong></p>
                <div className="space-y-6">
                  {[
                      { icon: 'fa-utensils', title: 'Precision Nutrition', desc: 'Macros calculated to the gram. Meal plans that fit your schedule, not generic templates.'},
                      { icon: 'fa-microscope', title: 'Bloodwork Analysis', desc: 'We look under the hood. Optimize hormones, digestion, and longevity markers.'},
                      { icon: 'fa-dumbbell', title: 'Periodized Training', desc: 'Phased training blocks (Hypertrophy, Strength, Peaking) to ensure continuous progression.'},
                      { icon: 'fa-comments', title: '24/7 Access', desc: 'Direct line to your coach. Questions answered, form checks reviewed, adjustments made.'}
                  ].map((b, i) => (
                    <div key={i} className="flex gap-4">
                        <div className="w-12 h-12 bg-red-600/10 rounded-lg flex items-center justify-center flex-shrink-0 text-red-500 text-xl"><i className={`fa-solid ${b.icon}`}></i></div>
                        <div><h3 className="text-xl font-bold text-white">{b.title}</h3><p className="text-gray-400 text-sm">{b.desc}</p></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-red-600/20 blur-xl rounded-full"></div>
                <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop" alt="Coach" className="relative rounded-2xl shadow-2xl border-2 border-gray-700 w-full transform rotate-2 hover:rotate-0 transition-all duration-500"/>
              </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-r from-red-900 to-gray-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="flex-1">
              <span className="bg-white text-red-900 text-xs font-bold px-2 py-1 rounded mb-2 inline-block uppercase tracking-wider">Not ready to commit yet?</span>
              <h2 className="text-3xl font-bold mb-4">Get "The Gut Health Blueprint" Free</h2>
              <p className="text-gray-200 mb-6">Discover the 5 secrets to fixing your digestion, reducing bloat, and absorbing more nutrients from your food.</p>
            </div>
            <div className="flex-1 w-full max-w-md">
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <form className="space-y-4" onSubmit={e => {e.preventDefault(); setShowLeadMagnetModal(true);}}>
                  <Input placeholder="Enter your email address" type="email" required className="bg-white/80 text-gray-900 placeholder-gray-500"/>
                  <Button type="submit" className="w-full bg-white text-red-900 hover:bg-gray-100 font-bold border-none"><i className="fa-solid fa-download mr-2"></i> Get The Guide</Button>
                </form>
              </Card>
            </div>
          </div>
        </section>

        <section id="story" className="py-20 px-4 bg-gray-800">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-4xl font-bold text-red-400 mb-4">From Rock Bottom to Ripped City</h2>
              <div className="prose prose-invert max-w-none text-gray-300 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                <p>When you look at me today—owner of Ripped City Inc, aspiring professional bodybuilder—you might assume I've always been fit.</p>
                <p>My journey began at 338 pounds. I was exhausted, emotionally drained, and medically at risk. Over the next year, I lost 97 pounds and gained mental clarity and purpose.</p>
                <p className="font-bold text-white italic">"It's better to suffer in the gym than to suffer in the hospital."</p>
                <p>My promise to you is simple: if you bring the determination, I will provide the roadmap.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <img src={siteContent.transformationBefore} className="rounded-lg w-1/2 object-cover shadow-lg transform -rotate-3 border-4 border-gray-700"/>
              <img src={siteContent.transformationAfter} className="rounded-lg w-1/2 object-cover shadow-lg transform rotate-3 border-4 border-red-600"/>
            </div>
          </div>
        </section>

        <section id="testimonials" className="py-20 px-4 bg-gray-900">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-12 uppercase italic tracking-tighter">Elite Transformations</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {mockTestimonials.map((t, i) => (
                <Card key={i} className="text-left border-gray-800 bg-gray-800/50">
                  <div className="flex items-center mb-4">
                    <img src={t.imageUrl} className="w-16 h-16 rounded-full object-cover mr-4 ring-2 ring-red-500" />
                    <div><h4 className="font-bold text-lg text-white">{t.name}</h4><p className="text-sm text-red-400">Client</p></div>
                  </div>
                  <p className="text-gray-300 italic">"{t.quote}"</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="login" className="py-24 px-4 bg-gradient-to-b from-gray-800 to-black">
          <div className="max-w-md mx-auto">
            <Card className="bg-gray-900 border-gray-700 shadow-2xl">
              <h2 className="text-2xl font-black text-center text-white mb-6 uppercase italic">Client Login</h2>
              <form onSubmit={handleLogin} className="space-y-6">
                <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-red-500 outline-none" required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"><i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i></button>
                    </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? <Spinner /> : 'Access Portal'}</Button>
              </form>
              {error && <p className="text-red-400 text-sm text-center mt-4 font-bold">{error}</p>}
            </Card>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-3xl font-black text-white italic tracking-tighter mb-8">RIPPED<span className="text-red-600">CITY</span></h1>
            <div className="flex justify-center space-x-6 mb-8">
                <a href="https://www.tiktok.com/@tyronedhayes" className="text-gray-400 hover:text-white text-xl"><i className="fab fa-tiktok"></i></a>
                <a href="https://www.instagram.com/tbone0189/" className="text-gray-400 hover:text-white text-xl"><i className="fab fa-instagram"></i></a>
            </div>
            <p className="text-gray-600 text-sm">&copy; {new Date().getFullYear()} Ripped City Inc. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

