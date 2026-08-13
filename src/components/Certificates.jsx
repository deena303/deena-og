import React from 'react';
import { certificates as staticCertificates } from '../data/portfolioData';
import { useData } from '../context/DataContext';

const CertificateCard = ({ cert, aosDelay }) => (
  <div 
    data-aos="zoom-in"
    data-aos-delay={aosDelay}
    className="bg-black/20 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:border-white/25 hover:scale-105 hover:shadow-[0_15px_40px_rgba(0,0,0,0.3)] transition-all duration-500 group flex flex-col h-full"
  >
    <div className="flex items-start gap-4 mb-4">
      <span className="text-2xl mt-0.5 group-hover:scale-110 transition-transform duration-300">{cert.icon}</span>
      <div>
        <h3 className="text-white font-bold text-sm md:text-base leading-tight mb-1 group-hover:text-white transition-colors">
          {cert.name}
        </h3>
        <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
          {cert.issuer}
        </p>
        {cert.status && (
          <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
            {cert.status}
          </span>
        )}
      </div>
    </div>

    {cert.pdf && (
      <a 
        href={cert.pdf}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white hover:text-black transition-all duration-300"
      >
        📄 View Certificate
      </a>
    )}
  </div>
);

const Certificates = () => {
  const { data } = useData();
  const rawCertificates = data?.certificates || staticCertificates.featured;
  const certificateList = rawCertificates
    .filter(c => c.showCertificate !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <section className="bg-[#ff2a2a] pt-20 pb-28 px-6 md:px-12 w-full relative overflow-hidden font-sans">
      
      {/* Torn paper divider at top (transition from dark Projects section) */}
      <div className="absolute top-0 left-0 w-full pointer-events-none z-10 transform -translate-y-[1px] rotate-180">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 md:h-20 fill-[#0a0a0a]">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,119.62,189.5,99.8,242.79,81.82,282.88,63.6,321.39,56.44Z"></path>
        </svg>
      </div>

      <div className="max-w-6xl mx-auto relative z-20">
        {/* Header */}
        <div data-aos="fade-up" className="mb-12 md:mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-black mb-4 tracking-tight">
            Certifications
          </h2>
          <p className="text-red-100 text-base md:text-lg font-semibold max-w-lg mx-auto">
            Industry-recognized certifications that validate my technical expertise.
          </p>
        </div>

        {/* Certificate Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12">
          {certificateList.map((cert, index) => (
            <CertificateCard 
              key={cert.id || cert.name || index} 
              cert={cert} 
              aosDelay={String((index + 1) * 100)} 
            />
          ))}
        </div>


      </div>

      {/* Decorative stars (matching About section) */}
      <div className="absolute top-16 left-6 md:left-16 text-black opacity-20 animate-pulse">
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0l2.5 8.5L23 12l-8.5 2.5L12 23l-2.5-8.5L1 12l8.5-2.5z"/></svg>
      </div>
      <div className="absolute bottom-20 right-8 md:right-24 text-black opacity-20 animate-pulse" style={{ animationDelay: '1.5s' }}>
        <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0l2.5 8.5L23 12l-8.5 2.5L12 23l-2.5-8.5L1 12l8.5-2.5z"/></svg>
      </div>
    </section>
  );
};

export default Certificates;
