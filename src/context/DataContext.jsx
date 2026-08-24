import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import {
  personalInfo as defaultPersonalInfo,
  socialLinks as defaultSocialLinks,
  heroContent as defaultHeroContent,
  aboutContent as defaultAboutContent,
  footerContent as defaultFooterContent,
  projects as initialProjects,
  certificates as initialCertificates,
  internshipsList as initialExperience,
  leadershipList as initialLeadership,
  technicalSkills as initialTechnicalSkills
} from '../data/portfolioData';

const DataContext = createContext();

export function useData() {
  return useContext(DataContext);
}

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'id-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now();
};

export function DataProvider({ children }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data directly from Supabase tables
  const fetchSupabaseData = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase is not configured. Please check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      setIsLoading(false);
      return false;
    }

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
        supabase.from('site_settings').select('*').eq('id', 'default').maybeSingle()
      ]);

      if (pErr || skErr || cErr || eErr || lErr) {
        const fetchError = pErr || skErr || cErr || eErr || lErr;
        console.error('Supabase fetch error:', fetchError);
        setError(fetchError.message || 'Failed to fetch data from Supabase.');
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
        personalInfo: rawSettings.personal_info || defaultPersonalInfo,
        socialLinks: rawSettings.social_links || defaultSocialLinks,
        heroContent: rawSettings.hero_content || defaultHeroContent,
        aboutContent: rawSettings.about_content || defaultAboutContent,
        footerContent: rawSettings.footer_content || defaultFooterContent
      };

      const supabaseData = {
        projects,
        skills,
        certificates,
        experience,
        leadership,
        settings
      };

      setData(supabaseData);
      setError(null);
      return true;
    } catch (e) {
      console.error('Error fetching from Supabase:', e);
      setError(e.message || 'Error connecting to Supabase database.');
      return false;
    }
  }, []);

  // Main Initialization effect
  useEffect(() => {
    let isMounted = true;

    async function initData() {
      setIsLoading(true);
      await fetchSupabaseData();
      if (isMounted) setIsLoading(false);
    }

    initData();

    // Subscribe to Supabase Realtime changes
    let channel;
    if (isSupabaseConfigured && supabase) {
      channel = supabase
        .channel('portfolio_realtime_all')
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
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchSupabaseData]);

  // Update Data handler - Synchronizes directly with Supabase
  const updateData = async (collectionName, newCollectionData) => {
    // 1. Optimistically update local React state for snappy UI
    setData(prev => ({
      ...prev,
      [collectionName]: newCollectionData
    }));

    // 2. Perform DB operations directly in Supabase
    if (!isSupabaseConfigured || !supabase) {
      console.error('Cannot save: Supabase is not configured.');
      return;
    }

    try {
      if (collectionName === 'projects') {
        const formatted = newCollectionData.map((p, idx) => ({
          id: p.id || generateId(),
          title: p.title || '',
          description: p.description || '',
          badge: p.badge || '',
          role: p.role || '',
          category: p.category || '',
          tech_tags: p.techTags || [],
          tags: p.tags || [],
          links: p.links || {},
          show_project: p.showProject !== false,
          is_flagship: p.isFlagship === true,
          year: p.year || '',
          thumbnail: p.thumbnail || '',
          order_index: p.order ?? idx,
          updated_at: new Date().toISOString()
        }));

        // Delete missing projects from Supabase
        const currentIds = formatted.map(f => f.id);
        const { data: dbProjects } = await supabase.from('projects').select('id');
        if (dbProjects) {
          const toDelete = dbProjects.filter(p => !currentIds.includes(p.id)).map(p => p.id);
          if (toDelete.length > 0) {
            await supabase.from('projects').delete().in('id', toDelete);
          }
        }
        await supabase.from('projects').upsert(formatted);
      } else if (collectionName === 'skills') {
        const formatted = newCollectionData.map((s, idx) => ({
          id: s.id || generateId(),
          name: s.name || '',
          percentage: s.percentage ?? 0,
          category: s.category || 'General',
          icon: s.icon || '',
          show_skill: s.showSkill !== false,
          order_index: s.order ?? idx,
          updated_at: new Date().toISOString()
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
      } else if (collectionName === 'certificates') {
        const formatted = newCollectionData.map((c, idx) => ({
          id: c.id || generateId(),
          name: c.name || '',
          issuer: c.issuer || '',
          status: c.status || '',
          icon: c.icon || '🏆',
          pdf_url: c.pdf || '',
          show_certificate: c.showCertificate !== false,
          order_index: c.order ?? idx,
          updated_at: new Date().toISOString()
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
      } else if (collectionName === 'experience') {
        const formatted = newCollectionData.map((e, idx) => ({
          id: e.id || generateId(),
          organization: e.organization || '',
          role: e.role || '',
          duration: e.duration || '',
          badge: e.badge || '',
          description: e.description || '',
          skills: e.skills || [],
          tech: e.tech || [],
          show_experience: e.showExperience !== false,
          order_index: e.order ?? idx,
          updated_at: new Date().toISOString()
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
      } else if (collectionName === 'leadership') {
        const formatted = newCollectionData.map((l, idx) => ({
          id: l.id || generateId(),
          title: l.title || '',
          description: l.description || '',
          role: l.role || '',
          badge: l.badge || '',
          show_leadership: l.showLeadership !== false,
          order_index: l.order ?? idx,
          updated_at: new Date().toISOString()
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
      } else if (collectionName === 'settings') {
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
  };

  // Reset database back to default seed data directly in Supabase
  const resetToDefaults = async () => {
    if (!isSupabaseConfigured || !supabase) return false;

    setIsLoading(true);
    try {
      // 1. Projects
      const formattedProjects = initialProjects.map((p, idx) => ({
        id: p.id || `proj-${idx + 1}`,
        title: p.title,
        description: p.description,
        badge: p.badge,
        role: p.role,
        category: p.category || '',
        tech_tags: p.techTags || [],
        tags: p.tags || [],
        links: p.links || {},
        show_project: true,
        is_flagship: p.isFlagship === true,
        year: p.year || '',
        thumbnail: p.thumbnail || '',
        order_index: idx
      }));
      await supabase.from('projects').delete().neq('id', '___none___');
      await supabase.from('projects').upsert(formattedProjects);

      // 2. Skills
      let formattedSkills = [];
      initialTechnicalSkills.categories.forEach((cat, catIdx) => {
        cat.skills.forEach((s, sIdx) => {
          formattedSkills.push({
            id: `sk-${catIdx * 100 + sIdx + 1}`,
            name: s.name,
            percentage: s.level,
            category: cat.title.replace(' ⭐', ''),
            icon: '',
            show_skill: true,
            order_index: catIdx * 100 + sIdx
          });
        });
      });
      await supabase.from('skills').delete().neq('id', '___none___');
      await supabase.from('skills').upsert(formattedSkills);

      // 3. Certificates
      const formattedCerts = initialCertificates.featured.map((c, idx) => ({
        id: `cert-${idx + 1}`,
        name: c.name,
        issuer: c.issuer,
        status: c.status,
        icon: c.icon || '🏆',
        pdf_url: c.pdf || '',
        show_certificate: true,
        order_index: idx
      }));
      await supabase.from('certificates').delete().neq('id', '___none___');
      await supabase.from('certificates').upsert(formattedCerts);

      // 4. Experience
      const formattedExp = initialExperience.map((e, idx) => ({
        id: `exp-${idx + 1}`,
        organization: e.organization,
        role: e.role,
        duration: e.duration,
        badge: e.badge,
        description: e.description,
        skills: e.skills || [],
        tech: e.tech || [],
        show_experience: true,
        order_index: idx
      }));
      await supabase.from('experience').delete().neq('id', '___none___');
      await supabase.from('experience').upsert(formattedExp);

      // 5. Leadership
      const formattedLead = initialLeadership.map((l, idx) => ({
        id: `lead-${idx + 1}`,
        title: l.title,
        description: l.description,
        role: l.role,
        badge: l.badge,
        show_leadership: true,
        order_index: idx
      }));
      await supabase.from('leadership').delete().neq('id', '___none___');
      await supabase.from('leadership').upsert(formattedLead);

      // 6. Settings
      await supabase.from('site_settings').upsert({
        id: 'default',
        personal_info: defaultPersonalInfo,
        social_links: defaultSocialLinks,
        hero_content: defaultHeroContent,
        about_content: defaultAboutContent,
        footer_content: defaultFooterContent,
        updated_at: new Date().toISOString()
      });

      await fetchSupabaseData();
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Error resetting Supabase database to defaults:', err);
      setIsLoading(false);
      return false;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-[#111] border border-red-500/30 rounded-2xl p-8 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4 text-2xl">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Supabase Connection Error</h2>
          <p className="text-white/60 text-sm mb-6">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setIsLoading(true);
              fetchSupabaseData().finally(() => setIsLoading(false));
            }}
            className="px-6 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center flex-col gap-3">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-white/60 text-xs font-mono tracking-widest uppercase">Loading Supabase Data...</span>
      </div>
    );
  }

  return (
    <DataContext.Provider value={{ data, updateData, resetToDefaults, isSupabaseActive: true }}>
      {children}
    </DataContext.Provider>
  );
}
