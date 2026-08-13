import React, { useRef, useState, useEffect } from 'react';
import stackImage from '../assets/about/deena-avatar.png';
import deenaWorkspace from "@/assets/about/deena-workspace.png";
import CursorCard from "./ui/cursor-card";
import SmoothMarquee from "./ui/SmoothMarquee";
import { aboutContent as staticAboutContent } from '../data/portfolioData';
import { useData } from '../context/DataContext';
import TextPressure from './ui/TextPressure';
import VariableProximity from './ui/VariableProximity';

import {
  SiReact, SiNextdotjs, SiTypescript, SiJavascript, SiTailwindcss,
  SiFramer, SiBlender, SiGithub, SiFigma, SiFirebase, SiOpenai
} from "react-icons/si";

// Simpler VS Code SVG
const VsCodeSvg = () => (
  <svg viewBox="0 0 32 32" style={{ width: '1em', height: '1em', display: 'block' }}>
    <polygon fill="#007ACC" points="27.982,3 16,14.982 6.059,7 3,9.5 3,22.5 6.059,25 16,17.018 27.982,29 31,27.5 31,4.5"/>
    <polygon fill="#fff" points="6.059,25 16,17.018 12,13.018 6.059,17.5"/>
    <polygon fill="#fff" points="6.059,7 12,14.982 16,10.982 6.059,14.5"/>
  </svg>
);

const techLogos = [
  { node: <SiReact style={{ color: '#61DAFB', fontSize: '1em' }} />, title: "React" },
  { node: <SiNextdotjs style={{ color: '#ffffff', fontSize: '1em' }} />, title: "Next.js" },
  { node: <SiTypescript style={{ color: '#3178C6', fontSize: '1em' }} />, title: "TypeScript" },
  { node: <SiJavascript style={{ color: '#F7DF1E', fontSize: '1em' }} />, title: "JavaScript" },
  { node: <SiTailwindcss style={{ color: '#38BDF8', fontSize: '1em' }} />, title: "Tailwind CSS" },
  { node: <SiFramer style={{ color: '#F024B6', fontSize: '1em' }} />, title: "Framer Motion" },
  { node: <SiBlender style={{ color: '#F57C00', fontSize: '1em' }} />, title: "Blender" },
  { node: <SiGithub style={{ color: '#ffffff', fontSize: '1em' }} />, title: "GitHub" },
  { node: <VsCodeSvg />, title: "VS Code" },
  { node: <SiFigma style={{ color: '#F24E1E', fontSize: '1em' }} />, title: "Figma" },
  { node: <SiFirebase style={{ color: '#FFCA28', fontSize: '1em' }} />, title: "Firebase" },
  { node: <SiOpenai style={{ color: '#10A37F', fontSize: '1em' }} />, title: "OpenAI" },
];

