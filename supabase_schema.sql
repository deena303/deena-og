-- ============================================================
-- SUPABASE COMPLETE CMS DATABASE SCHEMA & SEED DATA
-- Portfolio Database Setup & Security Rules
-- Run this script in your Supabase SQL Editor
-- ============================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- 2. TABLE DEFINITIONS
-- ------------------------------------------------------------

-- Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  badge TEXT,
  role TEXT,
  category TEXT,
  tech_tags JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  links JSONB DEFAULT '{}'::jsonb,
  show_project BOOLEAN DEFAULT true,
  is_flagship BOOLEAN DEFAULT false,
  year TEXT,
  thumbnail TEXT,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Skills Table
CREATE TABLE IF NOT EXISTS public.skills (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  percentage INT DEFAULT 0,
  category TEXT NOT NULL,
  icon TEXT,
  show_skill BOOLEAN DEFAULT true,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Certificates Table
CREATE TABLE IF NOT EXISTS public.certificates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  issuer TEXT,
  status TEXT,
  icon TEXT,
  pdf_url TEXT,
  show_certificate BOOLEAN DEFAULT true,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Experience Table
CREATE TABLE IF NOT EXISTS public.experience (
  id TEXT PRIMARY KEY,
  organization TEXT NOT NULL,
  role TEXT NOT NULL,
  duration TEXT,
  badge TEXT,
  description TEXT,
  skills JSONB DEFAULT '[]'::jsonb,
  tech JSONB DEFAULT '[]'::jsonb,
  show_experience BOOLEAN DEFAULT true,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Leadership Table
CREATE TABLE IF NOT EXISTS public.leadership (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  role TEXT,
  badge TEXT,
  show_leadership BOOLEAN DEFAULT true,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Site Settings Table (Single row key: 'default')
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  personal_info JSONB DEFAULT '{}'::jsonb,
  social_links JSONB DEFAULT '{}'::jsonb,
  hero_content JSONB DEFAULT '{}'::jsonb,
  about_content JSONB DEFAULT '{}'::jsonb,
  footer_content JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- Allow public READ access, and authenticated WRITE access
-- ------------------------------------------------------------

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leadership ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Public Read Projects" ON public.projects;
DROP POLICY IF EXISTS "Admin All Projects" ON public.projects;
DROP POLICY IF EXISTS "Public Read Skills" ON public.skills;
DROP POLICY IF EXISTS "Admin All Skills" ON public.skills;
DROP POLICY IF EXISTS "Public Read Certificates" ON public.certificates;
DROP POLICY IF EXISTS "Admin All Certificates" ON public.certificates;
DROP POLICY IF EXISTS "Public Read Experience" ON public.experience;
DROP POLICY IF EXISTS "Admin All Experience" ON public.experience;
DROP POLICY IF EXISTS "Public Read Leadership" ON public.leadership;
DROP POLICY IF EXISTS "Admin All Leadership" ON public.leadership;
DROP POLICY IF EXISTS "Public Read Site Settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin All Site Settings" ON public.site_settings;

-- Public Read Policies
CREATE POLICY "Public Read Projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public Read Skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Public Read Certificates" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Public Read Experience" ON public.experience FOR SELECT USING (true);
CREATE POLICY "Public Read Leadership" ON public.leadership FOR SELECT USING (true);
CREATE POLICY "Public Read Site Settings" ON public.site_settings FOR SELECT USING (true);

-- Authenticated Admin Write Policies
CREATE POLICY "Admin All Projects" ON public.projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Skills" ON public.skills FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Certificates" ON public.certificates FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Experience" ON public.experience FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Leadership" ON public.leadership FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Site Settings" ON public.site_settings FOR ALL USING (auth.role() = 'authenticated');

-- ------------------------------------------------------------
-- 4. ENABLE REALTIME PUBLICATION
-- ------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'projects') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'skills') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.skills;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'certificates') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.certificates;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'experience') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.experience;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'leadership') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.leadership;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'site_settings') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Realtime publication fallback
  NULL;
END $$;

-- ------------------------------------------------------------
-- 5. INITIAL SEED DATA
-- ------------------------------------------------------------

