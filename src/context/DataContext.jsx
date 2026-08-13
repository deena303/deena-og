import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import {
  personalInfo,
  socialLinks,
  heroContent,
  aboutContent,
  skillsContent,
  technicalSkills,
  contentCreation,
  leadershipList,
  internshipsList,
  softSkillsList,
  projects as initialProjects,
  certificates as initialCertificates,
  education,
  footerContent
} from '../data/portfolioData';

const DataContext = createContext();

export function useData() {
  return useContext(DataContext);
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export function DataProvider({ children }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to construct fallback data schema from portfolioData.js
  const getInitialFallbackSchema = useCallback(() => {
    const newProjects = initialProjects.map((p, index) => ({
      ...p,
      id: p.id || generateId(),
      showProject: true,
      order: index,
    }));

    let newSkills = [];
    technicalSkills.categories.forEach((cat, catIdx) => {
      cat.skills.forEach((skill, skillIdx) => {
        newSkills.push({
          id: generateId(),
          name: skill.name,
          percentage: skill.level,
          category: cat.title.replace(' ⭐', ''),
          icon: '',
          showSkill: true,
          order: catIdx * 100 + skillIdx,
        });
      });
    });

    const newCertificates = initialCertificates.featured.map((c, index) => ({
      ...c,
      id: generateId(),
      showCertificate: true,
      order: index,
    }));

    const newExperience = internshipsList.map((exp, index) => ({
      ...exp,
      id: generateId(),
      showExperience: true,
      order: index,
    }));

    const newLeadership = leadershipList.map((l, index) => ({
      ...l,
      id: generateId(),
      showLeadership: true,
      order: index,
    }));

    const newSettings = {
      personalInfo,
      socialLinks,
      heroContent,
      aboutContent,
      footerContent,
    };

    return {
      projects: newProjects,
      skills: newSkills,
      certificates: newCertificates,
      experience: newExperience,
      leadership: newLeadership,
      settings: newSettings,
    };
  }, []);

  // Fetch data from Supabase
  const fetchSupabaseData = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return false;

    try {
      const [
        { data: projectsRes, error: pErr },
        { data: skillsRes, error: skErr },
        { data: certsRes, error: cErr },
        { data: expRes, error: eErr },
        { data: leadRes, error: lErr },
        { data: settingsRes, error: stErr }
      ] = await Promise.all([
        supabase.from('projects').select('*').order('order_index', { ascending: true }),
        supabase.from('skills').select('*').order('order_index', { ascending: true }),
        supabase.from('certificates').select('*').order('order_index', { ascending: true }),
        supabase.from('experience').select('*').order('order_index', { ascending: true }),
        supabase.from('leadership').select('*').order('order_index', { ascending: true }),
        supabase.from('site_settings').select('*').eq('id', 'default').single()
      ]);

      if (pErr || skErr || cErr || eErr || lErr) {
        console.warn("Supabase fetch warning, using fallback:", pErr || skErr || cErr || eErr || lErr);
        return false;
      }

      // Format Projects
      const projects = (projectsRes || []).map(p => ({
        id: p.id,
        title: p.title || '',
        description: p.description || '',
        badge: p.badge || '',
        role: p.role || '',
        category: p.category || '',
        techTags: p.tech_tags || [],
        tags: p.tags || [],
        links: p.links || {},
        showProject: p.show_project ?? true,
        isFlagship: p.is_flagship ?? false,
        year: p.year || '',
        thumbnail: p.thumbnail || '',
        order: p.order_index ?? 0
      }));

      // Format Skills
      const skills = (skillsRes || []).map(s => ({
        id: s.id,
        name: s.name || '',
        percentage: s.percentage ?? 0,
        category: s.category || 'General',
        icon: s.icon || '',
        showSkill: s.show_skill ?? true,
        order: s.order_index ?? 0
      }));

      // Format Certificates
      const certificates = (certsRes || []).map(c => ({
        id: c.id,
        name: c.name || '',
        issuer: c.issuer || '',
        status: c.status || '',
        icon: c.icon || '🏆',
        pdf: c.pdf_url || '',
        showCertificate: c.show_certificate ?? true,
        order: c.order_index ?? 0
      }));

      // Format Experience
      const experience = (expRes || []).map(e => ({
        id: e.id,
        organization: e.organization || '',
        role: e.role || '',
        duration: e.duration || '',
        badge: e.badge || '',
        description: e.description || '',
        skills: e.skills || [],
        tech: e.tech || [],
        showExperience: e.show_experience ?? true,
        order: e.order_index ?? 0
      }));

      // Format Leadership
      const leadership = (leadRes || []).map(l => ({
        id: l.id,
        title: l.title || '',
        description: l.description || '',
        role: l.role || '',
        badge: l.badge || '',
        showLeadership: l.show_leadership ?? true,
        order: l.order_index ?? 0
      }));

      // Format Settings
      const rawSettings = settingsRes || {};
      const settings = {
        personalInfo: rawSettings.personal_info || personalInfo,
        socialLinks: rawSettings.social_links || socialLinks,
        heroContent: rawSettings.hero_content || heroContent,
        aboutContent: rawSettings.about_content || aboutContent,
        footerContent: rawSettings.footer_content || footerContent
      };

      const supabaseSchema = {
        projects,
        skills,
        certificates,
        experience,
        leadership,
        settings
      };

      setData(supabaseSchema);
      return true;
    } catch (e) {
      console.error("Error fetching from Supabase:", e);
      return false;
    }
  }, []);

  // Main Initialization effect
  useEffect(() => {
    let isMounted = true;

    async function initData() {
      setIsLoading(true);
      if (isSupabaseConfigured) {
        const success = await fetchSupabaseData();
        if (success) {
          if (isMounted) setIsLoading(false);
          return;
        }
      }

      // Local storage fallback
      try {
        const localData = localStorage.getItem('portfolio_data');
        if (localData) {
          setData(JSON.parse(localData));
        } else {
          const fallback = getInitialFallbackSchema();
          localStorage.setItem('portfolio_data', JSON.stringify(fallback));
          setData(fallback);
        }
      } catch (e) {
        console.error("Failed to load local fallback data:", e);
        const fallback = getInitialFallbackSchema();
        setData(fallback);
      }
      if (isMounted) setIsLoading(false);
    }

    initData();

    // Subscribe to Supabase Realtime changes if configured
    let channel;
    if (isSupabaseConfigured && supabase) {
      channel = supabase
        .channel('portfolio_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public' },
          () => {
            fetchSupabaseData();
          }
        )
        .subscribe();
    }

    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchSupabaseData, getInitialFallbackSchema]);

  // Update Data handler
  const updateData = async (collectionName, newCollectionData) => {
    // 1. Instantly update local state for snappy UI
    setData(prev => {
      const updated = { ...prev, [collectionName]: newCollectionData };
      if (!isSupabaseConfigured) {
        localStorage.setItem('portfolio_data', JSON.stringify(updated));
      }
      return updated;
    });

    // 2. If Supabase is configured, sync with database
    if (isSupabaseConfigured && supabase) {
      try {
        if (collectionName === 'projects') {
          const formatted = newCollectionData.map((p, idx) => ({
            id: p.id || generateId(),
            title: p.title,
            description: p.description,
            badge: p.badge,
            role: p.role,
            category: p.category,
            tech_tags: p.techTags || [],
            tags: p.tags || [],
            links: p.links || {},
            show_project: p.showProject !== false,
            is_flagship: p.isFlagship === true,
            year: p.year || '',
            thumbnail: p.thumbnail || '',
            order_index: p.order ?? idx
          }));
          
          // Delete missing projects from DB
          const currentIds = formatted.map(f => f.id);
          const { data: dbProjects } = await supabase.from('projects').select('id');
          if (dbProjects) {
            const toDelete = dbProjects.filter(p => !currentIds.includes(p.id)).map(p => p.id);
            if (toDelete.length > 0) {
              await supabase.from('projects').delete().in('id', toDelete);
            }
          }
          await supabase.from('projects').upsert(formatted);
        }
        else if (collectionName === 'skills') {
          const formatted = newCollectionData.map((s, idx) => ({
            id: s.id || generateId(),
            name: s.name,
            percentage: s.percentage ?? 0,
            category: s.category || 'General',
            icon: s.icon || '',
            show_skill: s.showSkill !== false,
            order_index: s.order ?? idx
          }));
          const currentIds = formatted.map(f => f.id);
          const { data: dbSkills } = await supabase.from('skills').select('id');
          if (dbSkills) {
            const toDelete = dbSkills.filter(s => !currentIds.includes(s.id)).map(s => s.id);
            if (toDelete.length > 0) {
              await supabase.from('skills').delete().in('id', toDelete);
            }
          }
          await supabase.from('skills').upsert(formatted);
        }
        else if (collectionName === 'certificates') {
          const formatted = newCollectionData.map((c, idx) => ({
            id: c.id || generateId(),
            name: c.name,
            issuer: c.issuer,
            status: c.status,
            icon: c.icon,
            pdf_url: c.pdf || '',
            show_certificate: c.showCertificate !== false,
            order_index: c.order ?? idx
          }));
          const currentIds = formatted.map(f => f.id);
          const { data: dbCerts } = await supabase.from('certificates').select('id');
          if (dbCerts) {
            const toDelete = dbCerts.filter(c => !currentIds.includes(c.id)).map(c => c.id);
            if (toDelete.length > 0) {
              await supabase.from('certificates').delete().in('id', toDelete);
            }
          }
          await supabase.from('certificates').upsert(formatted);
        }
        else if (collectionName === 'experience') {
          const formatted = newCollectionData.map((e, idx) => ({
            id: e.id || generateId(),
            organization: e.organization,
            role: e.role,
            duration: e.duration,
            badge: e.badge,
            description: e.description,
            skills: e.skills || [],
            tech: e.tech || [],
            show_experience: e.showExperience !== false,
            order_index: e.order ?? idx
          }));
          const currentIds = formatted.map(f => f.id);
          const { data: dbExp } = await supabase.from('experience').select('id');
          if (dbExp) {
            const toDelete = dbExp.filter(e => !currentIds.includes(e.id)).map(e => e.id);
            if (toDelete.length > 0) {
              await supabase.from('experience').delete().in('id', toDelete);
            }
          }
          await supabase.from('experience').upsert(formatted);
        }
        else if (collectionName === 'leadership') {
          const formatted = newCollectionData.map((l, idx) => ({
            id: l.id || generateId(),
            title: l.title,
            description: l.description,
            role: l.role,
            badge: l.badge,
            show_leadership: l.showLeadership !== false,
            order_index: l.order ?? idx
          }));
          const currentIds = formatted.map(f => f.id);
          const { data: dbLead } = await supabase.from('leadership').select('id');
          if (dbLead) {
            const toDelete = dbLead.filter(l => !currentIds.includes(l.id)).map(l => l.id);
            if (toDelete.length > 0) {
              await supabase.from('leadership').delete().in('id', toDelete);
            }
          }
          await supabase.from('leadership').upsert(formatted);
        }
        else if (collectionName === 'settings') {
          await supabase.from('site_settings').upsert({
            id: 'default',
            personal_info: newCollectionData.personalInfo,
            social_links: newCollectionData.socialLinks,
            hero_content: newCollectionData.heroContent,
            about_content: newCollectionData.aboutContent,
            footer_content: newCollectionData.footerContent,
            updated_at: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error(`Failed to update ${collectionName} in Supabase:`, err);
      }
    }
  };

  if (error) {
    return <div style={{ color: 'red', padding: '20px', background: 'black', height: '100vh' }}>Data Context Error: {error}</div>;
  }

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center flex-col gap-3">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-white/60 text-xs font-mono tracking-widest uppercase">Loading CMS Content...</span>
      </div>
    );
  }

  return (
    <DataContext.Provider value={{ data, updateData, isSupabaseActive: isSupabaseConfigured }}>
      {children}
    </DataContext.Provider>
  );
}
