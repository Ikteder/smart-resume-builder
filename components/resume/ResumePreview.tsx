import type { CSSProperties, Ref } from "react";
import type {
  CustomSection,
  Education,
  Experience,
  Project,
  Publication,
  ResumeData,
  SectionKey,
  SimpleItem,
} from "@/types/resume";
import { cn, normalizeUrl } from "@/lib/utils";

type ResumePreviewProps = {
  data: ResumeData;
  previewRef?: Ref<HTMLDivElement>;
};

function ContactLink({ value }: { value: string }) {
  if (!value) return null;
  const isLink = value.includes(".") && !value.includes("@") && !value.match(/^\+?\d/);
  return isLink ? (
    <a href={normalizeUrl(value)} className="resume-link">
      {value.replace(/^https?:\/\//, "")}
    </a>
  ) : (
    <span>{value}</span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <section className="resume-section">
      <h2>{title}</h2>
      <div className="resume-section-body">{children}</div>
    </section>
  );
}

function BulletList({ bullets }: { bullets: string[] }) {
  const filtered = bullets.filter(Boolean);
  if (!filtered.length) return null;
  return (
    <ul>
      {filtered.map((bullet, index) => (
        <li key={`${bullet}-${index}`}>{bullet}</li>
      ))}
    </ul>
  );
}

function MetaLine({ left, right, sub }: { left: string; right?: string; sub?: string }) {
  return (
    <div className="resume-entry-heading">
      <div>
        <strong>{left}</strong>
        {sub ? <span>{sub}</span> : null}
      </div>
      {right ? <time>{right}</time> : null}
    </div>
  );
}

function EducationEntries({ entries }: { entries: Education[] }) {
  return entries.length ? (
    <div className="resume-stack">
      {entries.map((entry) => (
        <article key={entry.id} className="resume-entry">
          <MetaLine
            left={`${entry.degree}${entry.school ? `, ${entry.school}` : ""}`}
            sub={entry.location}
            right={[entry.startDate, entry.endDate].filter(Boolean).join(" - ")}
          />
          <BulletList bullets={entry.details} />
        </article>
      ))}
    </div>
  ) : null;
}

function ExperienceEntries({ entries }: { entries: Experience[] }) {
  return entries.length ? (
    <div className="resume-stack">
      {entries.map((entry) => (
        <article key={entry.id} className="resume-entry">
          <MetaLine
            left={`${entry.role}${entry.organization ? `, ${entry.organization}` : ""}`}
            sub={entry.location}
            right={[entry.startDate, entry.endDate].filter(Boolean).join(" - ")}
          />
          <BulletList bullets={entry.bullets} />
        </article>
      ))}
    </div>
  ) : null;
}

function ProjectEntries({ entries }: { entries: Project[] }) {
  return entries.length ? (
    <div className="resume-stack">
      {entries.map((entry) => (
        <article key={entry.id} className="resume-entry">
          <MetaLine
            left={entry.name}
            sub={[entry.stack, entry.link].filter(Boolean).join(" | ")}
          />
          <BulletList bullets={entry.bullets} />
        </article>
      ))}
    </div>
  ) : null;
}

function PublicationEntries({ entries }: { entries: Publication[] }) {
  return entries.length ? (
    <div className="resume-stack">
      {entries.map((entry) => (
        <article key={entry.id} className="resume-publication">
          <span>{entry.citation}</span>
          <em>
            {[entry.venue, entry.year].filter(Boolean).join(", ")}
          </em>
        </article>
      ))}
    </div>
  ) : null;
}

function SimpleEntries({ entries }: { entries: SimpleItem[] }) {
  return entries.length ? (
    <div className="resume-stack">
      {entries.map((entry) => (
        <article key={entry.id} className="resume-entry">
          <MetaLine left={entry.title} sub={entry.subtitle} right={entry.date} />
          <BulletList bullets={entry.bullets} />
        </article>
      ))}
    </div>
  ) : null;
}

function CustomSections({ sections }: { sections: CustomSection[] }) {
  return (
    <>
      {sections
        .filter((section) => section.visible)
        .map((section) => (
          <Section key={section.id} title={section.title}>
            <SimpleEntries entries={section.items} />
          </Section>
        ))}
    </>
  );
}

function renderSection(data: ResumeData, key: SectionKey) {
  const setting = data.sectionSettings[key];
  if (!setting?.visible) return null;
  switch (key) {
    case "summary":
      return data.summary ? (
        <Section title={setting.label}>
          <p>{data.summary}</p>
        </Section>
      ) : null;
    case "education":
      return (
        <Section title={setting.label}>
          <EducationEntries entries={data.education} />
        </Section>
      );
    case "experience":
      return (
        <Section title={setting.label}>
          <ExperienceEntries entries={data.experience} />
        </Section>
      );
    case "projects":
      return (
        <Section title={setting.label}>
          <ProjectEntries entries={data.projects} />
        </Section>
      );
    case "skills":
      return data.skills.length ? (
        <Section title={setting.label}>
          <p className="resume-skills">{data.skills.join(" | ")}</p>
        </Section>
      ) : null;
    case "publications":
      return (
        <Section title={setting.label}>
          <PublicationEntries entries={data.publications} />
        </Section>
      );
    case "awards":
      return (
        <Section title={setting.label}>
          <SimpleEntries entries={data.awards} />
        </Section>
      );
    case "leadership":
      return (
        <Section title={setting.label}>
          <SimpleEntries entries={data.leadership} />
        </Section>
      );
    case "certifications":
      return (
        <Section title={setting.label}>
          <SimpleEntries entries={data.certifications} />
        </Section>
      );
    case "custom":
      return <CustomSections sections={data.customSections} />;
    default:
      return null;
  }
}

export function ResumePreview({ data, previewRef }: ResumePreviewProps) {
  const contact = [
    data.basics.email,
    data.basics.phone,
    data.basics.location,
    data.basics.linkedin,
    data.basics.github,
    data.basics.portfolio,
  ].filter(Boolean);

  return (
    <div
      ref={previewRef}
      className={cn(
        "resume-page",
        `resume-${data.template}`,
        `resume-font-${data.font}`,
        data.atsMode && "resume-ats",
      )}
      style={{ "--resume-accent": data.accentColor } as CSSProperties}
    >
      <header className="resume-header">
        <h1>{data.basics.fullName || "Your Name"}</h1>
        {data.basics.headline ? <p className="resume-headline">{data.basics.headline}</p> : null}
        {contact.length ? (
          <div className="resume-contact">
            {contact.map((item) => (
              <ContactLink key={item} value={item} />
            ))}
          </div>
        ) : null}
      </header>
      <main>{data.sectionOrder.map((key) => <div key={key}>{renderSection(data, key)}</div>)}</main>
    </div>
  );
}
