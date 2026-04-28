import { createId } from "@/lib/ids";
import type { CustomSection, ResumeData } from "@/types/resume";

const STOP_WORDS = new Set([
  "about",
  "across",
  "after",
  "also",
  "with",
  "will",
  "from",
  "that",
  "this",
  "your",
  "their",
  "they",
  "them",
  "have",
  "has",
  "are",
  "and",
  "for",
  "the",
  "you",
  "our",
  "into",
  "using",
  "work",
  "team",
  "role",
  "job",
  "candidate",
  "experience",
  "skills",
  "requirements",
  "preferred",
  "responsibilities",
]);

const DOMAIN_TERMS = [
  "python",
  "typescript",
  "react",
  "next.js",
  "fastapi",
  "docker",
  "kubernetes",
  "pytorch",
  "tensorflow",
  "scikit-learn",
  "machine learning",
  "deep learning",
  "computer vision",
  "llm",
  "transformer",
  "quantization",
  "onnx",
  "torchscript",
  "edge ai",
  "mlops",
  "rag",
  "retrieval",
  "sql",
  "postgresql",
  "aws",
  "gcp",
  "azure",
  "ci/cd",
  "testing",
  "benchmarking",
  "deployment",
  "optimization",
  "inference",
  "latency",
  "memory",
  "research",
  "publication",
  "experimentation",
  "data",
  "analytics",
  "api",
  "backend",
  "frontend",
  "systems",
];

export type TailoredResumeDraft = {
  summary: string;
  skills: string[];
  experienceBulletOrder: Record<string, string[]>;
  projectBulletOrder: Record<string, string[]>;
  alignmentSection: CustomSection;
};

export type TailoringAnalysis = {
  keywords: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  relevantBullets: Array<{
    source: string;
    text: string;
    score: number;
  }>;
  draft: TailoredResumeDraft;
  score: number;
};

function tokenize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9+#./\s-]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function scoreText(text: string, keywords: string[]) {
  const lower = text.toLowerCase();
  return keywords.reduce((score, keyword) => score + (lower.includes(keyword.toLowerCase()) ? 1 : 0), 0);
}

function resumeText(data: ResumeData) {
  return [
    data.basics.headline,
    data.summary,
    data.skills.join(" "),
    ...data.education.flatMap((entry) => [entry.degree, entry.school, entry.details.join(" ")]),
    ...data.experience.flatMap((entry) => [entry.role, entry.organization, entry.bullets.join(" ")]),
    ...data.projects.flatMap((entry) => [entry.name, entry.stack, entry.bullets.join(" ")]),
    ...data.publications.map((entry) => entry.citation),
    ...data.leadership.flatMap((entry) => [entry.title, entry.subtitle, entry.bullets.join(" ")]),
  ].join(" ");
}

function inferKeywords(jobDescription: string) {
  const lower = jobDescription.toLowerCase();
  const phraseMatches = DOMAIN_TERMS.filter((term) => lower.includes(term));
  const counts = new Map<string, number>();
  for (const token of tokenize(jobDescription)) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }
  const frequent = Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .slice(0, 12);
  return unique([...phraseMatches, ...frequent]).slice(0, 24);
}

function rankBullets(data: ResumeData, keywords: string[]) {
  const bullets = [
    ...data.experience.flatMap((entry) =>
      entry.bullets.map((bullet) => ({
        source: `${entry.role || "Experience"}${entry.organization ? `, ${entry.organization}` : ""}`,
        text: bullet,
        score: scoreText(`${entry.role} ${entry.organization} ${bullet}`, keywords),
      })),
    ),
    ...data.projects.flatMap((entry) =>
      entry.bullets.map((bullet) => ({
        source: entry.name || "Project",
        text: bullet,
        score: scoreText(`${entry.name} ${entry.stack} ${bullet}`, keywords),
      })),
    ),
    ...data.education.flatMap((entry) =>
      entry.details.map((detail) => ({
        source: entry.degree || "Education",
        text: detail,
        score: scoreText(`${entry.degree} ${entry.school} ${detail}`, keywords),
      })),
    ),
  ];

  return bullets
    .filter((bullet) => bullet.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}

function createTailoredSummary(data: ResumeData, matchedKeywords: string[], relevantBullets: TailoringAnalysis["relevantBullets"]) {
  const identity = data.basics.headline || "Computer Science researcher and software engineer";
  const skills = matchedKeywords.slice(0, 6).join(", ");
  const evidence = relevantBullets[0]?.text;
  if (skills && evidence) {
    return `${identity} with hands-on experience in ${skills}. ${evidence}`;
  }
  if (skills) {
    return `${identity} with hands-on experience in ${skills}, reproducible engineering workflows, and applied ML systems.`;
  }
  return data.summary;
}

function reorderBullets<T extends { id: string; bullets: string[] }>(items: T[], keywords: string[]) {
  return Object.fromEntries(
    items.map((item) => [
      item.id,
      [...item.bullets].sort((a, b) => scoreText(b, keywords) - scoreText(a, keywords)),
    ]),
  );
}

export function analyzeJobDescription(data: ResumeData, jobDescription: string): TailoringAnalysis {
  const keywords = inferKeywords(jobDescription);
  const fullResumeText = resumeText(data).toLowerCase();
  const matchedKeywords = keywords.filter((keyword) => fullResumeText.includes(keyword.toLowerCase()));
  const missingKeywords = keywords.filter((keyword) => !fullResumeText.includes(keyword.toLowerCase()));
  const relevantBullets = rankBullets(data, matchedKeywords.length ? matchedKeywords : keywords);
  const reorderedSkills = [
    ...data.skills.filter((skill) => matchedKeywords.some((keyword) => skill.toLowerCase().includes(keyword))),
    ...data.skills.filter((skill) => !matchedKeywords.some((keyword) => skill.toLowerCase().includes(keyword))),
  ];
  const alignmentBullets = relevantBullets.slice(0, 4).map((bullet) => bullet.text);

  const draft: TailoredResumeDraft = {
    summary: createTailoredSummary(data, matchedKeywords, relevantBullets),
    skills: reorderedSkills,
    experienceBulletOrder: reorderBullets(data.experience, matchedKeywords),
    projectBulletOrder: reorderBullets(data.projects, matchedKeywords),
    alignmentSection: {
      id: createId("target-alignment"),
      title: "Target Role Alignment",
      visible: true,
      items: [
        {
          id: createId("target-alignment-item"),
          title: "Relevant Qualifications",
          subtitle: matchedKeywords.slice(0, 8).join(" | "),
          date: "",
          bullets: alignmentBullets,
        },
      ],
    },
  };

  return {
    keywords,
    matchedKeywords,
    missingKeywords,
    relevantBullets,
    draft,
    score: keywords.length ? Math.round((matchedKeywords.length / keywords.length) * 100) : 0,
  };
}

export function applyTailoringDraft(data: ResumeData, analysis: TailoringAnalysis): ResumeData {
  const existingAlignmentSections = data.customSections.filter(
    (section) => section.title.toLowerCase() !== "target role alignment",
  );

  return {
    ...data,
    summary: analysis.draft.summary,
    skills: analysis.draft.skills,
    atsMode: true,
    experience: data.experience.map((entry) => ({
      ...entry,
      bullets: analysis.draft.experienceBulletOrder[entry.id] ?? entry.bullets,
    })),
    projects: data.projects.map((entry) => ({
      ...entry,
      bullets: analysis.draft.projectBulletOrder[entry.id] ?? entry.bullets,
    })),
    customSections: [analysis.draft.alignmentSection, ...existingAlignmentSections],
  };
}
