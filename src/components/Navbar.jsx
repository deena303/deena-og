import React, { useState, useEffect, useRef } from 'react';
import { personalInfo as staticPersonalInfo } from '../data/portfolioData';
import { useData } from '../context/DataContext';
import CreepyButton from './ui/creepy-button';

const Navbar = () => {
  const { data } = useData();
  const personalInfo = data?.settings?.personalInfo || staticPersonalInfo;
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [isLightSection, setIsLightSection] = useState(false);
  const lastScrollY = useRef(0);

  // Handle scroll detection and direction
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Determine scroll direction for the subtle -8px animation
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsScrollingDown(true);
      } else {
        setIsScrollingDown(false);
      }
      
      // Scrolled state for glassmorphism
      if (currentScrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
      
      lastScrollY.current = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle Intersection Observer for Active Links and Background Lightness
  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          setActiveSection(sectionId);
          
          // Check if section background is light to adjust navbar opacity
          const bgColor = window.getComputedStyle(entry.target).backgroundColor;
          // Simple heuristic for "light" background (very rough check for high RGB values)
          const isLight = bgColor.match(/\d+/g)?.slice(0,3).reduce((a, b) => parseInt(a) + parseInt(b), 0) > 600;
          setIsLightSection(isLight);
        }
      });
    }, {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    });

    sections.forEach(section => observer.observe(section));
    return () => sections.forEach(section => observer.unobserve(section));
  }, []);

  const navLinks = ['Home', 'About', 'Skills', 'Projects', 'Contact'];

  const scrollToSection = (e, link) => {
    e.preventDefault();
    setIsOpen(false);
    
    // Map 'Home' to top of page, otherwise find by id
    if (link === 'Home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const targetId = link.toLowerCase();
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Advanced Glassmorphism and visibility classes
  const glassClasses = isScrolled 
    ? isLightSection 
      ? 'bg-[rgba(15,15,15,0.95)] backdrop-blur-[24px] border-b border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.25)] py-4' // Higher opacity
      : 'bg-[rgba(15,15,15,0.75)] backdrop-blur-[18px] border-b border-[rgba(255,255,255,0.08)] shadow-[0_8px_30px_rgba(0,0,0,0.18)] py-4' // Standard premium glass
    : 'bg-transparent border-b border-transparent py-6';

  // Animation classes for scroll direction (-8px translate)
  const scrollAnimClasses = isScrollingDown && !isOpen
    ? '-translate-y-2'
    : 'translate-y-0';

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-[9999] transition-all duration-250 ease-out ${glassClasses} ${scrollAnimClasses}`}
      style={{ transitionDuration: '250ms' }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 flex justify-between items-center">
        
        {/* Left Side: Logo/Name */}
        <div className="flex items-center">
          <a href="#" onClick={(e) => scrollToSection(e, 'Home')} className="text-white text-2xl font-black tracking-tight whitespace-nowrap">
            {personalInfo.brandName.replace(' ', '')}
          </a>
        </div>

        {/* Center: Desktop Menu Links */}
        <div className="hidden md:flex space-x-6 lg:space-x-8">
          {navLinks.map((link) => {
            const id = link.toLowerCase();
            const isActive = activeSection === id || (activeSection === '' && id === 'home');
            return (
              <a 
                key={link} 
                href={`#${id}`}
                onClick={(e) => scrollToSection(e, link)}
                className={`font-medium relative group transition-colors duration-300 ${isActive ? 'text-white' : 'text-white/70 hover:text-white'}`}
              >
                {link}
                {/* Smooth hover/active underline */}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-red-500 transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </a>
            );
          })}
        </div>

        {/* Right Side: CTA Button */}
        <div className="hidden md:block">
          <CreepyButton onClick={() => window.open("https://wa.me/916382097752", "_blank", "noopener,noreferrer")}>
            Let's Talk
          </CreepyButton>
        </div>

        {/* Mobile Hamburger Menu Icon */}
        <div className="md:hidden flex items-center">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="text-white focus:outline-none p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Full-Screen Overlay Menu */}
      <div 
        className={`md:hidden fixed top-[72px] left-0 w-full h-[calc(100vh-72px)] transition-all duration-300 ease-out overflow-hidden z-[9998] ${
          isOpen ? 'opacity-100 visible bg-[rgba(15,15,15,0.98)] backdrop-blur-3xl' : 'opacity-0 invisible bg-transparent'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full space-y-8 pb-20">
          {navLinks.map((link) => {
            const id = link.toLowerCase();
            const isActive = activeSection === id || (activeSection === '' && id === 'home');
            return (
              <a 
                key={link} 
                href={`#${id}`}
                onClick={(e) => scrollToSection(e, link)}
                className={`font-black text-4xl tracking-tight transition-colors duration-300 ${isActive ? 'text-red-500' : 'text-white hover:text-red-400'}`}
              >
                {link}
              </a>
            );
          })}
          <div className="pt-8">
             <CreepyButton 
               onClick={() => {
                 setIsOpen(false);
                 window.open("https://wa.me/916382097752", "_blank", "noopener,noreferrer");
               }}
             >
               Let's Talk
             </CreepyButton>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
