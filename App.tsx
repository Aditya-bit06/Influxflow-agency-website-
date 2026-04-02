/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { ArrowUpRight, Linkedin, Instagram, Menu, X as CloseIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { IntakeForm } from './components/IntakeForm';

import logoImg from './logo1.png';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const Logo = ({ className = "", isLight = false }: { className?: string, isLight?: boolean }) => (
  <div className={`flex items-center ${className}`}>
    <img 
      src={logoImg} 
      alt="InfluxFlow" 
      className={`h-[31px] w-auto object-contain ${isLight ? "brightness-0 invert" : ""}`}
      referrerPolicy="no-referrer"
    />
  </div>
);

const Tooltip = ({ children, text }: { children: ReactNode, text: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div 
      className="relative inline-block" 
      onMouseEnter={() => setIsVisible(true)} 
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 5, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 5, x: '-50%' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute bottom-full left-1/2 mb-3 px-3 py-1.5 bg-ink text-bg text-[10px] uppercase tracking-widest font-bold whitespace-nowrap z-[60] pointer-events-none shadow-xl"
          >
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-ink" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const preloaderRef = useRef<HTMLDivElement>(null);
  const preloaderTextRef = useRef<HTMLDivElement>(null);

  const handleStart = () => {
    if (isStarted) return;
    
    const tl = gsap.timeline({
      onComplete: () => setIsStarted(true)
    });

    tl.to(preloaderTextRef.current, {
      scale: 50,
      opacity: 0,
      duration: 1.5,
      ease: 'power4.inOut'
    })
    .to(preloaderRef.current, {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out'
    }, '-=0.5');
  };

  useEffect(() => {
    if (!isStarted) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      // Entrance animations
      gsap.from(headlineRef.current, {
        y: 100,
        scale: 0.9,
        rotation: -2,
        opacity: 0,
        duration: 1.5,
        ease: 'power4.out',
        delay: 0.2,
      });

      gsap.from(subtextRef.current, {
        y: 30,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
        delay: 0.8,
      });

      // Parallax and scroll reveals
      gsap.to('.hero-content', {
        scrollTrigger: {
          trigger: '.hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
        y: 150,
        ease: 'none',
      });

      gsap.to('.hero-bg-text', {
        scrollTrigger: {
          trigger: '.hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
        x: -200,
        ease: 'none',
      });

      // Service cards parallax
      const cards = gsap.utils.toArray('.service-card-inner');
      cards.forEach((card: any, i: number) => {
        gsap.to(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
          y: i % 2 === 0 ? -40 : 40,
          ease: 'none',
        });
      });

      // Statement parallax
      gsap.to('.statement-text', {
        scrollTrigger: {
          trigger: '.statement-section',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
        y: -50,
        ease: 'none',
      });

      const reveals = gsap.utils.toArray('.reveal');
      reveals.forEach((el: any) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
          y: 60,
          rotation: 2,
          scale: 0.95,
          opacity: 0,
          duration: 1.2,
          ease: 'power4.out',
        });
      });

      // Navbar scroll animation
      gsap.to('.nav-glass', {
        scrollTrigger: {
          start: 'top -100',
          end: 'top -200',
          scrub: true,
        },
        height: '64px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        ease: 'none',
      });
    }, mainRef);

    return () => {
      ctx.revert();
      lenis.destroy();
    };
  }, [isStarted]);

  return (
    <div ref={mainRef} className="relative min-h-screen">
      {!isStarted && (
        <div 
          ref={preloaderRef}
          onClick={handleStart}
          className="fixed inset-0 z-[100] bg-ink flex items-center justify-center cursor-pointer overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="film-grain" />
          </div>
          <div 
            ref={preloaderTextRef}
            className="select-none"
          >
            <Logo isLight className="scale-150 md:scale-[2.5]" />
          </div>
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 animate-pulse">
            <span className="text-[9px] uppercase tracking-[0.4em] text-bg/40 font-bold">Tap to enter</span>
          </div>
        </div>
      )}

      <div className={`transition-opacity duration-1000 ${isStarted ? 'opacity-100' : 'opacity-0'}`}>
        <div className="film-grain" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 nav-glass transition-all duration-500">
        <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <Logo />
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-12">
            <a href="#services" className="text-[11px] uppercase tracking-[0.2em] text-ink/70 hover:text-accent transition-colors font-bold">
              Services
            </a>
            <a href="#process" className="text-[11px] uppercase tracking-[0.2em] text-ink/70 hover:text-accent transition-colors font-bold">
              Process
            </a>
            <Tooltip text="Let's get started!">
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255, 184, 0, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsFormOpen(true)}
                className="bg-ink text-bg px-6 py-2.5 font-syne font-bold uppercase text-[11px] tracking-widest flex items-center gap-2 hover:bg-accent hover:text-ink transition-all"
              >
                Start a Project
                <ArrowUpRight size={16} />
              </motion.button>
            </Tooltip>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-ink p-2"
          >
            {isMenuOpen ? <CloseIcon size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 w-full bg-white border-b border-ink/5 p-8 flex flex-col gap-6 md:hidden shadow-xl"
            >
              <a 
                href="#services" 
                onClick={() => setIsMenuOpen(false)}
                className="text-lg uppercase tracking-widest font-bold text-ink"
              >
                Services
              </a>
              <a 
                href="#process" 
                onClick={() => setIsMenuOpen(false)}
                className="text-lg uppercase tracking-widest font-bold text-ink"
              >
                Process
              </a>
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsFormOpen(true);
                }}
                className="bg-ink text-bg px-8 py-4 font-bold uppercase text-sm tracking-widest flex items-center justify-center gap-2"
              >
                Start a Project
                <ArrowUpRight size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="hero-section relative min-h-screen flex flex-col justify-center pt-32 pb-24 px-6 md:px-12 overflow-hidden">
        <div className="hero-bg-text absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-syne font-extrabold text-[20vw] text-ink/[0.02] whitespace-nowrap pointer-events-none select-none z-0">
          INFLUX
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="hero-content">
            <p className="font-mono text-[10px] tracking-[0.3em] text-accent uppercase mb-8 font-bold">
              Digital Growth Agency — Est. 2025
            </p>
            
            <h1 
              ref={headlineRef}
              className="text-5xl md:text-7xl lg:text-[90px] font-extrabold leading-[0.95] tracking-tighter mb-12 text-ink"
            >
              WE BUILD BRANDS<br />
              THAT <span className="text-accent italic">MOVE</span><br />
              PEOPLE.
            </h1>
            
            <div className="flex flex-col gap-8">
              <p 
                ref={subtextRef}
                className="font-mono text-xs md:text-sm text-ink/50 max-w-md leading-relaxed uppercase font-medium"
              >
                [SYSTEM READY: WEBSITES THAT CONVERT. ADS THAT PERFORM. RESULTS THAT SPEAK LOUDER THAN PROMISES.]
              </p>
              
              <div className="flex flex-wrap gap-4">
                <a href="#contact" className="inline-flex items-center gap-4 text-[11px] tracking-[0.25em] uppercase font-bold text-ink border border-ink/20 px-8 py-5 hover:bg-accent hover:border-accent transition-all">
                  Begin the conversation
                  <ArrowUpRight size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-12 left-6 flex flex-col items-center gap-4 opacity-20 hidden lg:flex">
          <div className="w-[1px] h-12 bg-ink" />
          <span className="text-[9px] uppercase tracking-[0.3em] text-ink [writing-mode:vertical-lr]">Scroll</span>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative aspect-video w-full bg-ink/5 overflow-hidden rounded-2xl shadow-2xl"
        >
          <video 
            src="/video.mp4" 
            className="w-full h-full object-cover"
            autoPlay 
            loop 
            muted 
            playsInline
          />
        </motion.div>
      </section>

      {/* Marquee */}
      <div className="border-y border-ink/5 py-8 overflow-hidden bg-secondary">
        <div className="flex whitespace-nowrap gap-16 animate-[marquee_20s_linear_infinite]">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-16">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-ink/40">Website Development</span>
              <span className="text-accent">•</span>
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-ink/40">Meta Ads</span>
              <span className="text-accent">•</span>
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-ink/40">SEO & Growth</span>
              <span className="text-accent">•</span>
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-ink/40">Landing Pages</span>
              <span className="text-accent">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      <section id="services" className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-16 reveal">
          <div className="w-10 h-[1px] bg-accent" />
          <p className="text-[9px] uppercase tracking-[0.35em] text-accent font-bold">What We Do</p>
        </div>

        <div className="grid md:grid-cols-2 border border-ink/5">
          {[
            {
              num: "01.",
              title: "Website Design & Development",
              desc: "Clean, fast, conversion-focused websites built for the way people actually browse. No bloat. No filler. Just a digital presence that does real work for your business."
            },
            {
              num: "02.",
              title: "Paid Social & Meta Ads",
              desc: "Data-driven ad campaigns built to reach the right people at the right moment. We don't guess — we test, refine, and scale what works until your ROI speaks for itself."
            },
            {
              num: "03.",
              title: "SEO & Digital Growth",
              desc: "Visibility that compounds. We build your organic presence so that the internet works for you around the clock — no ad spend required."
            },
            {
              num: "04.",
              title: "Landing Pages that Convert",
              desc: "One page. One goal. Maximum impact. Purpose-built landing pages designed around your offer, your audience, and one clear action you want them to take."
            }
          ].map((service, idx) => (
            <div key={idx} className="p-12 border-ink/5 border-r border-b last:border-r-0 md:[&:nth-child(2)]:border-r-0 md:[&:nth-child(3)]:border-b-0 md:[&:nth-child(4)]:border-b-0 hover:bg-secondary transition-colors reveal overflow-hidden">
              <div className="service-card-inner">
                <p className="font-syne italic text-[11px] tracking-widest text-accent mb-8">{service.num}</p>
                <h3 className="text-3xl font-bold mb-6 leading-tight">{service.title}</h3>
                <p className="text-xs leading-relaxed text-ink/60 max-w-xs">{service.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Statement */}
      <section className="statement-section bg-ink text-bg py-48 md:py-64 px-6 text-center overflow-hidden group hover:bg-accent transition-all duration-700 ease-in-out cursor-default">
        <div className="max-w-5xl mx-auto">
          <p className="statement-text text-4xl md:text-7xl lg:text-8xl font-syne font-extrabold leading-[0.9] tracking-tighter group-hover:text-ink transition-colors duration-700 reveal">
            "MOST AGENCIES CHARGE YOU FOR THE BRAND NAME. WE CHARGE YOU FOR THE <span className="italic text-accent group-hover:text-ink/40 transition-colors duration-700">WORK</span> — AND LET RESULTS DO THE TALKING."
          </p>
          <div className="mt-12 w-20 h-[1px] bg-accent group-hover:bg-ink mx-auto transition-colors duration-700 reveal" />
        </div>
      </section>

      {/* Process */}
      <section id="process" className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-16 reveal">
          <div className="w-10 h-[1px] bg-accent" />
          <p className="text-[9px] uppercase tracking-[0.35em] text-accent font-bold">How We Work</p>
        </div>

        <div className="flex flex-col">
          {[
            { step: "i.", title: "Discovery Call", desc: "We start by understanding your business, your goals, and what success actually looks like for you — not for us. No templates. No assumptions.", tag: "Day 1" },
            { step: "ii.", title: "Strategy & Direction", desc: "We map out the approach — which channels, what messaging, what we build first. Everything tied to one thing: measurable growth for your business.", tag: "Day 2–3" },
            { step: "iii.", title: "Build & Launch", desc: "Fast, focused execution. We build, review together, refine, and ship. No endless back-and-forth. No missed deadlines.", tag: "Week 1–2" },
            { step: "iv.", title: "Measure & Grow", desc: "We don't disappear after delivery. We track what's working, double down on it, and keep iterating until your numbers move in the right direction.", tag: "Ongoing" }
          ].map((item, idx) => (
            <div key={idx} className="grid grid-cols-[60px_1fr_auto] items-start py-12 border-b border-ink/5 group hover:bg-secondary/50 transition-all px-4 reveal">
              <span className="font-syne italic text-sm text-accent pt-1">{item.step}</span>
              <div>
                <h4 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">{item.title}</h4>
                <p className="text-xs text-ink/50 max-w-xl leading-relaxed">{item.desc}</p>
              </div>
              <span className="hidden md:block text-[9px] uppercase tracking-widest text-ink/30 border border-ink/10 px-4 py-1.5">{item.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-40 px-6 text-center bg-secondary">
        <p className="text-[10px] uppercase tracking-[0.35em] text-accent font-bold mb-10 reveal">Ready when you are</p>
        <h2 className="text-5xl md:text-8xl font-extrabold tracking-tighter mb-8 reveal">
          LET'S BUILD<br />
          SOMETHING <span className="italic text-accent">REAL.</span>
        </h2>
        <p className="text-xs md:text-sm text-ink/50 tracking-widest uppercase mb-12 max-w-lg mx-auto leading-relaxed reveal">
          No long proposals. No vague timelines. Just a straight conversation about your business and how we can grow it.
        </p>
        <a href="mailto:contact@influxflow.com" className="text-2xl md:text-4xl font-syne font-light border-b border-ink/20 pb-2 hover:text-accent hover:border-accent transition-all reveal">
          contact@influxflow.com
        </a>
        
        <div className="w-[1px] h-16 bg-gradient-to-b from-accent to-transparent mx-auto my-12 reveal" />
        
        <Tooltip text="Let's get started!">
          <motion.button 
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255, 184, 0, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsFormOpen(true)}
            className="bg-accent text-ink px-12 py-6 font-syne font-bold uppercase text-[11px] tracking-[0.3em] hover:bg-ink hover:text-bg transition-all reveal"
          >
            Start a Project
          </motion.button>
        </Tooltip>
      </section>

      <IntakeForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />

      {/* Footer */}
      <footer className="py-16 px-6 md:px-12 border-t border-ink/5 bg-white relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Logo className="scale-90 origin-left" />
            <span className="text-[10px] tracking-widest text-ink/40 uppercase font-bold text-center md:text-left">
              © 2025 Influx Flow. All rights reserved.
            </span>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-8">
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              <a href="#services" className="text-[10px] uppercase tracking-widest text-ink/60 hover:text-accent transition-colors font-bold">Services</a>
              <a href="#process" className="text-[10px] uppercase tracking-widest text-ink/60 hover:text-accent transition-colors font-bold">Process</a>
              <a href="#contact" className="text-[10px] uppercase tracking-widest text-ink/60 hover:text-accent transition-colors font-bold">Contact</a>
            </div>
            
            <div className="flex items-center gap-6">
              <a 
                href="https://www.linkedin.com/company/influxflow/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-ink/40 hover:text-accent transition-colors p-2"
              >
                <Linkedin size={18} />
              </a>
              <a 
                href="https://www.instagram.com/influxflow.agency?igsh=MTV2Y2pvNmVueG0wOA==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-ink/40 hover:text-accent transition-colors p-2"
              >
                <Instagram size={18} />
              </a>
              <a 
                href="https://x.com/Influxflow2025" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-ink/40 hover:text-accent transition-colors p-2"
              >
                <svg 
                  viewBox="0 0 24 24" 
                  aria-hidden="true" 
                  className="w-[18px] h-[18px] fill-current"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </div>
  );
}
