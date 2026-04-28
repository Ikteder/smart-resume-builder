import { emptyResume } from "@/data/sample-resume";
import { createId } from "@/lib/ids";
import { analyzeJobDescription, applyTailoringDraft } from "@/lib/job-tailor";
import type { Experience, Publication, ResumeData, SimpleItem } from "@/types/resume";

type ParseOptions = {
  jobDescription?: string;
  base?: ResumeData;
};

const SECTION_ALIASES: Record<string, string[]> = {
  summary: ["summary", "professional summary", "profile", "objective", "about"],
  education: ["education", "academic background"],
  experience: [
    "experience",
    "work experience",
    "professional experience",
    "research experience",
    "employment",
  ],
  projects: ["projects", "selected projects", "research projects", "technical projects"],
  skills: ["skills", "technical skills", "technologies", "tools"],
  publications: ["publications", "papers", "research publications"],
  awards: ["awards", "honors", "awards and honors", "awards & honors"],
  leadership: ["leadership", "teaching", "service", "leadership and involvement", "involvement"],
  certifications: ["certifications", "certificates"],
};

const SECTION_LOOKUP = Object.fromEntries(
  Object.entries(SECTION_ALIASES).flatMap(([key, values]) => values.map((value) => [value, key])),
);

function normalizeText(text: string) {
  return text
    .replace(/\r/g, "\n")
    .replace(/[•●▪]/g, "-")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function stripBullet(line: string) {
  return line.replace(/^[-*–—]\s*/, "").trim();
}

function isBullet(line: string) {
  return /^[-*–—]\s+/.test(line);
}

function canonicalHeading(line: string) {
  const normalized = line.toLowerCase().replace(/[:|]/g, "").trim();
  return SECTION_LOOKUP[normalized];
}

function dateRange(line: string) {
  const match = line.match(/((?:19|20)\d{2})\s*(?:-|–|—|to)?\s*(present|current|(?:19|20)\d{2})?/i);
  if (!match) return { startDate: "", endDate: "" };
  return { startDate: match[1] ?? "", endDate: match[2] ?? "" };
}

function removeDate(line: string) {
  return line.replace(/(?:19|20)\d{2}\s*(?:-|–|—|to)?\s*(?:present|current|(?:19|20)\d{2})?/i, "").trim();
}

function splitNameAndOrg(line: string) {
  const cleaned = removeDate(line).replace(/\s+/g, " ").trim();
  const separators = [" | ", " @ ", " - ", " – ", " — "];
  for (const separator of separators) {
    if (cleaned.includes(separator)) {
      const [left, ...rest] = cleaned.split(separator);
      return { left: left.trim(), right: rest.join(separator).trim() };
    }
  }
  return { left: cleaned, right: "" };
}

function sectionBlocks(lines: string[]) {
  const blocks = new Map<string, string[]>();
  let current = "header";
  blocks.set(current, []);

  for (const line of lines) {
    const heading = canonicalHeading(line);
    if (heading) {
      current = heading;
      if (!blocks.has(current)) blocks.set(current, []);
      continue;
    }
    blocks.get(current)?.push(line);
  }

  return blocks;
}

function parseBasics(headerLines: string[]) {
  const headerText = headerLines.join(" ");
  const email = headerText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
  const phone = headerText.match(/(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}/)?.[0] ?? "";
  const urls = headerText.match(/(?:https?:\/\/)?(?:www\.)?[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s]*)?/gi) ?? [];
  const linkedin = urls.find((url) => url.toLowerCase().includes("linkedin")) ?? "";
  const github = urls.find((url) => url.toLowerCase().includes("github")) ?? "";
  const portfolio = urls.find((url) => !url.toLowerCase().includes("linkedin") && !url.toLowerCase().includes("github")) ?? "";
  const name = headerLines.find((line) => {
    const lower = line.toLowerCase();
    return !line.includes("@") && !lower.includes("linkedin") && !lower.includes("github") && !phone.includes(line);
  }) ?? "";
  const headline = headerLines.find((line) => line !== name && !line.includes("@") && !line.match(/\d{3}/)) ?? "";

  return {
    fullName: name,
    headline,
    email,
    phone,
    location: "",
    linkedin,
    github,
    portfolio,
  };
}

function entryChunks(lines: string[]) {
  const chunks: string[][] = [];
  let current: string[] = [];

  for (const line of lines) {
    const startsNewEntry = !isBullet(line) && current.some(isBullet);
    if (startsNewEntry) {
      chunks.push(current);
      current = [line];
    } else {
      current.push(line);
    }
  }

  if (current.length) chunks.push(current);
  return chunks;
}