-- Projects Seed
INSERT INTO public.projects (id, title, description, badge, role, tech_tags, links, show_project, is_flagship, order_index)
VALUES 
  ('vm-labz', 'VM Labz', 'Designed and developed the frontend for VM Labz, a professional platform offering academic project solutions for UG and PG students, research paper writing services, publication guidance, patent assistance, and consulting solutions. Built a modern, responsive, and user-friendly experience focused on helping students and researchers access services efficiently.', 'Client Project', 'Frontend Developer', '["React", "JavaScript", "Tailwind CSS", "Responsive Design"]'::jsonb, '{"website": "https://vmlabz.in/"}'::jsonb, true, true, 0),
  ('kpcms', 'Kamalakshi Pandurangan College of Pharmacy', 'Built a complete event management platform featuring participant registration, automatic email delivery with login credentials, participant portal, QR-code based attendance tracking, reward claiming, food management with QR verification, and administrator dashboards. Designed for a seamless and secure event experience.', 'Client Project', 'Frontend Developer', '["React", "JavaScript", "Tailwind CSS", "Firebase", "Email Integration", "QR Code System"]'::jsonb, '{"website": "https://kpcms.netlify.app/"}'::jsonb, true, true, 1),
  ('erp-platform', 'ERP Platform', 'A modern college ERP platform with modules for admissions, student management, attendance, academics, examinations, fee management, notifications, and administrative dashboards. Designed with a scalable and responsive user interface.', 'Enterprise Software', 'Frontend Developer', '["React", "TypeScript", "Tailwind CSS"]'::jsonb, '{"website": "https://msajce.netlify.app/"}'::jsonb, true, false, 2),
  ('flow-ai', 'Flow AI', 'An AI-powered workflow automation platform that helps users organize tasks, automate repetitive work, and improve productivity using intelligent AI assistants and modern web technologies.', 'AI Platform', 'Frontend Developer', '["React", "Node.js", "AI API"]'::jsonb, '{"github": "https://github.com/mdwasim2006/flow-ai"}'::jsonb, true, false, 3),
  ('enterprise-sop-agent', 'Enterprise SOP Agent', 'An enterprise AI assistant that allows employees to search company SOP documents using semantic search, AI-powered question answering, document embeddings, and intelligent knowledge retrieval.', 'Enterprise AI', 'Frontend Developer', '["React", "Python", "LLM Embeddings"]'::jsonb, '{"github": "https://github.com/deena303/SOP-agent"}'::jsonb, true, false, 4),
  ('ai-resume-builder', 'AI Resume Builder', 'An intelligent resume builder that creates ATS-friendly resumes with AI assistance, professional templates, resume optimization, and instant export functionality.', 'AI Application', 'Frontend Developer', '["React", "Tailwind CSS", "PDF Export"]'::jsonb, '{"github": "https://github.com/deena303/ats-pro-resume-generator"}'::jsonb, true, false, 5),
  ('sathakathon-2.0', 'Sathakathon 2.0', 'Developed the frontend for the official registration platform of a 25-hour hackathon. Features include participant registration, team management, event schedule, responsive landing pages, and an engaging user experience for students.', 'Hackathon Platform', 'Frontend Developer', '["React", "JavaScript", "Tailwind CSS"]'::jsonb, '{"website": "https://sathakathon26.netlify.app/"}'::jsonb, true, false, 6),
  ('projectx', 'ProjectX', 'Designed and developed the frontend for a 12-hour hackathon registration platform with online registration, event information, responsive design, payment workflow, and team management.', 'Hackathon Platform', 'Frontend Developer', '["React", "Tailwind CSS"]'::jsonb, '{"website": "https://projectx.msajce-edu.in/"}'::jsonb, true, false, 7),
  ('techwar-2k26', 'TechWar 2K26', 'Created the frontend for TechWar 2K26, a modern technical event website showcasing competitions, workshops, schedules, registrations, prizes, coordinators, sponsors, and event information with a responsive interface.', 'Technical Event', 'Frontend Developer', '["React", "Tailwind CSS"]'::jsonb, '{"website": "https://techwar2k2610.netlify.app/"}'::jsonb, true, false, 8),
  ('billshock-arena', 'BillShock Arena', 'A gamified energy consumption platform that encourages users to reduce electricity usage through AI insights, real-time analytics, leaderboards, rewards, and sustainability challenges.', 'Personal Project', 'Frontend Developer', '["React", "Analytics", "Gamification"]'::jsonb, '{"github": "https://github.com/deena303/Billstock-arena"}'::jsonb, true, false, 9)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  badge = EXCLUDED.badge,
  role = EXCLUDED.role,
  tech_tags = EXCLUDED.tech_tags,
  links = EXCLUDED.links,
  show_project = EXCLUDED.show_project,
  is_flagship = EXCLUDED.is_flagship,
  order_index = EXCLUDED.order_index;

