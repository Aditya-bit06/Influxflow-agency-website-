import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, ChevronLeft, ArrowRight } from 'lucide-react';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  businessName: string;
  businessLocation: string;
  businessType: string;
  services: string[];
  businessSize: string;
  revenueRange: string;
  marketingBudget: string;
  marketingChallenge: string[];
  paidAds: string;
  successVision: string;
}

const initialData: FormData = {
  fullName: '',
  email: '',
  phone: '',
  businessName: '',
  businessLocation: '',
  businessType: '',
  services: [],
  businessSize: '',
  revenueRange: '',
  marketingBudget: '',
  marketingChallenge: [],
  paidAds: '',
  successVision: '',
};

interface IntakeFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IntakeForm = ({ isOpen, onClose }: IntakeFormProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      // Reset form when closed
      setTimeout(() => {
        setStep(1);
        setFormData(initialData);
        setErrors({});
        setIsSubmitted(false);
      }, 300);
    }
  }, [isOpen]);

  const validateStep = (currentStep: number) => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (currentStep === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
        newErrors.phone = 'Invalid phone number format';
      }
      if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
      if (!formData.businessLocation.trim()) newErrors.businessLocation = 'Location is required';
    }

    if (currentStep === 2) {
      if (formData.services.length === 0) newErrors.services = 'Select at least one service';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = document.querySelector('[data-error="true"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(3)) {
      try {
        const response = await fetch('/api/inquiry', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();
        
        if (response.ok) {
          if (result.status === 'error_logged') {
            console.warn('Inquiry received but email failed to send:', result.details);
          } else {
            console.log('Inquiry submitted successfully:', result.message);
          }
          setIsSubmitted(true);
        } else {
          console.error('Server error during inquiry submission:', response.status, result);
          // Still show success to the user, but log the error
          setIsSubmitted(true);
        }
      } catch (error) {
        console.error('Network error during inquiry submission:', error);
        setIsSubmitted(true);
      }
    }
  };

  const handleCheckboxChange = (field: keyof FormData, value: string) => {
    const currentValues = formData[field] as string[];
    if (currentValues.includes(value)) {
      setFormData({ ...formData, [field]: currentValues.filter(v => v !== value) });
    } else {
      setFormData({ ...formData, [field]: [...currentValues, value] });
    }
  };

  if (!isOpen) return null;

  if (isSubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[100] bg-[#0A0A0A] flex items-center justify-center p-6"
      >
        <div className="max-w-xl w-full text-center">
          <div className="w-24 h-24 bg-[#F5C518] rounded-full flex items-center justify-center mx-auto mb-12">
            <Check size={48} className="text-[#0A0A0A]" />
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tighter">
            YOU'RE ONE STEP AWAY.
          </h2>
          <p className="text-[#666666] text-lg mb-12 tracking-widest uppercase">
            We've received your details. Now let's find a time to talk.
          </p>
          <a 
            href="https://calendly.com/adityasoni2552006/30min" 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={() => {
              fetch('/api/track-booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, businessName: formData.businessName }),
              }).catch(console.error);
            }}
            className="block w-full bg-[#F5C518] text-[#0A0A0A] py-6 font-bold uppercase tracking-[0.2em] text-sm hover:brightness-90 transition-all mb-6"
          >
            BOOK YOUR FREE STRATEGY CALL →
          </a>
          <p className="text-[#666666] text-xs tracking-widest uppercase">
            30-minute call. No pitch. No pressure. We'll review your submission before we speak.
          </p>
          <button 
            onClick={onClose}
            className="mt-12 text-[#666666] hover:text-white transition-colors uppercase text-[10px] tracking-widest font-bold"
          >
            Close Window
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-[#0A0A0A]/95 flex items-center justify-center md:p-6"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white w-full h-full md:h-auto md:max-w-[680px] relative flex flex-col overflow-hidden"
        >
          {/* Top Accent Bar */}
          <div className="h-[6px] w-full bg-[#F5C518]" />
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-[#1A1A1A] hover:text-[#F5C518] transition-colors z-10"
          >
            <X size={24} />
          </button>

          <div className="p-8 md:p-12 overflow-y-auto max-h-[90vh]">
            {/* Progress Indicator */}
            <div className="mb-12">
              <div className="flex justify-between items-end mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666]">
                  Step {step}/3
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#F5C518]">
                  {Math.round((step / 3) * 100)}% Complete
                </span>
              </div>
              <div className="h-1 w-full bg-[#E0E0E0]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(step / 3) * 100}%` }}
                  className="h-full bg-[#F5C518]"
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-3xl font-extrabold text-[#1A1A1A] mb-2 tracking-tight">
                      Let's See If We're a Good Fit
                    </h2>
                    <p className="text-sm text-[#666666]">
                      This takes 2 minutes. We review every submission personally.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div data-error={!!errors.fullName}>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-2">Full Name</label>
                      <input 
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        className={`w-full p-4 border ${errors.fullName ? 'border-[#E53935]' : 'border-[#E0E0E0]'} focus:border-[#F5C518] outline-none transition-all text-sm`}
                      />
                      {errors.fullName && <p className="text-[10px] text-[#E53935] mt-1 font-bold uppercase">{errors.fullName}</p>}
                    </div>

                    <div data-error={!!errors.email}>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-2">Business Email</label>
                      <input 
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className={`w-full p-4 border ${errors.email ? 'border-[#E53935]' : 'border-[#E0E0E0]'} focus:border-[#F5C518] outline-none transition-all text-sm`}
                      />
                      {errors.email && <p className="text-[10px] text-[#E53935] mt-1 font-bold uppercase">{errors.email}</p>}
                    </div>

                    <div data-error={!!errors.phone}>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-2">Phone Number</label>
                      <input 
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className={`w-full p-4 border ${errors.phone ? 'border-[#E53935]' : 'border-[#E0E0E0]'} focus:border-[#F5C518] outline-none transition-all text-sm`}
                      />
                      {errors.phone && <p className="text-[10px] text-[#E53935] mt-1 font-bold uppercase">{errors.phone}</p>}
                    </div>

                    <div data-error={!!errors.businessName}>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-2">Business Name</label>
                      <input 
                        type="text"
                        value={formData.businessName}
                        onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                        className={`w-full p-4 border ${errors.businessName ? 'border-[#E53935]' : 'border-[#E0E0E0]'} focus:border-[#F5C518] outline-none transition-all text-sm`}
                      />
                      {errors.businessName && <p className="text-[10px] text-[#E53935] mt-1 font-bold uppercase">{errors.businessName}</p>}
                    </div>

                    <div data-error={!!errors.businessLocation}>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-2">Business Location</label>
                      <input 
                        type="text"
                        placeholder="e.g. Scottsdale, Arizona"
                        value={formData.businessLocation}
                        onChange={(e) => setFormData({...formData, businessLocation: e.target.value})}
                        className={`w-full p-4 border ${errors.businessLocation ? 'border-[#E53935]' : 'border-[#E0E0E0]'} focus:border-[#F5C518] outline-none transition-all text-sm`}
                      />
                      {errors.businessLocation && <p className="text-[10px] text-[#E53935] mt-1 font-bold uppercase">{errors.businessLocation}</p>}
                    </div>
                  </div>

                  <button 
                    onClick={handleNext}
                    className="w-full bg-[#F5C518] text-[#0A0A0A] py-6 font-bold uppercase tracking-[0.2em] text-sm hover:brightness-90 transition-all"
                  >
                    Continue →
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-3xl font-extrabold text-[#1A1A1A] mb-2 tracking-tight">
                      Help Us Understand Your Practice
                    </h2>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-4">What type of business do you run?</label>
                      <select 
                        value={formData.businessType}
                        onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                        className="w-full p-4 border border-[#E0E0E0] focus:border-[#F5C518] outline-none transition-all text-sm bg-white"
                      >
                        <option value="">Select an option</option>
                        <option value="Med Spa">Med Spa</option>
                        <option value="Aesthetic Clinic">Aesthetic Clinic</option>
                        <option value="Cosmetic Surgery Practice">Cosmetic Surgery Practice</option>
                        <option value="Dermatology Clinic">Dermatology Clinic</option>
                        <option value="Chiropractic Practice">Chiropractic Practice</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div data-error={!!errors.services}>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-4">What services do you primarily offer?</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {['Botox & Injectables', 'Dermal Fillers', 'Laser Treatments', 'Chemical Peels', 'Body Contouring', 'Other'].map((service) => (
                          <label key={service} className="flex items-center p-4 border border-[#E0E0E0] cursor-pointer hover:bg-[#F5C518]/5 transition-all">
                            <input 
                              type="checkbox"
                              checked={formData.services.includes(service)}
                              onChange={() => handleCheckboxChange('services', service)}
                              className="w-4 h-4 accent-[#F5C518] mr-3"
                            />
                            <span className="text-xs text-[#1A1A1A] font-medium">{service}</span>
                          </label>
                        ))}
                      </div>
                      {errors.services && <p className="text-[10px] text-[#E53935] mt-2 font-bold uppercase">{errors.services}</p>}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-4">Business Size</label>
                      <div className="grid grid-cols-2 gap-4">
                        {['Solo Practice', '2-5 Staff', '6-15 Staff', '15+ Staff'].map((size) => (
                          <label key={size} className="flex items-center p-4 border border-[#E0E0E0] cursor-pointer hover:bg-[#F5C518]/5 transition-all">
                            <input 
                              type="radio"
                              name="businessSize"
                              checked={formData.businessSize === size}
                              onChange={() => setFormData({...formData, businessSize: size})}
                              className="w-4 h-4 accent-[#F5C518] mr-3"
                            />
                            <span className="text-xs text-[#1A1A1A] font-medium">{size}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-4">Monthly Revenue Range</label>
                      <div className="grid grid-cols-2 gap-4">
                        {['Under $20K', '$20K–$50K', '$50K–$100K', '$100K+'].map((range) => (
                          <label key={range} className="flex items-center p-4 border border-[#E0E0E0] cursor-pointer hover:bg-[#F5C518]/5 transition-all">
                            <input 
                              type="radio"
                              name="revenueRange"
                              checked={formData.revenueRange === range}
                              onChange={() => setFormData({...formData, revenueRange: range})}
                              className="w-4 h-4 accent-[#F5C518] mr-3"
                            />
                            <span className="text-xs text-[#1A1A1A] font-medium">{range}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-4">Current Monthly Marketing Budget</label>
                      <div className="grid grid-cols-2 gap-4">
                        {['Under $1K', '$1K–$3K', '$3K–$5K', '$5K+'].map((budget) => (
                          <label key={budget} className="flex items-center p-4 border border-[#E0E0E0] cursor-pointer hover:bg-[#F5C518]/5 transition-all">
                            <input 
                              type="radio"
                              name="marketingBudget"
                              checked={formData.marketingBudget === budget}
                              onChange={() => setFormData({...formData, marketingBudget: budget})}
                              className="w-4 h-4 accent-[#F5C518] mr-3"
                            />
                            <span className="text-xs text-[#1A1A1A] font-medium">{budget}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button 
                      onClick={handleNext}
                      className="w-full bg-[#F5C518] text-[#0A0A0A] py-6 font-bold uppercase tracking-[0.2em] text-sm hover:brightness-90 transition-all"
                    >
                      Continue →
                    </button>
                    <button 
                      onClick={handleBack}
                      className="w-full text-[#666666] text-[10px] font-bold uppercase tracking-widest hover:text-[#1A1A1A] transition-colors"
                    >
                      ← Back
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-3xl font-extrabold text-[#1A1A1A] mb-2 tracking-tight">
                      What's Holding You Back?
                    </h2>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-4">What is your biggest marketing challenge right now?</label>
                      <div className="space-y-3">
                        {[
                          'Not enough new patients',
                          'Inconsistent patient flow',
                          'Tried ads but didn\'t work',
                          'No proper system or funnel',
                          'Poor quality leads',
                          'Don\'t know where to start'
                        ].map((challenge) => (
                          <label key={challenge} className="flex items-center p-4 border border-[#E0E0E0] cursor-pointer hover:bg-[#F5C518]/5 transition-all">
                            <input 
                              type="checkbox"
                              checked={formData.marketingChallenge.includes(challenge)}
                              onChange={() => handleCheckboxChange('marketingChallenge', challenge)}
                              className="w-4 h-4 accent-[#F5C518] mr-3"
                            />
                            <span className="text-xs text-[#1A1A1A] font-medium">{challenge}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-4">Are you currently running any paid ads?</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {['Yes — Facebook/Instagram', 'Yes — Google', 'Both', 'No'].map((option) => (
                          <label key={option} className="flex items-center p-4 border border-[#E0E0E0] cursor-pointer hover:bg-[#F5C518]/5 transition-all">
                            <input 
                              type="radio"
                              name="paidAds"
                              checked={formData.paidAds === option}
                              onChange={() => setFormData({...formData, paidAds: option})}
                              className="w-4 h-4 accent-[#F5C518] mr-3"
                            />
                            <span className="text-xs text-[#1A1A1A] font-medium">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-2">What does success look like for you in 6 months?</label>
                      <textarea 
                        placeholder="e.g. I want to consistently get 30+ new patient bookings per month..."
                        value={formData.successVision}
                        onChange={(e) => setFormData({...formData, successVision: e.target.value})}
                        className="w-full p-4 border border-[#E0E0E0] focus:border-[#F5C518] outline-none transition-all text-sm h-32 resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button 
                      onClick={handleSubmit}
                      className="w-full bg-[#F5C518] text-[#0A0A0A] py-6 font-bold uppercase tracking-[0.2em] text-sm hover:brightness-90 transition-all"
                    >
                      Submit Application →
                    </button>
                    <button 
                      onClick={handleBack}
                      className="w-full text-[#666666] text-[10px] font-bold uppercase tracking-widest hover:text-[#1A1A1A] transition-colors"
                    >
                      ← Back
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