function parseExperience(lines: string[], prefix: string): Experience[] {
  return entryChunks(lines)
    .map((chunk) => {
      const heading = chunk.find((line) => !isBullet(line)) ?? "";
      const secondary = chunk.find((line) => line !== heading && !isBullet(line)) ?? "";
      const { left, right } = splitNameAndOrg(heading);
      const dates = dateRange(chunk.join(" "));
      const bullets = chunk.filter(isBullet).map(stripBullet);

      return {
        id: createId(prefix),
        role: left,
        organization: right || removeDate(secondary),
        location: "",
        startDate: dates.startDate,
        endDate: dates.endDate,
        bullets,
      };
    })
    .filter((entry) => entry.role || entry.organization || entry.bullets.length);
}

function parseProjects(lines: string[]) {
  return entryChunks(lines)
    .map((chunk) => {
      const heading = chunk.find((line) => !isBullet(line)) ?? "";
      const { left, right } = splitNameAndOrg(heading);
      return {
        id: createId("project"),
        name: left,
        stack: right,
        link: chunk.find((line) => /github|https?:\/\//i.test(line)) ?? "",
        bullets: chunk.filter(isBullet).map(stripBullet),
      };
    })
    .filter((entry) => entry.name || entry.bullets.length);
}

function parseEducation(lines: string[]) {
  return entryChunks(lines)
    .map((chunk) => {
      const first = chunk.find((line) => !isBullet(line)) ?? "";
      const second = chunk.find((line) => line !== first && !isBullet(line)) ?? "";
      const degreeLine = [first, second].find((line) => /phd|m\.?s\.?|b\.?s\.?|master|bachelor|degree|computer science/i.test(line)) ?? first;
      const schoolLine = [first, second].find((line) => line !== degreeLine) ?? "";
      const dates = dateRange(chunk.join(" "));

      return {
        id: createId("edu"),
        school: removeDate(schoolLine),
        degree: removeDate(degreeLine),
        location: "",
        startDate: dates.startDate,
        endDate: dates.endDate,
        details: chunk.filter(isBullet).map(stripBullet),
      };
    })
    .filter((entry) => entry.school || entry.degree || entry.details.length);
}

function parseSimpleItems(lines: string[], prefix: string): SimpleItem[] {
  return entryChunks(lines)
    .map((chunk) => {
      const heading = chunk.find((line) => !isBullet(line)) ?? "";
      const { left, right } = splitNameAndOrg(heading);
      const dates = dateRange(chunk.join(" "));
      return {
        id: createId(prefix),
        title: removeDate(left),
        subtitle: right,
        date: dates.endDate || dates.startDate,
        bullets: chunk.filter(isBullet).map(stripBullet),
      };
    })
    .filter((entry) => entry.title || entry.bullets.length);
}

function parsePublications(lines: string[]): Publication[] {
  return lines
    .map(stripBullet)
    .filter(Boolean)
    .map((line) => ({
      id: createId("pub"),
      citation: line,
      venue: "",
      year: line.match(/(?:19|20)\d{2}/)?.[0] ?? "",
    }));
}

function parseSkills(lines: string[]) {
  return lines
    .flatMap((line) => line.split(/[,|;]/))
    .map(stripBullet)
    .map((skill) => skill.trim())
    .filter(Boolean);
}

export function buildResumeFromText(rawText: string, options: ParseOptions = {}) {
  const lines = normalizeText(rawText);
  const blocks = sectionBlocks(lines);
  const base = options.base ?? emptyResume;
  const header = blocks.get("header") ?? [];

  let parsed: ResumeData = {
    ...base,
    basics: { ...base.basics, ...parseBasics(header) },
    summary: (blocks.get("summary") ?? []).map(stripBullet).join(" ") || base.summary,
    education: parseEducation(blocks.get("education") ?? []),
    experience: parseExperience(blocks.get("experience") ?? [], "exp"),
    projects: parseProjects(blocks.get("projects") ?? []),
    skills: parseSkills(blocks.get("skills") ?? []),
    publications: parsePublications(blocks.get("publications") ?? []),
    awards: parseSimpleItems(blocks.get("awards") ?? [], "award"),
    leadership: parseSimpleItems(blocks.get("leadership") ?? [], "lead"),
    certifications: parseSimpleItems(blocks.get("certifications") ?? [], "cert"),
    customSections: base.customSections,
    template: base.template || "classic",
    accentColor: base.accentColor || "#155e75",
    font: base.font || "serif",
  };

  if (options.jobDescription?.trim()) {
    parsed = applyTailoringDraft(parsed, analyzeJobDescription(parsed, options.jobDescription));
  }

  return parsed;
}