-- Skills Seed
INSERT INTO public.skills (id, name, percentage, category, show_skill, order_index)
VALUES
  ('sk-1', 'HTML5', 95, 'Frontend Development', true, 0),
  ('sk-2', 'CSS3', 92, 'Frontend Development', true, 1),
  ('sk-3', 'JavaScript (ES6+)', 90, 'Frontend Development', true, 2),
  ('sk-4', 'TypeScript', 88, 'Frontend Development', true, 3),
  ('sk-5', 'React.js', 92, 'Frontend Development', true, 4),
  ('sk-6', 'Next.js', 86, 'Frontend Development', true, 5),
  ('sk-7', 'Tailwind CSS', 95, 'Frontend Development', true, 6),
  ('sk-8', 'Framer Motion', 85, 'Frontend Development', true, 7),
  ('sk-9', 'Figma', 82, 'UI / UX & 3D Design', true, 100),
  ('sk-10', 'Responsive Design', 95, 'UI / UX & 3D Design', true, 101),
  ('sk-11', 'UI Animation', 90, 'UI / UX & 3D Design', true, 102),
  ('sk-12', 'Accessibility', 82, 'UI / UX & 3D Design', true, 103),
  ('sk-13', 'Blender (3D)', 78, 'UI / UX & 3D Design', true, 104),
  ('sk-14', 'VS Code', 98, 'Development Tools', true, 200),
  ('sk-15', 'Antigravity', 95, 'Development Tools', true, 201),
  ('sk-16', 'GitHub', 92, 'Development Tools', true, 202),
  ('sk-17', 'Claude', 95, 'Development Tools', true, 203),
  ('sk-18', 'OpenAI', 95, 'Development Tools', true, 204),
  ('sk-19', 'Google AI Studio', 93, 'Development Tools', true, 205),
  ('sk-20', 'Firebase Studio', 90, 'Development Tools', true, 206),
  ('sk-21', 'Git', 90, 'Additional Skills', true, 300),
  ('sk-22', 'npm', 92, 'Additional Skills', true, 301),
  ('sk-23', 'REST API Integration', 85, 'Additional Skills', true, 302),
  ('sk-24', 'Performance Optimization', 88, 'Additional Skills', true, 303),
  ('sk-25', 'Responsive Web Design', 95, 'Additional Skills', true, 304),
  ('sk-26', 'UI Component Libraries (shadcn/ui, React Bits)', 90, 'Additional Skills', true, 305)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  percentage = EXCLUDED.percentage,
  category = EXCLUDED.category,
  show_skill = EXCLUDED.show_skill,
  order_index = EXCLUDED.order_index;

-- Certificates Seed
INSERT INTO public.certificates (id, name, issuer, status, icon, show_certificate, order_index)
VALUES
  ('cert-1', 'Full Stack Development Internship', 'ZAALIMA', 'Completed', '💼', true, 0),
  ('cert-2', 'Prompt Engineering Research & Integration Internship', 'Excelerate', 'Star Performer', '🤖', true, 1),
  ('cert-3', 'German-I', 'NPTEL', 'Completed', '🇩🇪', true, 2)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  issuer = EXCLUDED.issuer,
  status = EXCLUDED.status,
  icon = EXCLUDED.icon,
  show_certificate = EXCLUDED.show_certificate,
  order_index = EXCLUDED.order_index;

-- Experience Seed
INSERT INTO public.experience (id, organization, role, duration, badge, description, skills, tech, show_experience, order_index)
VALUES
  ('exp-1', 'ZAALIMA', 'Full Stack Developer Intern', '2025 – 2026', 'INTERNSHIP', 'Completed a professional Full Stack Development internship where I built responsive web applications, collaborated on client projects, integrated modern frontend technologies, and worked with backend APIs while following industry development practices.', '["Frontend Development", "React Development", "REST API Integration", "Responsive UI Design", "Team Collaboration"]'::jsonb, '["React", "JavaScript", "TypeScript", "Tailwind CSS", "Node.js", "Express.js", "GitHub"]'::jsonb, true, 0),
  ('exp-2', 'Excelerate', 'Prompt Engineering Research & Integration Intern', '2026', 'INTERNSHIP', 'Worked on prompt engineering research, AI workflow optimization, LLM evaluation, prompt testing, and AI integration strategies for enterprise productivity solutions.', '["Prompt Engineering", "AI Research", "LLM Evaluation", "Workflow Automation", "AI Integration"]'::jsonb, '["OpenAI", "Claude", "Google AI Studio", "Prompt Engineering", "LLMs", "AI Automation"]'::jsonb, true, 1),
  ('exp-3', 'Independent Client Projects', 'Frontend Developer', 'Present', 'FREELANCE', 'Designed and developed modern responsive websites for educational institutions, startups, hackathons, and business clients with a strong focus on performance, UI/UX, and scalable frontend architecture.', '["Performance", "UI/UX", "Scalable Frontend Architecture"]'::jsonb, '["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "GitHub"]'::jsonb, true, 2)