const About = () => {
  const { data } = useData();
  const aboutContent = data?.settings?.aboutContent || staticAboutContent;
  const containerRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const radius = isTablet ? 60 : 80;

  return (
    <section id="about" className="bg-[#ff2a2a] pt-20 pb-40 px-6 md:px-12 w-full relative overflow-hidden font-sans">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 items-start">

        {/* Left Side: ID Badge and Skills */}
        <div className="flex flex-col items-center w-full md:w-[350px] shrink-0 mt-12 md:mt-0">

          <div data-aos="drop-bounce" className="relative flex justify-center w-full">
            {/* Lanyard string */}
            <div className="absolute -top-32 left-1/2 w-3 h-40 bg-black transform -translate-x-1/2 shadow-inner z-0"></div>
            {/* Lanyard clip */}
            <div className="absolute -top-6 left-1/2 w-6 h-12 bg-gray-300 rounded border border-gray-400 transform -translate-x-1/2 z-10 shadow-[0_2px_10px_rgba(0,0,0,0.3)]"></div>

            {/* Badge Card */}
            <div className="bg-gray-900 w-full max-w-[280px] rounded-2xl p-3 shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative z-20 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
              {/* Cutout Hole */}
              <div className="absolute -top-3 left-1/2 w-16 h-6 bg-gray-900 rounded-t-xl transform -translate-x-1/2 flex justify-center items-center">
                <div className="w-8 h-2 bg-black/30 rounded-full shadow-inner"></div>
              </div>
              {/* Image Container */}
              <div className="w-full aspect-[3/4] overflow-hidden rounded-xl bg-gray-800 border-2 border-transparent">
                <img
                  src={stackImage}
                  alt="V. Deena — Frontend Developer"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Info Content */}
        <div data-aos="fade-left" data-aos-delay="200" className="flex-1 text-white mt-8 md:mt-0 relative z-20">

          <div style={{ display: 'inline-block', width: 'fit-content', overflow: 'visible', marginBottom: '14px' }}>
            <TextPressure
              text={aboutContent.heading}
              flex={true}
              alpha={false}
              stroke={false}
              width={true}
              weight={true}
              italic={true}
              textColor="#000000"
              strokeColor="#000000"
              minFontSize={40}
            />
          </div>
          
          <div
              ref={containerRef}
              className="about-description-container text-lg font-bold mb-12 leading-relaxed max-w-3xl text-[#FFFFFF]"
          >
            {isMobile ? (
              <p className="about-variable-text">
                Hi, my name is <span className="text-black text-xl font-black mx-1 tracking-wide uppercase"><CursorCard
                image={deenaWorkspace}
                description={`Hi, I'm V. Deena 👋\nCreating clean, interactive, and scalable web experiences with modern technologies.`}
                href="#"
                className="hover:bg-transparent dark:hover:bg-transparent !p-0 !m-0 !text-inherit"
            >V. DEENA</CursorCard></span>, an Artificial Intelligence &amp; Machine Learning student and Frontend Developer. I am passionate about building AI-powered applications, workflow automation platforms and enterprise software. I focus on crafting modern, scalable web experiences that make a real impact for students, businesses and organizations.
              </p>
            ) : (
              <>
                <VariableProximity
                    label="Hi, my name is"
                    containerRef={containerRef}
                    fromFontVariationSettings="'wght' 500, 'opsz' 12"
                    toFontVariationSettings="'wght' 900, 'opsz' 28"
                    radius={radius}
                    falloff="linear"
                    className="about-variable-text"
                />
                <CursorCard
                    image={deenaWorkspace}
                    description={`Hi, I'm V. Deena 👋\nCreating clean, interactive, and scalable web experiences with modern technologies.`}
                    href="#"
                    className="hover:bg-transparent dark:hover:bg-transparent !p-0 !m-0 !text-inherit inline-block"
                >
                    <VariableProximity
                        label="V. DEENA"
                        containerRef={containerRef}
                        fromFontVariationSettings="'wght' 500, 'opsz' 12"
                        toFontVariationSettings="'wght' 900, 'opsz' 28"
                        radius={radius}
                        falloff="linear"
                        className="about-variable-text text-black text-xl font-black mx-1 tracking-wide uppercase"
                    />
                </CursorCard>
                <VariableProximity
                    label=", an Artificial Intelligence & Machine Learning student and Frontend Developer. I am passionate about building AI-powered applications, workflow automation platforms and enterprise software. I focus on crafting modern, scalable web experiences that make a real impact for students, businesses and organizations."
                    containerRef={containerRef}
                    fromFontVariationSettings="'wght' 500, 'opsz' 12"
                    toFontVariationSettings="'wght' 900, 'opsz' 28"
                    radius={radius}
                    falloff="linear"
                    className="about-variable-text"
                />
              </>
            )}
          </div>

          {/* Smooth CSS Marquee */}
          <div className="relative w-full mt-10" style={{ height: '72px' }}>
            <SmoothMarquee
              logos={techLogos}
              duration={22}
              size={42}
              gap={36}
              fadeColor="#ff2d2d"
            />
          </div>

        </div>
      </div>

      {/* Torn paper divider at bottom */}
      <div className="absolute bottom-0 left-0 w-full pointer-events-none z-30 transform translate-y-1">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 md:h-20 fill-white">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,119.62,189.5,99.8,242.79,81.82,282.88,63.6,321.39,56.44Z"></path>
        </svg>
      </div>

      {/* Decorative stars */}
      <div className="absolute top-10 right-10 md:right-20 text-black opacity-30 animate-pulse">
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0l2.5 8.5L23 12l-8.5 2.5L12 23l-2.5-8.5L1 12l8.5-2.5z" /></svg>
      </div>
      <div className="absolute bottom-32 left-4 md:left-20 text-black opacity-30 animate-pulse" style={{ animationDelay: '1s' }}>
        <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0l2.5 8.5L23 12l-8.5 2.5L12 23l-2.5-8.5L1 12l8.5-2.5z" /></svg>
      </div>
    </section>
  );
};

export default About;
