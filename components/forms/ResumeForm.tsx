"use client";

import * as React from "react";
import {
  ArrowDown,
  ArrowUp,
  BriefcaseBusiness,
  Eye,
  EyeOff,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { createId } from "@/lib/ids";
import { analyzeJobDescription, applyTailoringDraft } from "@/lib/job-tailor";
import { isValidEmail, isValidUrl, joinLines, splitLines } from "@/lib/utils";
import type {
  CustomSection,
  Education,
  Experience,
  Project,
  Publication,
  ResumeData,
  SimpleItem,
} from "@/types/resume";

type ResumeFormProps = {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
};

const sectionHints = [
  "Start bullets with verbs: built, led, optimized, evaluated, deployed.",
  "Use numbers when possible: latency, AUROC, users, datasets, speedup, memory saved.",
  "Keep bullets to one or two lines for easier scanning.",
  "For ATS, prefer standard section names and avoid graphics inside the resume.",
];

const actionVerbs = [
  "Built",
  "Designed",
  "Optimized",
  "Benchmarked",
  "Evaluated",
  "Deployed",
  "Automated",
  "Led",
  "Published",
  "Implemented",
  "Reduced",
  "Validated",
];

function updateArrayItem<T extends { id: string }>(items: T[], id: string, patch: Partial<T>) {
  return items.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

function removeArrayItem<T extends { id: string }>(items: T[], id: string) {
  return items.filter((item) => item.id !== id);
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) return items;
  const copy = [...items];
  const [item] = copy.splice(index, 1);
  copy.splice(nextIndex, 0, item);
  return copy;
}

function SectionShell({
  title,
  children,
  aside,
}: {
  title: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-950 dark:text-white">{title}</h3>
        </div>
        {aside}
      </CardHeader>
      <CardBody className="grid gap-4">{children}</CardBody>
    </Card>
  );
}

function PillList({ items, emptyText }: { items: string[]; emptyText: string }) {
  if (!items.length) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{emptyText}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function JobTailorSection({ data, onChange }: ResumeFormProps) {
  const [jobDescription, setJobDescription] = React.useState("");
  const analysis = React.useMemo(
    () => (jobDescription.trim().length > 40 ? analyzeJobDescription(data, jobDescription) : null),
    [data, jobDescription],
  );

  return (
    <Card className="border-cyan-200 dark:border-cyan-900">
      <CardHeader className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold text-slate-950 dark:text-white">
            <BriefcaseBusiness className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />
            Target a Job Description
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Paste a role description to rank your existing qualifications and apply a grounded tailoring pass.
          </p>
        </div>
        {analysis ? (
          <div className="rounded-md bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-900 dark:bg-cyan-950 dark:text-cyan-100">
            {analysis.score}% keyword coverage
          </div>
        ) : null}
      </CardHeader>
      <CardBody className="grid gap-4">
        <Field label="Job description">
          <Textarea
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            placeholder="Paste the internship, research, or software engineering role description here..."
            className="min-h-40"
          />
        </Field>

        {analysis ? (
          <div className="grid gap-4">
            <div className="grid gap-4 xl:grid-cols-2">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <h4 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Matched qualifications
                </h4>
                <PillList items={analysis.matchedKeywords.slice(0, 14)} emptyText="No direct keyword matches yet." />
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <h4 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Keywords not found
                </h4>
                <PillList
                  items={analysis.missingKeywords.slice(0, 14)}
                  emptyText="No major missing keywords detected."
                />
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Strongest existing evidence
              </h4>
              {analysis.relevantBullets.length ? (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
                  {analysis.relevantBullets.slice(0, 5).map((bullet) => (
                    <li key={`${bullet.source}-${bullet.text}`}>
                      <span className="font-medium text-slate-800 dark:text-slate-100">{bullet.source}: </span>
                      {bullet.text}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Add more resume bullets or paste a more detailed job description.
                </p>
              )}
            </div>

            <div className="rounded-md border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-900 dark:bg-cyan-950">
              <h4 className="text-sm font-semibold text-cyan-950 dark:text-cyan-100">
                Tailored summary draft
              </h4>
              <p className="mt-2 text-sm leading-6 text-cyan-950 dark:text-cyan-100">
                {analysis.draft.summary}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="secondary" onClick={() => onChange(applyTailoringDraft(data, analysis))}>
                Apply safe tailoring
              </Button>
              <Button type="button" variant="outline" onClick={() => setJobDescription("")}>
                Clear job description
              </Button>
            </div>
          </div>
        ) : (
          <p className="rounded-md border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700">
            Paste at least a few lines from a job description to see matches, missing keywords, and a tailored draft.
          </p>
        )}
      </CardBody>
    </Card>
  );
}

function ItemToolbar({
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <Button type="button" variant="ghost" size="icon" onClick={onMoveUp} title="Move up">
        <ArrowUp className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" onClick={onMoveDown} title="Move down">
        <ArrowDown className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" onClick={onDelete} title="Delete">
        <Trash2 className="h-4 w-4 text-rose-600" />
      </Button>
    </div>
  );
}

function EducationEditor({
  items,
  onChange,
}: {
  items: Education[];
  onChange: (items: Education[]) => void;
}) {
  return (
    <SectionShell
      title="Education"
      aside={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange([
              ...items,
              {
                id: createId("edu"),
                school: "",
                degree: "",
                location: "",
                startDate: "",
                endDate: "",
                details: [],
              },
            ])
          }
        >
          <Plus className="h-4 w-4" />
          Add education
        </Button>
      }
    >
      {items.length ? (
        items.map((item, index) => (
          <div key={item.id} className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <GripVertical className="h-4 w-4 text-slate-400" />
                Education {index + 1}
              </span>
              <ItemToolbar
                onMoveUp={() => onChange(moveItem(items, index, -1))}
                onMoveDown={() => onChange(moveItem(items, index, 1))}
                onDelete={() => onChange(removeArrayItem(items, item.id))}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="School">
                <Input
                  value={item.school}
                  onChange={(event) => onChange(updateArrayItem(items, item.id, { school: event.target.value }))}
                  placeholder="University Research Lab"
                />
              </Field>
              <Field label="Degree">
                <Input
                  value={item.degree}
                  onChange={(event) => onChange(updateArrayItem(items, item.id, { degree: event.target.value }))}
                  placeholder="PhD in Computer Science"
                />
              </Field>
              <Field label="Location">
                <Input
                  value={item.location}
                  onChange={(event) => onChange(updateArrayItem(items, item.id, { location: event.target.value }))}
                  placeholder="United States"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start">
                  <Input
                    value={item.startDate}
                    onChange={(event) =>
                      onChange(updateArrayItem(items, item.id, { startDate: event.target.value }))
                    }
                    placeholder="2024"
                  />
                </Field>
                <Field label="End">
                  <Input
                    value={item.endDate}
                    onChange={(event) =>
                      onChange(updateArrayItem(items, item.id, { endDate: event.target.value }))
                    }
                    placeholder="Present"
                  />
                </Field>
              </div>
              <Field label="Details" hint="One bullet per line">
                <Textarea
                  value={joinLines(item.details)}
                  onChange={(event) =>
                    onChange(updateArrayItem(items, item.id, { details: splitLines(event.target.value) }))
                  }
                  placeholder="Research focus: efficient AI and hardware-aware deep learning."
                  className="md:col-span-2"
                />
              </Field>
            </div>
          </div>
        ))
      ) : (
        <p className="rounded-md border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700">
          Add your degree, school, dates, and thesis or coursework highlights.
        </p>
      )}
    </SectionShell>
  );
}

function ExperienceEditor({
  title,
  items,
  onChange,
  kind,
}: {
  title: string;
  items: Experience[];
  onChange: (items: Experience[]) => void;
  kind: "experience" | "leadership";
}) {
  return (
    <SectionShell
      title={title}
      aside={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange([
              ...items,
              {
                id: createId(kind),
                organization: "",
                role: "",
                location: "",
                startDate: "",
                endDate: "",
                bullets: [],
              },
            ])
          }
        >
          <Plus className="h-4 w-4" />
          Add entry
        </Button>
      }
    >
      {items.length ? (
        items.map((item, index) => (
          <div key={item.id} className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <GripVertical className="h-4 w-4 text-slate-400" />
                Entry {index + 1}
              </span>
              <ItemToolbar
                onMoveUp={() => onChange(moveItem(items, index, -1))}
                onMoveDown={() => onChange(moveItem(items, index, 1))}
                onDelete={() => onChange(removeArrayItem(items, item.id))}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Role">
                <Input
                  value={item.role}
                  onChange={(event) => onChange(updateArrayItem(items, item.id, { role: event.target.value }))}
                  placeholder="Graduate Research Assistant"
                />
              </Field>
              <Field label="Organization">
                <Input
                  value={item.organization}
                  onChange={(event) =>
                    onChange(updateArrayItem(items, item.id, { organization: event.target.value }))
                  }
                  placeholder="Machine Learning Systems Lab"
                />
              </Field>
              <Field label="Location">
                <Input
                  value={item.location}
                  onChange={(event) =>
                    onChange(updateArrayItem(items, item.id, { location: event.target.value }))
                  }
                  placeholder="United States"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start">
                  <Input
                    value={item.startDate}
                    onChange={(event) =>
                      onChange(updateArrayItem(items, item.id, { startDate: event.target.value }))
                    }
                    placeholder="2024"
                  />
                </Field>
                <Field label="End">
                  <Input
                    value={item.endDate}
                    onChange={(event) =>
                      onChange(updateArrayItem(items, item.id, { endDate: event.target.value }))
                    }
                    placeholder="Present"
                  />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Bullets" hint="One bullet per line">
                  <Textarea
                    value={joinLines(item.bullets)}
                    onChange={(event) =>
                      onChange(updateArrayItem(items, item.id, { bullets: splitLines(event.target.value) }))
                    }
                    placeholder="Benchmarked model accuracy, latency, memory, and robustness across deployment settings."
                  />
                </Field>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="rounded-md border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700">
          Add experience entries with impact-oriented bullets.
        </p>
      )}
    </SectionShell>
  );
}

function ProjectEditor({ items, onChange }: { items: Project[]; onChange: (items: Project[]) => void }) {
  return (
    <SectionShell
      title="Projects"
      aside={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange([...items, { id: createId("project"), name: "", stack: "", link: "", bullets: [] }])
          }
        >
          <Plus className="h-4 w-4" />
          Add project
        </Button>
      }
    >
      {items.length ? (
        items.map((item, index) => (
          <div key={item.id} className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <GripVertical className="h-4 w-4 text-slate-400" />
                Project {index + 1}
              </span>
              <ItemToolbar
                onMoveUp={() => onChange(moveItem(items, index, -1))}
                onMoveDown={() => onChange(moveItem(items, index, 1))}
                onDelete={() => onChange(removeArrayItem(items, item.id))}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Project name">
                <Input
                  value={item.name}
                  onChange={(event) => onChange(updateArrayItem(items, item.id, { name: event.target.value }))}
                  placeholder="Edge AI Benchmark Suite"
                />
              </Field>
              <Field label="Tech stack">
                <Input
                  value={item.stack}
                  onChange={(event) => onChange(updateArrayItem(items, item.id, { stack: event.target.value }))}
                  placeholder="Python, PyTorch, ONNX"
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Link" error={!isValidUrl(item.link) ? "Enter a valid URL." : undefined}>
                  <Input
                    value={item.link}
                    onChange={(event) => onChange(updateArrayItem(items, item.id, { link: event.target.value }))}
                    placeholder="github.com/Ikteder/project"
                  />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Bullets" hint="One bullet per line">
                  <Textarea
                    value={joinLines(item.bullets)}
                    onChange={(event) =>
                      onChange(updateArrayItem(items, item.id, { bullets: splitLines(event.target.value) }))
                    }
                    placeholder="Produced Pareto-front plots comparing accuracy, latency, and model size."
                  />
                </Field>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="rounded-md border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700">
          Add ML, systems, research, or product projects that show ownership.
        </p>
      )}
    </SectionShell>
  );
}

function PublicationEditor({
  items,
  onChange,
}: {
  items: Publication[];
  onChange: (items: Publication[]) => void;
}) {
  return (
    <SectionShell
      title="Publications"
      aside={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...items, { id: createId("pub"), citation: "", venue: "", year: "" }])}
        >
          <Plus className="h-4 w-4" />
          Add publication
        </Button>
      }
    >
      {items.length ? (
        items.map((item, index) => (
          <div key={item.id} className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Publication {index + 1}
              </span>
              <ItemToolbar
                onMoveUp={() => onChange(moveItem(items, index, -1))}
                onMoveDown={() => onChange(moveItem(items, index, 1))}
                onDelete={() => onChange(removeArrayItem(items, item.id))}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_160px_100px]">
              <Field label="Citation">
                <Input
                  value={item.citation}
                  onChange={(event) =>
                    onChange(updateArrayItem(items, item.id, { citation: event.target.value }))
                  }
                  placeholder="Udoy, I. A. Hardware-aware quantization..."
                />
              </Field>
              <Field label="Venue">
                <Input
                  value={item.venue}
                  onChange={(event) => onChange(updateArrayItem(items, item.id, { venue: event.target.value }))}
                  placeholder="Workshop"
                />
              </Field>
              <Field label="Year">
                <Input
                  value={item.year}
                  onChange={(event) => onChange(updateArrayItem(items, item.id, { year: event.target.value }))}
                  placeholder="2026"
                />
              </Field>
            </div>
          </div>
        ))
      ) : (
        <p className="rounded-md border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700">
          Add papers, posters, workshops, preprints, or submitted manuscripts.
        </p>
      )}
    </SectionShell>
  );
}

function SimpleItemEditor({
  title,
  items,
  onChange,
}: {
  title: string;
  items: SimpleItem[];
  onChange: (items: SimpleItem[]) => void;
}) {
  return (
    <SectionShell
      title={title}
      aside={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange([...items, { id: createId("simple"), title: "", subtitle: "", date: "", bullets: [] }])
          }
        >
          <Plus className="h-4 w-4" />
          Add item
        </Button>
      }
    >
      {items.length ? (
        items.map((item, index) => (
          <div key={item.id} className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Item {index + 1}
              </span>
              <ItemToolbar
                onMoveUp={() => onChange(moveItem(items, index, -1))}
                onMoveDown={() => onChange(moveItem(items, index, 1))}
                onDelete={() => onChange(removeArrayItem(items, item.id))}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_120px]">
              <Field label="Title">
                <Input
                  value={item.title}
                  onChange={(event) => onChange(updateArrayItem(items, item.id, { title: event.target.value }))}
                  placeholder="Graduate Research Fellowship Nominee"
                />
              </Field>
              <Field label="Subtitle">
                <Input
                  value={item.subtitle}
                  onChange={(event) =>
                    onChange(updateArrayItem(items, item.id, { subtitle: event.target.value }))
                  }
                  placeholder="Recognized for efficient AI research"
                />
              </Field>
              <Field label="Date">
                <Input
                  value={item.date}
                  onChange={(event) => onChange(updateArrayItem(items, item.id, { date: event.target.value }))}
                  placeholder="2025"
                />
              </Field>
              <div className="md:col-span-3">
                <Field label="Bullets" hint="Optional; one bullet per line">
                  <Textarea
                    value={joinLines(item.bullets)}
                    onChange={(event) =>
                      onChange(updateArrayItem(items, item.id, { bullets: splitLines(event.target.value) }))
                    }
                    placeholder="Organized weekly discussions on quantization and LLM systems."
                  />
                </Field>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="rounded-md border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700">
          Add entries or keep this section hidden from section controls.
        </p>
      )}
    </SectionShell>
  );
}

function CustomSectionEditor({
  sections,
  onChange,
}: {
  sections: CustomSection[];
  onChange: (sections: CustomSection[]) => void;
}) {
  return (
    <SectionShell
      title="Custom Sections"
      aside={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange([
              ...sections,
              {
                id: createId("custom"),
                title: "Custom Section",
                visible: true,
                items: [{ id: createId("custom-item"), title: "", subtitle: "", date: "", bullets: [] }],
              },
            ])
          }
        >
          <Plus className="h-4 w-4" />
          Add section
        </Button>
      }
    >
      {sections.length ? (
        sections.map((section, sectionIndex) => (
          <div key={section.id} className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Field label="Section title">
                <Input
                  value={section.title}
                  onChange={(event) =>
                    onChange(
                      updateArrayItem(sections, section.id, {
                        title: event.target.value,
                      }),
                    )
                  }
                />
              </Field>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    onChange(updateArrayItem(sections, section.id, { visible: !section.visible }))
                  }
                  title={section.visible ? "Hide custom section" : "Show custom section"}
                >
                  {section.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <ItemToolbar
                  onMoveUp={() => onChange(moveItem(sections, sectionIndex, -1))}
                  onMoveDown={() => onChange(moveItem(sections, sectionIndex, 1))}
                  onDelete={() => onChange(removeArrayItem(sections, section.id))}
                />
              </div>
            </div>
            <SimpleItemEditor
              title="Custom items"
              items={section.items}
              onChange={(items) => onChange(updateArrayItem(sections, section.id, { items }))}
            />
          </div>
        ))
      ) : (
        <p className="rounded-md border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700">
          Add a custom section for research interests, patents, talks, service, or open-source work.
        </p>
      )}
    </SectionShell>
  );
}

export function ResumeForm({ data, onChange }: ResumeFormProps) {
  const setData = (patch: Partial<ResumeData>) => onChange({ ...data, ...patch });
  const setBasics = (patch: Partial<ResumeData["basics"]>) =>
    setData({ basics: { ...data.basics, ...patch } });

  const visibleWordCount = [
    data.summary,
    ...data.experience.flatMap((entry) => entry.bullets),
    ...data.projects.flatMap((entry) => entry.bullets),
  ]
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;

  return (
    <div className="grid gap-5">
      <JobTailorSection data={data} onChange={onChange} />

      <SectionShell title="Basics">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Full name">
            <Input
              value={data.basics.fullName}
              onChange={(event) => setBasics({ fullName: event.target.value })}
              placeholder="Ikteder Akhand Udoy"
            />
          </Field>
          <Field label="Headline">
            <Input
              value={data.basics.headline}
              onChange={(event) => setBasics({ headline: event.target.value })}
              placeholder="CS PhD Student | ML Systems | Efficient AI"
            />
          </Field>
          <Field label="Email" error={!isValidEmail(data.basics.email) ? "Enter a valid email." : undefined}>
            <Input
              value={data.basics.email}
              onChange={(event) => setBasics({ email: event.target.value })}
              placeholder="you@example.com"
            />
          </Field>
          <Field label="Phone">
            <Input
              value={data.basics.phone}
              onChange={(event) => setBasics({ phone: event.target.value })}
              placeholder="+1 (555) 123-4567"
            />
          </Field>
          <Field label="Location">
            <Input
              value={data.basics.location}
              onChange={(event) => setBasics({ location: event.target.value })}
              placeholder="City, State"
            />
          </Field>
          <Field label="LinkedIn" error={!isValidUrl(data.basics.linkedin) ? "Enter a valid URL." : undefined}>
            <Input
              value={data.basics.linkedin}
              onChange={(event) => setBasics({ linkedin: event.target.value })}
              placeholder="linkedin.com/in/your-name"
            />
          </Field>
          <Field label="GitHub" error={!isValidUrl(data.basics.github) ? "Enter a valid URL." : undefined}>
            <Input
              value={data.basics.github}
              onChange={(event) => setBasics({ github: event.target.value })}
              placeholder="github.com/username"
            />
          </Field>
          <Field label="Portfolio" error={!isValidUrl(data.basics.portfolio) ? "Enter a valid URL." : undefined}>
            <Input
              value={data.basics.portfolio}
              onChange={(event) => setBasics({ portfolio: event.target.value })}
              placeholder="your-site.dev"
            />
          </Field>
        </div>
      </SectionShell>

      <SectionShell title="Resume Settings">
        <div className="grid gap-3 md:grid-cols-4">
          <Field label="Template">
            <Select
              value={data.template}
              onChange={(event) => setData({ template: event.target.value as ResumeData["template"] })}
            >
              <option value="classic">Classic ATS</option>
              <option value="modern">Modern clean</option>
              <option value="academic">Academic CV</option>
            </Select>
          </Field>
          <Field label="Accent color">
            <Input
              type="color"
              value={data.accentColor}
              onChange={(event) => setData({ accentColor: event.target.value })}
              className="p-1"
            />
          </Field>
          <Field label="Font">
            <Select value={data.font} onChange={(event) => setData({ font: event.target.value as ResumeData["font"] })}>
              <option value="serif">Serif</option>
              <option value="sans">Sans</option>
              <option value="compact">Compact</option>
            </Select>
          </Field>
          <Field label="ATS mode">
            <button
              type="button"
              onClick={() => setData({ atsMode: !data.atsMode })}
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-left text-sm font-medium text-slate-800 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              {data.atsMode ? "Enabled" : "Disabled"}
            </button>
          </Field>
        </div>
      </SectionShell>

      <SectionShell title="Section Controls">
        <div className="grid gap-2">
          {data.sectionOrder.map((key, index) => {
            const section = data.sectionSettings[key];
            return (
              <div
                key={key}
                className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                  <GripVertical className="h-4 w-4 text-slate-400" />
                  {section.label}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setData({
                        sectionSettings: {
                          ...data.sectionSettings,
                          [key]: { ...section, visible: !section.visible },
                        },
                      })
                    }
                    title={section.visible ? "Hide section" : "Show section"}
                  >
                    {section.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setData({ sectionOrder: moveItem(data.sectionOrder, index, -1) })}
                    title="Move up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setData({ sectionOrder: moveItem(data.sectionOrder, index, 1) })}
                    title="Move down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </SectionShell>

      <SectionShell title="Professional Summary">
        <Field
          label="Summary"
          hint={`${data.summary.length} characters. Aim for 2-4 focused lines.`}
        >
          <Textarea
            value={data.summary}
            onChange={(event) => setData({ summary: event.target.value })}
            placeholder="ML systems researcher focused on efficient AI, model deployment, and robust evaluation."
          />
        </Field>
      </SectionShell>

      <EducationEditor items={data.education} onChange={(education) => setData({ education })} />
      <ExperienceEditor
        title="Work / Research Experience"
        items={data.experience}
        onChange={(experience) => setData({ experience })}
        kind="experience"
      />
      <ProjectEditor items={data.projects} onChange={(projects) => setData({ projects })} />

      <SectionShell title="Skills">
        <Field label="Skills" hint="Comma or line separated">
          <Textarea
            value={data.skills.join("\n")}
            onChange={(event) =>
              setData({
                skills: event.target.value
                  .split(/[,\n]/)
                  .map((skill) => skill.trim())
                  .filter(Boolean),
              })
            }
            placeholder="Python, PyTorch, ONNX, Quantization, Computer Vision"
          />
        </Field>
      </SectionShell>

      <PublicationEditor
        items={data.publications}
        onChange={(publications) => setData({ publications })}
      />
      <SimpleItemEditor title="Awards & Honors" items={data.awards} onChange={(awards) => setData({ awards })} />
      <SimpleItemEditor
        title="Leadership / Involvement"
        items={data.leadership}
        onChange={(leadership) => setData({ leadership })}
      />
      <SimpleItemEditor
        title="Certifications"
        items={data.certifications}
        onChange={(certifications) => setData({ certifications })}
      />
      <CustomSectionEditor
        sections={data.customSections}
        onChange={(customSections) => setData({ customSections })}
      />

      <Card>
        <CardHeader>
          <h3 className="text-base font-semibold text-slate-950 dark:text-white">Resume Writing Helpers</h3>
        </CardHeader>
        <CardBody className="grid gap-4 md:grid-cols-3">
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Action verbs</h4>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{actionVerbs.join(" | ")}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Bullet examples</h4>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
              <li>Reduced inference latency by 31% by benchmarking ONNX and TorchScript runtimes.</li>
              <li>Built a reproducible evaluation suite with 25 grounded agent benchmark questions.</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">ATS checks</h4>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
              {sectionHints.map((hint) => (
                <li key={hint}>{hint}</li>
              ))}
            </ul>
            <p className="mt-3 rounded-md bg-slate-100 p-3 text-sm text-slate-700 dark:bg-slate-950 dark:text-slate-300">
              {visibleWordCount < 180
                ? "This resume may be light on detail. Add more evidence, metrics, and project bullets."
                : visibleWordCount > 850
                  ? "This resume may run long. Consider a compact font or trimming older details."
                  : "Content length looks healthy for a focused resume."}
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