ON CONFLICT (id) DO UPDATE SET
  organization = EXCLUDED.organization,
  role = EXCLUDED.role,
  duration = EXCLUDED.duration,
  badge = EXCLUDED.badge,
  description = EXCLUDED.description,
  skills = EXCLUDED.skills,
  tech = EXCLUDED.tech,
  show_experience = EXCLUDED.show_experience,
  order_index = EXCLUDED.order_index;

-- Leadership Seed
INSERT INTO public.leadership (id, title, description, role, badge, show_leadership, order_index)
VALUES
  ('lead-1', 'Client Projects', 'Successfully delivered multiple production-ready websites for educational institutions and business clients using modern frontend technologies.', 'Frontend Developer', 'Client Projects', true, 0),
  ('lead-2', 'Hackathon Development', 'Developed official registration platforms and technical event websites including Sathakathon 2.0, ProjectX, and TechWar 2K26.', 'Frontend Developer', 'Hackathon Development', true, 1),
  ('lead-3', 'AI Exploration', 'Built AI-powered applications including Enterprise SOP Agent, AI Resume Builder, Flow AI, and BillShock Arena while exploring modern LLM technologies.', 'AI Developer', 'AI Exploration', true, 2),
  ('lead-4', 'Continuous Learning', 'Continuously improving frontend engineering, UI/UX, animation systems, Blender, AI development, and modern web technologies.', 'Continuous Learner', 'Continuous Learning', true, 3)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  role = EXCLUDED.role,
  badge = EXCLUDED.badge,
  show_leadership = EXCLUDED.show_leadership,
  order_index = EXCLUDED.order_index;

-- Site Settings Seed
INSERT INTO public.site_settings (id, personal_info, social_links, hero_content, about_content, footer_content)
VALUES (
  'default',
  '{
    "name": "V. Deena",
    "firstName": "Deena",
    "brandName": "V. Deena",
    "title": "Frontend Developer",
    "location": "India",
    "phone": "+91 6382097752",
    "emails": {
      "primary": "deenaofficial1507@gmail.com",
      "secondary": "deenaofficial1507@gmail.com"
    },
    "summary": "Artificial Intelligence & Machine Learning student and Frontend Developer passionate about building AI-powered applications, workflow automation systems and modern web experiences that solve real-world problems.",
    "resumeUrl": "/Md_Yusuf_Resume_2026.pdf"
  }'::jsonb,
  '{
    "github": "https://github.com/deena303",
    "linkedin": "https://www.linkedin.com/in/deena-v-b95a63327",
    "whatsapp": "https://wa.me/916382097752"
  }'::jsonb,
  '{
    "greeting": "Hi, I''m V. Deena",
    "titleHighlight": "Frontend Developer",
    "subtitle": "I enjoy turning ideas into real applications by combining modern web technologies, AI and thoughtful user experiences. I focus on building scalable products that solve practical problems for students, businesses and organizations.",
    "ctaPrimary": { "text": "View My Work", "href": "#projects" },
    "ctaSecondary": {
      "text": "Contact Me",
      "href": "mailto:deenaofficial1507@gmail.com?subject=Hiring Inquiry – Portfolio"
    },
    "ctaResume": { "text": "Download Resume", "href": "/Md_Yusuf_Resume_2026.pdf" }
  }'::jsonb,
  '{
    "heading": "Hello!",
    "bio": "Hi, my name is V. Deena, an Artificial Intelligence & Machine Learning student and Frontend Developer. I am passionate about building AI-powered applications, workflow automation platforms and enterprise software.",
    "techStack": ["React", "TypeScript", "Tailwind CSS"]
  }'::jsonb,
  '{
    "taglines": [
      "Frontend Development & AI",
      "React · TypeScript · Tailwind CSS",
      "Building Modern Web Experiences"
    ],
    "credential": "AI & ML Student · Frontend Developer",
    "copyright": "Designed & Developed by V. Deena"
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  personal_info = EXCLUDED.personal_info,
  social_links = EXCLUDED.social_links,
  hero_content = EXCLUDED.hero_content,
  about_content = EXCLUDED.about_content,
  footer_content = EXCLUDED.footer_content;

-- ------------------------------------------------------------
-- 6. INSTRUCTIONS FOR ADMIN AUTHENTICATION CREATION
-- To create an Admin User in Supabase Auth:
-- Go to Supabase Dashboard -> Authentication -> Users -> Add User -> Create User
-- Email: deenaofficial1507@gmail.com (or your preferred admin email)
-- Password: Your secure password
-- Auto-Confirm Email: Checked
-- ------------------------------------------------------------
