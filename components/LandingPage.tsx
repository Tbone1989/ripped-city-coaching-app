import React, { useState, FormEvent } from 'react';
import { Button, Input, Card, Tabs, Spinner } from './ui/common.tsx';
import { mockTestimonials, mockClients } from '../data/mockData.ts';
import { supabase } from '../services/supabaseClient.ts';
import type { Provider } from '@supabase/supabase-js';

interface LandingPageProps {
  isDemoMode?: boolean;
  onDemoLogin?: (role: 'coach' | 'client', clientEmail?: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ isDemoMode = false, onDemoLogin = () => {} }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const { error } = await supabase!.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        setError(error.message);
    } 
    // On success, the onAuthStateChange listener in App.tsx will handle the redirect.
    setIsLoading(false);
  };
  
  const handleSocialLogin = async (provider: Provider) => {
    setIsLoading(true);
    setError('');
    const { error } = await supabase!.auth.signInWithOAuth({
      provider: provider,
    });
    if (error) {
        setError(`Could not log in with ${provider}: ${error.message}`);
        setIsLoading(false);
    }
    // On success, Supabase handles the redirect and the listener in App.tsx will do the rest.
  };

  const handleBookConsultation = () => {
    alert('Thank you for your interest! Please contact me directly to schedule your consultation.');
  };

  const navLinks = [
    { name: 'Our Story', href: '#story' },
    { name: 'What We Offer', href: '#services' },
    { name: 'Our Mission', href: '#mission' },
    { name: 'Testimonials', href: '#testimonials' },
  ];

  return (
    <div className="bg-gray-900 text-gray-200">
      {/* Header & Hero */}
      <header className="relative h-screen flex flex-col items-center justify-center text-center p-4">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('https://picsum.photos/seed/fitness/1920/1080')", filter: 'blur(8px) brightness(0.4)' }}></div>
        <div className="absolute top-0 left-0 w-full p-4 bg-gray-900/30 backdrop-blur-sm z-20">
            <nav className="max-w-7xl mx-auto flex justify-between items-center">
                <a href="https://rippedcityinc.com/" target="_blank" rel="noopener noreferrer" className="text-2xl font-bold text-white tracking-tight hover:text-gray-300 transition-colors">
                  RIPPED CITY <span className="text-red-500">COACHING</span>
                </a>
                <div className="hidden md:flex items-center space-x-6">
                    {navLinks.map(link => <a key={link.name} href={link.href} className="text-gray-300 hover:text-white transition">{link.name}</a>)}
                    <Button onClick={() => document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth' })} variant="primary" className="px-4 py-2">Get Started</Button>
                </div>
            </nav>
        </div>
        <div className="relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
            Unlock Your Ultimate Potential
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mt-4 max-w-3xl mx-auto">
            A personal transformation journey to forge the strongest version of yourself.
          </p>
          <div className="mt-8">
            <Button onClick={() => document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth' })} className="text-lg">Book a Free Consultation</Button>
          </div>
        </div>
      </header>

      <main>
        {/* Services Section */}
        <section id="services" className="py-20 px-4 bg-gray-900">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-2">What We Offer</h2>
            <p className="text-gray-400 mb-12">A holistic, personalized approach to guarantee results.</p>
            <div className="grid md:grid-cols-3 gap-8">
              <Card><i className="fa-solid fa-utensils text-red-400 text-3xl mb-4"></i><h3 className="text-xl font-semibold mb-2">Custom Nutrition</h3><p className="text-gray-400">Tailored nutrition plans built around your goals, preferences, and unique biometrics.</p></Card>
              <Card><i className="fa-solid fa-dumbbell text-red-400 text-3xl mb-4"></i><h3 className="text-xl font-semibold mb-2">Personalized Training</h3><p className="text-gray-400">Intelligent, evolving workout programs that fit your lifestyle and available equipment.</p></Card>
              <Card><i className="fa-solid fa-heart-pulse text-red-400 text-3xl mb-4"></i><h3 className="text-xl font-semibold mb-2">Holistic Health Coaching</h3><p className="text-gray-400">Comprehensive guidance covering supplements, recovery, and lifestyle for total wellness.</p></Card>
            </div>
          </div>
        </section>

        {/* Transformation Story */}
        <section id="story" className="py-20 px-4 bg-gray-800">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
            <div>
                <h2 className="text-4xl font-bold text-red-400 mb-4">From Rock Bottom to Ripped City</h2>
                <div className="prose prose-invert max-w-none text-gray-300 max-h-[60vh] overflow-y-auto pr-4">
                    <h3>A Personal Introduction from the Founder</h3>
                    <p>When you look at me today—the owner of Ripped City Inc, founder of the <a href="https://www.zeffy.com/en-US/donation-form/e41efe15-414a-4aaa-be55-0376ff88a404" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300">Digesting Life Balance nonprofit</a>, and an aspiring professional bodybuilder—you might assume I've always been passionate about fitness and nutrition...</p>
                    <p>My journey began at rock bottom. At 338 pounds, I was physically exhausted, emotionally drained, and medically at risk... After losing my mother, I buried my pain in food and work...</p>
                    <p>I still remember that morning clearly... the results were a wake-up-call I couldn't ignore... That's when I reached out to my friend Mark Alvisi, who became my guide...</p>
                    <p>...Throughout this journey, I wasn't alone. My training partner, Duveuil Valcena, became...a true mentor...</p>
                    <p>Over the next year, I lost 97 pounds... This transformation wasn't just physical. With every pound shed, I gained something far more valuable—mental clarity, emotional strength, and a sense of purpose...</p>
                    <p>Why? Because I discovered something profound: it's better to suffer in the gym than to suffer in the hospital. This realization changed everything for me.</p>
                    <p>Ripped City Inc was born from this journey... My promise to you is simple: if you bring the determination, this guide will provide the roadmap. No sacrifice, no victory—that's the Ripped City way.</p>
                    <p>Let's begin this journey together.</p>
                    <p className="!text-right font-semibold mt-4">Tyrone Hayes<br/>Founder, Ripped City Inc</p>
                    <div className="flex justify-end space-x-4 mt-2 pr-1">
                      <a href="https://www.tiktok.com/@tyronedhayes" target="_blank" rel="noopener noreferrer" aria-label="Personal TikTok" className="text-gray-400 hover:text-red-500 transition-colors"><i className="fab fa-tiktok text-xl"></i></a>
                      <a href="https://www.instagram.com/tbone0189/" target="_blank" rel="noopener noreferrer" aria-label="Personal Instagram" className="text-gray-400 hover:text-red-500 transition-colors"><i className="fab fa-instagram text-xl"></i></a>
                      <a href="https://x.com/tyroneh1989/" target="_blank" rel="noopener noreferrer" aria-label="Personal X" className="text-gray-400 hover:text-red-500 transition-colors"><i className="fab fa-x-twitter text-xl"></i></a>
                      <a href="https://www.youtube.com/@tyronehayes5633" target="_blank" rel="noopener noreferrer" aria-label="Personal YouTube" className="text-gray-400 hover:text-red-500 transition-colors"><i className="fab fa-youtube text-xl"></i></a>
                      <a href="https://www.snapchat.com/@tyroneee89" target="_blank" rel="noopener noreferrer" aria-label="Personal Snapchat" className="text-gray-400 hover:text-red-500 transition-colors"><i className="fab fa-snapchat text-xl"></i></a>
                    </div>
                </div>
            </div>
            <div className="flex gap-4">
                <img src="https://images.unsplash.com/photo-1579047062954-26965a3d0628?q=80&w=800&auto=format&fit=crop" alt="Before" className="rounded-lg w-1/2 object-cover shadow-lg transform -rotate-3 hover:rotate-0 transition-transform"/>
                <img src="https://images.unsplash.com/photo-1549476464-373921717545?q=80&w=800&auto=format&fit=crop" alt="After" className="rounded-lg w-1/2 object-cover shadow-lg transform rotate-3 hover:rotate-0 transition-transform"/>
            </div>
          </div>
        </section>
        
        {/* Support Our Mission Section */}
        <section id="mission" className="py-20 px-4 bg-gray-900">
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                <div className="text-center md:text-left">
                    <i className="fa-solid fa-hand-holding-heart text-5xl text-red-500 mb-4"></i>
                    <h2 className="text-4xl font-bold text-white mb-4">Support Our Mission</h2>
                    <h3 className="text-2xl font-semibold text-red-400 mb-4">Digesting Life Balance</h3>
                    <p className="text-gray-300 mb-8">
                        Our nonprofit is dedicated to improving community health by providing resources for digestive wellness and helping people take control of their health. Your contribution helps us fight chronic illness and promote a healthier future for everyone.
                    </p>
                    <Button onClick={() => window.open('https://www.zeffy.com/en-US/donation-form/e41efe15-414a-4aaa-be55-0376ff88a404', '_blank')}>
                        Donate Now
                        <i className="fa-solid fa-arrow-up-right-from-square ml-2"></i>
                    </Button>
                </div>
                <Card className="bg-gray-800/80">
                    <h3 className="text-xl font-bold text-white mb-4 text-center">How Your Donation Helps</h3>
                    <p className="text-sm text-center text-gray-400 mb-6">Your tax-deductible contribution directly funds our community outreach and wellness programs.</p>
                    <ul className="space-y-4">
                        <li className="flex items-center p-3 bg-gray-700/50 rounded-lg">
                            <i className="fa-solid fa-circle-dollar-to-slot text-red-400 text-2xl mr-4 w-8 text-center"></i>
                            <div>
                                <h4 className="font-semibold text-white">One-Time Donations</h4>
                                <p className="text-gray-400 text-sm">Provide immediate support for our current initiatives.</p>
                            </div>
                        </li>
                        <li className="flex items-center p-3 bg-gray-700/50 rounded-lg">
                            <i className="fa-solid fa-calendar-check text-red-400 text-2xl mr-4 w-8 text-center"></i>
                            <div>
                                <h4 className="font-semibold text-white">Monthly Giving</h4>
                                <p className="text-gray-400 text-sm">Offer sustained support for our long-term health programs.</p>
                            </div>
                        </li>
                        <li className="flex items-center p-3 bg-gray-700/50 rounded-lg">
                            <i className="fa-solid fa-handshake-angle text-red-400 text-2xl mr-4 w-8 text-center"></i>
                            <div>
                                <h4 className="font-semibold text-white">Sponsor Programs</h4>
                                <p className="text-gray-400 text-sm">Make a larger impact by sponsoring a wellness workshop.</p>
                            </div>
                        </li>
                    </ul>
                </Card>
            </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 px-4 bg-gray-800">
            <div className="max-w-6xl mx-auto text-center">
                 <h2 className="text-4xl font-bold text-white mb-12">What Our Clients Say</h2>
                 <div className="grid md:grid-cols-3 gap-8">
                    {mockTestimonials.map((testimonial, index) => (
                        <Card key={index} className="text-left">
                            <div className="flex items-center mb-4">
                                <img src={testimonial.imageUrl} alt={testimonial.name} className="w-16 h-16 rounded-full object-cover mr-4" />
                                <div>
                                    <h4 className="font-bold text-lg text-white">{testimonial.name}</h4>
                                    <p className="text-sm text-red-400">Verified Client</p>
                                </div>
                            </div>
                            <p className="text-gray-300 italic">"{testimonial.quote}"</p>
                        </Card>
                    ))}
                 </div>
            </div>
        </section>

        {/* Get Started Section */}
        <section id="get-started" className="py-20 px-4 bg-gray-900">
             <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-start">
                <div className="flex flex-col items-center text-center md:items-start md:text-left h-full">
                    <h2 className="text-3xl font-bold text-white mb-6">Start Your Transformation Today</h2>
                    <p className="text-gray-400 mb-6">Ready to take the first step? Onboarding is a personalized, one-on-one process. Book a free, no-obligation consultation to discuss your goals and see if we're the right fit.</p>
                    <Button onClick={handleBookConsultation} className="mt-auto">Book Your Free Consultation</Button>
                </div>
                <div id="login">
                    <Card className="bg-gray-800/60">
                         {isDemoMode ? (
                          <>
                            <h2 className="text-3xl font-bold text-center text-white mb-2">Demo Mode</h2>
                             <p className="text-center text-gray-400 mb-6">The app is running with mock data. <br/> Explore as a coach or a client.</p>
                            <div className="space-y-4">
                                <Button onClick={() => onDemoLogin('coach')} className="w-full">
                                    <i className="fa-solid fa-user-shield mr-2"></i> Enter as Coach
                                </Button>
                                {mockClients.filter(c => c.status !== 'prospect').map(client => (
                                     <Button key={client.id} onClick={() => onDemoLogin('client', client.email)} className="w-full" variant="secondary">
                                        <i className="fa-solid fa-user mr-2"></i> Enter as {client.name}
                                    </Button>
                                ))}
                            </div>
                          </>
                        ) : (
                          <>
                            <h2 className="text-3xl font-bold text-center text-white mb-6">Portal Access</h2>
                            <form onSubmit={handleLogin} className="space-y-6">
                                <Input 
                                    id="email" 
                                    label="Email"
                                    type="email"
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    placeholder="user@example.com"
                                    required 
                                />
                                <Input id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? <Spinner /> : <><i className="fa-solid fa-right-to-bracket mr-2"></i>Login</>}
                                </Button>
                            </form>
                            {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}

                            <div className="relative flex py-5 items-center">
                                <div className="flex-grow border-t border-gray-700"></div>
                                <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase">Or continue with</span>
                                <div className="flex-grow border-t border-gray-700"></div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Button variant="secondary" onClick={() => handleSocialLogin('google')} disabled={isLoading}>
                                    <i className="fab fa-google mr-2"></i> Google
                                </Button>
                                <Button variant="secondary" onClick={() => handleSocialLogin('apple')} disabled={isLoading}>
                                    <i className="fab fa-apple mr-2"></i> Apple
                                </Button>
                                <Button variant="secondary" onClick={() => handleSocialLogin('azure')} disabled={isLoading}>
                                    <i className="fab fa-microsoft mr-2"></i> Microsoft
                                </Button>
                                <Button variant="secondary" onClick={() => handleSocialLogin('facebook')} disabled={isLoading}>
                                    <i className="fab fa-facebook mr-2"></i> Facebook
                                </Button>
                            </div>
                          </>
                        )}
                    </Card>
                </div>
             </div>
        </section>
      </main>

       <footer className="bg-gray-900 py-8 text-center border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 text-left md:text-center">
            <div>
                <h4 className="font-semibold text-white mb-3 uppercase tracking-wider">Ripped City Inc.</h4>
                <div className="flex justify-start md:justify-center space-x-6">
                    <a href="https://www.tiktok.com/@rippedcityinc" target="_blank" rel="noopener noreferrer" aria-label="Ripped City Inc TikTok" className="text-gray-400 hover:text-red-500 transition-colors"><i className="fab fa-tiktok text-2xl"></i></a>
                    <a href="https://www.instagram.com/rippedcityinc/?hl=en" target="_blank" rel="noopener noreferrer" aria-label="Ripped City Inc Instagram" className="text-gray-400 hover:text-red-500 transition-colors"><i className="fab fa-instagram text-2xl"></i></a>
                </div>
            </div>
            <div>
                <h4 className="font-semibold text-white mb-3 uppercase tracking-wider">Digesting Life Balance</h4>
                <div className="flex justify-start md:justify-center space-x-6">
                    <a href="https://www.instagram.com/digestinglifebalance/?hl=en" target="_blank" rel="noopener noreferrer" aria-label="Digesting Life Balance Instagram" className="text-gray-400 hover:text-red-500 transition-colors"><i className="fab fa-instagram text-2xl"></i></a>
                    <a href="https://www.facebook.com/profile.php?id=100029187646814" target="_blank" rel="noopener noreferrer" aria-label="Digesting Life Balance Facebook" className="text-gray-400 hover:text-red-500 transition-colors"><i className="fab fa-facebook text-2xl"></i></a>
                    <a href="https://www.zeffy.com/en-US/donation-form/e41efe15-414a-4aaa-be55-0376ff88a404" target="_blank" rel="noopener noreferrer" aria-label="Donate to Digesting Life Balance" className="text-gray-400 hover:text-red-500 transition-colors"><i className="fa-solid fa-hand-holding-dollar text-2xl"></i></a>
                </div>
            </div>
        </div>
        <p className="text-gray-500 mt-8">&copy; {new Date().getFullYear()} Ripped City Coaching. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;