import type { Protocol } from '../types.ts';

export const protocols: Protocol[] = [
  // Overviews
  {
    id: 'overview-anabolic-steroids',
    name: 'Anabolic Steroids Overview',
    category: 'Overviews',
    description: 'Anabolic-androgenic steroids are synthetic variations of testosterone, used to build muscle, increase strength, and enhance recovery.',
    details: [
      { title: 'How They Work', content: ['Bind to androgen receptors in muscle tissue.', 'Increase protein synthesis (muscle building).', 'Promote nitrogen retention in muscles.', 'Accelerate recovery between workouts.'] },
      { title: 'Administration Methods', content: 'Injectable: Injected into muscle (most common).\nOral: Pills taken daily.\nTopical: Gels or creams applied to the skin.' },
      { title: 'Typical Dosing Patterns', content: ['Cycles: 6-12 week periods of use.', 'Stacking: Combining multiple compounds.', 'Pyramiding: Starting with a low dose, increasing to a peak, then tapering down.'] }
    ]
  },
  {
    id: 'overview-pct',
    name: 'Post Cycle Therapy (PCT) Overview',
    category: 'Overviews',
    description: 'A critical protocol to restore the body\'s natural hormone production after a steroid cycle, helping to preserve gains and maintain health.',
    details: [
      { title: 'Purpose', content: 'To restore natural testosterone production and hormonal balance after a cycle.' },
      { title: 'Main Components', content: ['SERMs (Clomid, Nolvadex): Stimulate the brain to restart natural testosterone production.', 'Aromatase Inhibitors (AIs): Control estrogen levels.', 'HCG: Helps maintain testicular function during and after a cycle.'] },
      { title: 'How It Works', content: ['Blocks estrogen receptors in the brain, signaling the body to produce testosterone.', 'Prevents muscle loss and helps maintain gains.', 'Restores overall hormonal balance.'] },
      { title: 'Typical Protocol', content: 'Duration: 4-6 weeks, starting after the steroid esters have cleared the body.\nDosing: Varies by compound, often starting higher and then tapering down.' }
    ]
  },
  {
    id: 'overview-peptides',
    name: 'Peptides & Growth Factors Overview',
    category: 'Overviews',
    description: 'Short chains of amino acids that signal specific bodily functions, often used to stimulate natural growth hormone production and enhance recovery.',
    details: [
      { title: 'How They Function', content: ['Signal the pituitary gland to release more growth hormone (GH).', 'Increase IGF-1 (a primary muscle growth factor) production.', 'Enhance fat burning and muscle building.', 'Improve recovery and sleep quality.'] },
      { title: 'Common Types', content: ['GHRPs (e.g., GHRP-2, GHRP-6): Stimulate a pulse of GH release.', 'GHRHs (e.g., CJC-1295): Amplify the release of GH.', 'IGF-1: A direct muscle growth and recovery factor.'] },
      { title: 'Administration', content: 'Method: Subcutaneous injection (under the skin).\nTiming: Usually on an empty stomach.\nFrequency: 1-3 times daily depending on the compound.' },
      { title: 'Dosage Range', content: '100-300 mcg per dose is typical for many peptides.' }
    ]
  },
  {
    id: 'overview-ais',
    name: 'Aromatase Inhibitors (AIs) Overview',
    category: 'Overviews',
    description: 'Compounds used during steroid cycles to control estrogen levels by preventing the conversion of testosterone into estrogen.',
    details: [
      { title: 'How They Work', content: ['Block the aromatase enzyme, which is responsible for converting androgens to estrogens.', 'Prevent or reduce estrogen-related side effects like water retention and gynecomastia.', 'Help maintain a harder, drier physique.'] },
      { title: 'Common Types', content: ['Anastrozole (Arimidex): A common, non-suicidal AI.', 'Exemestane (Aromasin): A suicidal AI that permanently deactivates the enzyme it binds to.', 'Letrozole: The most potent AI, used for severe cases of high estrogen.'] },
      { title: 'Dosing', content: 'Highly individual and depends on the cycle compounds, dosage, and user sensitivity. Typically taken every other day or twice weekly.' }
    ]
  },
  {
    id: 'overview-fat-burners',
    name: 'Fat Burning Compounds Overview',
    category: 'Overviews',
    description: 'A category of compounds designed to accelerate fat loss and help preserve lean muscle mass, typically during a cutting phase.',
    details: [
        { title: 'Categories', content: [
            'Beta-2 Agonists (e.g., Clenbuterol): Increase metabolic rate and body temperature.',
            'Thyroid Hormones (e.g., T3): Directly increase metabolism by stimulating the thyroid.',
        ]},
        { title: 'DNP (2,4-Dinitrophenol)', content: 'An extremely potent industrial chemical that forces fat loss by making energy production highly inefficient. It is NOT recommended.', isWarning: true},
        { title: 'Warning', content: 'DNP is extremely dangerous and can be fatal even with a single dose due to its uncontrolled effect on body temperature. Its use is strongly discouraged.', isWarning: true}
    ]
  },
  {
    id: 'overview-sarms',
    name: 'SARMs Overview',
    category: 'Overviews',
    description: 'Selective Androgen Receptor Modulators (SARMs) are compounds designed to provide muscle-building benefits with fewer side effects than traditional anabolic steroids by being more selective in their action.',
    details: [
      { title: 'How They Work', content: ['Selectively bind to androgen receptors in muscle and bone tissue.', 'Aim to provide anabolic benefits while minimizing effects on other organs like the prostate.', 'Most are orally administered, avoiding the need for injections.'] },
      { title: 'Popular Types', content: ['Ostarine (MK-2866): Mild, often used for beginners or in cutting phases.', 'LGD-4033 (Ligandrol): Known for significant size and strength gains.', 'RAD-140 (Testolone): A potent SARM for building lean mass and strength.'] },
      { title: 'Typical Cycles', content: 'Duration: 8-12 weeks.\nDosing: Once daily, oral administration.\nPCT: May be required, though often lighter than a full steroid cycle PCT.' }
    ]
  },
    {
    id: 'overview-insulin',
    name: 'Insulin Overview',
    category: 'Insulin & Growth Factors',
    description: 'A powerful hormone used by advanced bodybuilders to maximize nutrient partitioning and muscle growth.',
    details: [
        { title: 'How It Works', content: ['Shuttles nutrients (like glucose and amino acids) into muscle cells.', 'Drastically increases protein synthesis and glycogen storage.', 'Promotes extreme muscle fullness.'] },
        { title: 'Administration', content: 'Method: Subcutaneous injection.\nTiming: Critically timed around workouts and carbohydrate-rich meals.\nTypes: Fast-acting (e.g., Humalog) is most common for bodybuilding purposes.' },
        { title: 'Danger', content: 'Misuse is extremely dangerous and can lead to severe hypoglycemia, coma, or death. Should only be considered by highly experienced individuals under expert guidance.', isWarning: true }
    ]
  },
  // Safety Notes
  {
    id: 'safety-notes-universal',
    name: 'Universal Safety Precautions',
    category: 'Safety Notes',
    description: 'Fundamental safety practices that should be followed for any performance enhancement protocol.',
    details: [
      { title: 'Core Principles', content: ['Blood Work: Get comprehensive lab tests before, during, and after any cycle.', 'Start Low: Always begin with the minimum effective dose to assess tolerance.', 'Cycle Length: Adhere to recommended cycle durations; longer is not always better.', 'Support Supplements: Utilize supplements for liver, heart, and lipid health.', 'Professional Guidance: Always work with a knowledgeable practitioner.'] }
    ]
  },
  {
    id: 'safety-notes-monitoring',
    name: 'Key Monitoring Parameters',
    category: 'Safety Notes',
    description: 'Critical biomarkers to monitor via blood work to ensure health and safety during a cycle.',
    details: [
      { title: 'Essential Health Markers', content: ['Liver Function: ALT, AST levels.', 'Lipid Profile: HDL, LDL cholesterol, and triglycerides.', 'Blood Pressure: Must be monitored regularly.', 'Hormone Panels: Testosterone (Total & Free), Estrogen (E2), LH, FSH.', 'Complete Blood Count (CBC): Check for red blood cell count (hematocrit) to avoid polycythemia.'] }
    ]
  },
  {
    id: 'safety-reminders',
    name: 'Coach\'s Reminders',
    category: 'Safety Notes',
    description: 'Smart stacking and cycle management principles.',
    details: [
      { title: 'Stacking & Management Rules', content: ['Never run oral steroids for longer than 6-8 weeks.', 'Always use a testosterone base in any injectable cycle.', 'Always have Post Cycle Therapy (PCT) on hand before starting a cycle.', 'Start with conservative doses to assess tolerance before increasing.'] }
    ]
  },
  // Testosterone Bases
  { id: 'test-cyp', name: 'Testosterone Cypionate', category: 'Testosterone Bases', description: 'A long-acting, injectable testosterone ester that serves as the foundation for most cycles.', details: [ { title: 'Purpose', content: 'Muscle growth, strength, and mass building.' }, { title: 'Dosage', content: '300-800mg per week.' }, { title: 'Administration', content: 'Injected every 3-4 days to maintain stable blood levels.' } ] },
  { id: 'test-e', name: 'Testosterone Enanthate', category: 'Testosterone Bases', description: 'Very similar to Testosterone Cypionate, with a slightly shorter half-life. A versatile TRT and cycle base.', details: [ { title: 'Purpose', content: 'Bulking, cutting, or as a Testosterone Replacement Therapy (TRT) base.' }, { title: 'Dosage', content: '300-800mg per week.' }, { title: 'Administration', content: 'Injected every 3-4 days.' } ] },
  { id: 'test-prop', name: 'Testosterone Propionate', category: 'Testosterone Bases', description: 'A fast-acting testosterone ester that results in quicker buildup of hormone levels, requiring more frequent injections.', details: [ { title: 'Purpose', content: 'Ideal for contest prep, cutting cycles, and users who want quick results.' }, { title: 'Dosage', content: '300-700mg per week.' }, { title: 'Administration', content: 'Injected every other day due to its short half-life.' } ] },
  { id: 'sustanon', name: 'Sustanon 250', category: 'Testosterone Bases', description: 'A blend of four different testosterone esters designed to provide both a fast and sustained release of testosterone.', details: [ { title: 'Purpose', content: 'Aims to provide more stable hormone levels with less frequent injections than single short esters.' }, { title: 'Dosage', content: '250-750mg per week.' }, { title: 'Administration', content: 'Typically injected twice a week.' } ] },
  // Mass Builders
  { id: 'deca', name: 'Nandrolone Decanoate (Deca)', category: 'Mass Builders', description: 'A classic and highly popular bulking compound known for slow, steady, quality gains and therapeutic benefits for joints.', details: [ { title: 'Purpose', content: 'Mass building, joint health improvement through collagen synthesis.' }, { title: 'Dosage', content: '300-600mg per week.' }, { title: 'Cycle Length', content: '12-16 weeks minimum due to its slow-acting nature.' } ] },
  { id: 'npp', name: 'Nandrolone Phenylpropionate (NPP)', category: 'Mass Builders', description: 'A faster-acting version of Nandrolone (Deca), allowing for quicker results and faster clearance from the body.', details: [ { title: 'Purpose', content: 'Lean gains with the benefits of nandrolone but without the long detection time.' }, { title: 'Dosage', content: '300-500mg per week.' }, { title: 'Administration', content: 'Injected every other day.' } ] },
  { id: 'dbol', name: 'Dianabol (Methandrostenolone)', category: 'Mass Builders', description: 'A powerful oral steroid famous for producing rapid gains in mass and strength. Often used as a kickstart to a cycle.', details: [ { title: 'Purpose', content: 'Kickstarting injectable cycles for rapid bulking.' }, { title: 'Dosage', content: '30-50mg daily (oral).' }, { title: 'Cycle Length', content: '4-6 weeks due to liver toxicity.' } ] },
  { id: 'anadrol', name: 'Anadrol (Oxymetholone)', category: 'Mass Builders', description: 'Arguably the most potent oral steroid for producing sheer mass and strength, but comes with significant side effect potential.', details: [ { title: 'Purpose', content: 'Maximum size and power gains for advanced, off-season users.' }, { title: 'Dosage', content: '50-100mg daily (oral).' }, { title: 'Cycle Length', content: '4-6 weeks maximum due to high liver toxicity.' } ] },
  // Strength & Power Builders
  { id: 'tren-ace', name: 'Trenbolone Acetate', category: 'Strength & Power Builders', description: 'An extremely powerful injectable steroid known for dramatic effects on strength, body composition, and muscle hardness.', details: [ { title: 'Purpose', content: 'Body recomposition, cutting, and raw strength.' }, { title: 'Dosage', content: '300-500mg per week.' }, { title: 'Administration', content: 'Injected every other day due to short ester.' } ] },
  { id: 'tren-e', name: 'Trenbolone Enanthate', category: 'Strength & Power Builders', description: 'A longer-acting version of Trenbolone, allowing for less frequent injections but a longer clearance time.', details: [ { title: 'Purpose', content: 'Best for advanced cycles where dramatic changes in physique are desired.' }, { title: 'Dosage', content: '400-600mg per week.' }, { title: 'Administration', content: 'Injected twice weekly.' } ] },
  { id: 'halo', name: 'Halotestin (Fluoxymesterone)', category: 'Strength & Power Builders', description: 'A purely strength-focused oral steroid with little to no mass-building effect. Known for increasing aggression and power output.', details: [ { title: 'Purpose', content: 'Pre-competition for powerlifters or for contest strength boosts.' }, { title: 'Dosage', content: '20-40mg daily (oral).' }, { title: 'Cycle Length', content: '3-4 weeks due to high liver toxicity.' } ] },
  // Cutting & Hardening Compounds
  { id: 'anavar', name: 'Anavar (Oxandrolone)', category: 'Cutting & Hardening Compounds', description: 'A mild, well-tolerated oral steroid popular for cutting cycles, preserving muscle, and enhancing fat loss. Also used by women.', details: [ { title: 'Purpose', content: 'Cutting, hardening, mild strength gains, and female cycles.' }, { title: 'Dosage', content: '50-80mg daily (oral).' }, { title: 'Cycle Length', content: '6-8 weeks.' } ] },
  { id: 'winstrol', name: 'Winstrol (Stanozolol)', category: 'Cutting & Hardening Compounds', description: 'A popular oral or injectable steroid known for producing a hard, dry, and vascular look. Can be harsh on joints.', details: [ { title: 'Purpose', content: 'Contest preparation and enhancing athletic performance.' }, { title: 'Dosage', content: '50mg daily (oral) or 50mg every other day (injectable).' }, { title: 'Cycle Length', content: '6-8 weeks.' } ] },
  { id: 'masteron', name: 'Masteron (Drostanolone Propionate)', category: 'Cutting & Hardening Compounds', description: 'A DHT-derivative known for its hardening effects and anti-estrogenic properties. Best used on an already lean physique.', details: [ { title: 'Purpose', content: 'A "finishing" compound for contest prep, providing a hard and dry look.' }, { title: 'Dosage', content: '400-600mg per week.' }, { title: 'Administration', content: 'Injected every other day.' } ] },
  { id: 'primo', name: 'Primobolan (Methenolone Enanthate)', category: 'Cutting & Hardening Compounds', description: 'A high-quality but mild steroid known for producing lean, quality muscle gains with very few side effects. Often considered a "safer" option.', details: [ { title: 'Purpose', content: 'High-quality lean muscle gains, cutting, and use by women.' }, { title: 'Dosage', content: '600-800mg per week.' }, { title: 'Cycle Length', content: '12+ weeks.' } ] },
  // Specialty Compounds
  { id: 'eq', name: 'Equipoise (Boldenone Undecylenate)', category: 'Specialty Compounds', description: 'A versatile steroid known for producing slow, quality gains and a significant increase in appetite and endurance.', details: [ { title: 'Purpose', content: 'Long bulking cycles, improving endurance, and stimulating appetite.' }, { title: 'Dosage', content: '600-800mg per week.' }, { title: 'Cycle Length', content: '16-20 weeks due to its very long ester.' } ] },
  { id: 'tbol', name: 'Turinabol (Chlorodehydromethyltestosterone)', category: 'Specialty Compounds', description: 'An oral steroid that provides lean, quality gains with no water retention, similar to a mild version of Dianabol.', details: [ { title: 'Purpose', content: 'Athletic performance and "lean bulk" cycles.' }, { title: 'Dosage', content: '40-60mg daily (oral).' }, { title: 'Cycle Length', content: '6-8 weeks.' } ] },
  { id: 'superdrol', name: 'Superdrol (Methasterone)', category: 'Specialty Compounds', description: 'A potent oral designer steroid known for producing rapid, dry gains in muscle and strength, but it is very liver toxic.', details: [ { title: 'Purpose', content: 'Short, powerful cycles for rapid results.' }, { title: 'Dosage', content: '20-30mg daily (oral).' }, { title: 'Cycle Length', content: '3-4 weeks maximum.' } ] },
  // Herbal & Natural Support
  {
    id: 'herbal-test-support',
    name: 'Natural Testosterone Support',
    category: 'Herbal & Natural Support',
    description: 'A combination of herbs and natural compounds aimed at supporting the body\'s endogenous testosterone production, managing cortisol, and improving libido.',
    details: [
      { title: 'Key Compounds', content: ['Ashwagandha', 'Tongkat Ali (Eurycoma longifolia)', 'Fadogia Agrestis', 'Fenugreek', 'Zinc & Magnesium'] },
      { title: 'Ashwagandha', content: 'Purpose: An adaptogen that primarily works by reducing cortisol, which can indirectly support testosterone levels. Also helps with stress and recovery.\nDosage: 300-600mg of a standardized extract (e.g., KSM-66) daily.' },
      { title: 'Tongkat Ali', content: 'Purpose: May increase free testosterone by unbinding it from SHBG (Sex Hormone-Binding Globulin) and stimulating production.\nDosage: 200-400mg of a standardized extract daily.' },
      { title: 'Fadogia Agrestis', content: 'Purpose: A traditional herb thought to mimic Luteinizing Hormone (LH), directly signaling the testes to produce more testosterone.\nDosage: 600mg daily. Cycle this compound (e.g., 8 weeks on, 4 weeks off) to avoid potential side effects.' },
      { title: 'Fenugreek', content: 'Purpose: Often used to boost libido and may help with free testosterone levels.\nDosage: 500-600mg daily.' },
      { title: 'General Protocol', content: 'These herbs can be taken individually or found in combination "T-booster" products. It is recommended to cycle them (e.g., 8-12 weeks on, 4 weeks off) to maintain efficacy.' }
    ]
  },
  {
    id: 'herbal-liver-support',
    name: 'Liver & Organ Health',
    category: 'Herbal & Natural Support',
    description: 'Herbal compounds and supplements used to support liver function and overall organ health, especially important when using oral compounds.',
    details: [
      { title: 'Key Compounds', content: ['Milk Thistle (Silymarin)', 'TUDCA (Tauroursodeoxycholic acid)', 'N-Acetyl Cysteine (NAC)'] },
      { title: 'Milk Thistle (Silymarin)', content: 'Purpose: A well-known herb with antioxidant and anti-inflammatory properties that helps protect liver cells from damage.\nDosage: 300-600mg of Silymarin daily.' },
      { title: 'TUDCA', content: 'Purpose: A bile acid that is highly effective at protecting the liver from cholestasis (bile backup) caused by oral steroids. Considered the gold standard for on-cycle liver support.\nDosage: 500-1000mg daily when using hepatotoxic compounds.' },
      { title: 'N-Acetyl Cysteine (NAC)', content: 'Purpose: A precursor to glutathione, the body\'s master antioxidant. It supports liver detoxification and cellular health.\nDosage: 600-1200mg daily.' }
    ]
  },
  {
    id: 'herbal-joint-support',
    name: 'Joint & Inflammation Support',
    category: 'Herbal & Natural Support',
    description: 'Natural compounds focused on reducing inflammation, supporting cartilage health, and alleviating joint pain associated with heavy training.',
    details: [
      { title: 'Key Compounds', content: ['Turmeric (Curcumin)', 'Cissus Quadrangularis', 'Boswellia Serrata', 'Glucosamine & Chondroitin'] },
      { title: 'Turmeric (Curcumin)', content: 'Purpose: Curcumin is a potent anti-inflammatory compound. It\'s crucial to take it with black pepper extract (piperine) for absorption.\nDosage: 500-1000mg of Curcumin daily.' },
      { title: 'Cissus Quadrangularis', content: 'Purpose: A traditional medicinal plant known for its ability to help reduce joint pain and support bone health. Particularly popular with bodybuilders.\nDosage: 3000-6000mg daily, split into multiple doses.' },
      { title: 'Boswellia Serrata', content: 'Purpose: An herbal extract that may help reduce inflammation and pain by inhibiting inflammatory enzymes.\nDosage: 300-500mg daily.' }
    ]
  },
  // Post Cycle Therapy (PCT)
  { id: 'clomid', name: 'Clomid (Clomiphene Citrate)', category: 'Post Cycle Therapy (PCT)', description: 'A Selective Estrogen Receptor Modulator (SERM) used to restart the body\'s natural testosterone production after a cycle.', details: [ { title: 'Purpose', content: 'HPTA recovery and maintenance of gains post-cycle.' }, { title: 'Dosage', content: '50mg daily for 4-6 weeks.' }, { title: 'Timing', content: 'Start approximately 2 weeks after the last injection of a long-ester steroid.' } ] },
  { id: 'nolva', name: 'Nolvadex (Tamoxifen Citrate)', category: 'Post Cycle Therapy (PCT)', description: 'Another primary SERM used for kickstarting natural testosterone production. Can be used alone or with Clomid.', details: [ { title: 'Purpose', content: 'Blocks estrogen at the pituitary, stimulating testosterone production.' }, { title: 'Dosage', content: '20-40mg daily for 4-6 weeks.' }, { title: 'Timing', content: 'Often started alongside Clomid or as an alternative.' } ] },
  { id: 'hcg-pct', name: 'HCG (Human Chorionic Gonadotropin)', category: 'Post Cycle Therapy (PCT)', description: 'Used during the last few weeks of a cycle to prevent testicular atrophy and prime the testes for PCT.', details: [ { title: 'Purpose', content: 'Maintains testicular size and function.' }, { title: 'Dosage', content: '1000-2000 IU twice weekly.' }, { title: 'Timing', content: 'Typically used for the last 2-3 weeks of a cycle, stopping before PCT begins.' } ] },
  // Cycle Support & AIs
  { id: 'arimidex', name: 'Anastrozole (Arimidex)', category: 'Cycle Support & AIs', description: 'A popular Aromatase Inhibitor (AI) used to control estrogen levels during a cycle.', details: [ { title: 'Purpose', content: 'Prevent gynecomastia, water retention, and other estrogen-related side effects.' }, { title: 'Dosage', content: '0.25-1mg every other day, as needed based on symptoms and blood work.' } ] },
  { id: 'aromasin', name: 'Exemestane (Aromasin)', category: 'Cycle Support & AIs', description: 'A "suicidal" Aromatase Inhibitor that irreversibly binds to the aromatase enzyme.', details: [ { title: 'Purpose', content: 'Effective estrogen control during cycle and can be useful in PCT.' }, { title: 'Dosage', content: '12.5-25mg daily, as needed.' } ] },
  { id: 'caber', name: 'Cabergoline (Dostinex)', category: 'Cycle Support & AIs', description: 'A dopamine agonist used to control prolactin levels, which can become elevated when using 19-nor compounds like Trenbolone or Deca.', details: [ { title: 'Purpose', content: 'Prevent prolactin-related side effects (e.g., lactation, sexual dysfunction).' }, { title: 'Dosage', content: '0.25-0.5mg twice weekly during cycles containing 19-nor compounds.' } ] },
  // Fat Burners & Cutting Aids
  { id: 'clen', name: 'Clenbuterol', category: 'Fat Burners & Cutting Aids', description: 'A powerful beta-2 agonist that stimulates the metabolism and helps burn fat while preserving muscle.', details: [ { title: 'Purpose', content: 'Rapid fat loss during cutting cycles.' }, { title: 'Dosage', content: 'Start at 20mcg/day and pyramid up to 120mcg/day as tolerated.' }, { title: 'Protocol', content: 'Typically used in a "2 weeks on, 2 weeks off" format to maintain receptor sensitivity.' } ] },
  { id: 't3', name: 'T3 (Liothyronine Sodium)', category: 'Fat Burners & Cutting Aids', description: 'A synthetic thyroid hormone that directly boosts metabolic rate, leading to accelerated fat loss.', details: [ { title: 'Purpose', content: 'Accelerated fat loss by directly increasing metabolism.' }, { title: 'Dosage', content: '25-75mcg daily.' }, { title: 'Cycle Length', content: '6-8 weeks maximum to avoid thyroid shutdown.' }, { title: 'Warning', content: 'Must be used with caution as high doses can cause muscle loss.', isWarning: true } ] },
  { id: 'yohimbine', name: 'Yohimbine HCl', category: 'Fat Burners & Cutting Aids', description: 'An alpha-2 antagonist that helps to mobilize stubborn body fat, particularly effective when taken in a fasted state.', details: [ { title: 'Purpose', content: 'Targeting and mobilizing stubborn fat areas (e.g., lower back, abdomen).' }, { title: 'Dosage', content: '0.2mg per kg of bodyweight.' }, { title: 'Timing', content: 'Most effective when taken before fasted cardio.' } ] },
  // Peptides & Growth Factors
  { id: 'hgh', name: 'Growth Hormone (Somatropin)', category: 'Peptides & Growth Factors', description: 'A foundational compound for body recomposition, fat loss, recovery, and anti-aging.', details: [ { title: 'Purpose', content: 'Fat loss, muscle growth, improved recovery, and overall wellness.' }, { title: 'Dosage', content: '2-6 IU daily.' }, { title: 'Administration', content: 'Often split into two doses, AM and PM.' } ] },
  { id: 'igf1-lr3', name: 'IGF-1 LR3', category: 'Peptides & Growth Factors', description: 'A long-acting version of Insulin-Like Growth Factor 1, a potent driver of muscle growth (hyperplasia).', details: [ { title: 'Purpose', content: 'Directly stimulating muscle growth.' }, { title: 'Dosage', content: '20-50mcg daily.' }, { title: 'Cycle Length', content: '4-6 weeks.' } ] },
  { id: 'ghrp2', name: 'GHRP-2', category: 'Peptides & Growth Factors', description: 'A Growth Hormone Releasing Peptide that stimulates a strong, immediate pulse of natural GH from the pituitary.', details: [ { title: 'Purpose', content: 'Inducing a natural growth hormone boost.' }, { title: 'Dosage', content: '100-300mcg, 2-3 times daily.' }, { title: 'Timing', content: 'Best administered on an empty stomach.' } ] },
  { id: 'cjc-dac', name: 'CJC-1295 with DAC', category: 'Peptides & Growth Factors', description: 'A long-acting Growth Hormone Releasing Hormone (GHRH) that causes a sustained elevation of GH and IGF-1 levels.', details: [ { title: 'Purpose', content: 'Creating a steady, elevated "bleed" of natural growth hormone.' }, { title: 'Dosage', content: '2-3mg weekly.' }, { title: 'Administration', content: 'Injected once or twice per week.' } ] },
  // SARMs
  { id: 'ostarine', name: 'Ostarine (MK-2866)', category: 'SARMs', description: 'One of the mildest and most studied SARMs, excellent for beginners, cutting, and preserving muscle.', details: [ { title: 'Purpose', content: 'Beginner cycles, cutting phases, and body recomposition.' }, { title: 'Dosage', content: '10-25mg daily.' }, { title: 'Cycle Length', content: '8-12 weeks.' } ] },
  { id: 'lgd-4033', name: 'LGD-4033 (Ligandrol)', category: 'SARMs', description: 'A potent SARM known for its ability to produce significant gains in muscle mass and strength.', details: [ { title: 'Purpose', content: 'Bulking and strength gain cycles.' }, { title: 'Dosage', content: '5-15mg daily.' }, { title: 'Cycle Length', content: '8-10 weeks.' } ] },
  { id: 'rad-140', name: 'RAD-140 (Testolone)', category: 'SARMs', description: 'A powerful SARM with an anabolic-to-androgenic ratio comparable to testosterone, excellent for lean mass.', details: [ { title: 'Purpose', content: 'Building strength, mass, and enhancing performance.' }, { title: 'Dosage', content: '10-20mg daily.' }, { title: 'Cycle Length', content: '8-10 weeks.' } ] },
  { id: 's4', name: 'S4 (Andarine)', category: 'SARMs', description: 'A SARM known for its muscle hardening and strength-gaining effects, popular in cutting cycles. Can have vision side effects.', details: [ { title: 'Purpose', content: 'Cutting cycles, muscle hardening, and strength gain.' }, { title: 'Dosage', content: '50-75mg daily.' }, { title: 'Cycle Length', content: '6-8 weeks.' } ] },
  { id: 'yk11', name: 'YK-11', category: 'SARMs', description: 'A unique compound often classified as a SARM that also acts as a myostatin inhibitor, potentially leading to extreme muscle growth.', details: [ { title: 'Purpose', content: 'Breaking through genetic limits for muscle growth.' }, { title: 'Dosage', content: '5-15mg daily.' }, { title: 'Cycle Length', content: '6-8 weeks.' } ] }
];