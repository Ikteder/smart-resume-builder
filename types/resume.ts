export type ResumeTemplate = "classic" | "modern" | "academic";
export type ResumeFont = "serif" | "sans" | "compact";

export type SectionKey =
  | "summary"
  | "education"
  | "experience"
  | "projects"
  | "skills"
  | "publications"
  | "awards"
  | "leadership"
  | "certifications"
  | "custom";

export type Basics = {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
};

export type Education = {
  id: string;
  school: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
  details: string[];
};

export type Experience = {
  id: string;
  organization: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
};

export type Project = {
  id: string;
  name: string;
  stack: string;
  link: string;
  bullets: string[];
};

export type Publication = {
  id: string;
  citation: string;
  venue: string;
  year: string;
};

export type SimpleItem = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  bullets: string[];
};

export type CustomSection = {
  id: string;
  title: string;
  items: SimpleItem[];
  visible: boolean;
};

export type SectionSettings = Record<
  SectionKey,
  {
    label: string;
    visible: boolean;
  }
>;

export type ResumeData = {
  basics: Basics;
  summary: string;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: string[];
  publications: Publication[];
  awards: SimpleItem[];
  leadership: SimpleItem[];
  certifications: SimpleItem[];
  customSections: CustomSection[];
  sectionOrder: SectionKey[];
  sectionSettings: SectionSettings;
  template: ResumeTemplate;
  accentColor: string;
  font: ResumeFont;
  atsMode: boolean;
};
