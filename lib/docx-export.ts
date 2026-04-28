import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import { saveAs } from "file-saver";

import type { ResumeData, SectionKey } from "@/types/resume";

function text(value?: string) {
  return value?.trim() ?? "";
}

function bulletParagraph(value: string) {
  return new Paragraph({
    text: value,
    bullet: { level: 0 },
    spacing: { after: 70 },
  });
}

function sectionHeading(title: string) {
  return new Paragraph({
    text: title.toUpperCase(),
    heading: HeadingLevel.HEADING_2,
    thematicBreak: true,
    spacing: { before: 180, after: 90 },
    border: {
      bottom: { color: "B8C4D0", size: 6, style: BorderStyle.SINGLE },
    },
  });
}

function roleLine(left: string, right?: string) {
  return new Paragraph({
    children: [
      new TextRun({ text: left, bold: true }),
      new TextRun({ text: right ? `    ${right}` : "", italics: true }),
    ],
    spacing: { after: 60 },
  });
}

function renderSection(data: ResumeData, key: SectionKey) {
  const setting = data.sectionSettings[key];
  if (!setting?.visible) return [];

  switch (key) {
    case "summary":
      return data.summary
        ? [sectionHeading(setting.label), new Paragraph({ text: data.summary, spacing: { after: 100 } })]
        : [];
    case "education":
      return [
        sectionHeading(setting.label),
        ...data.education.flatMap((entry) => [
          roleLine(`${entry.degree}, ${entry.school}`, `${entry.startDate} - ${entry.endDate}`),
          new Paragraph({ text: [entry.location].filter(Boolean).join(" | "), spacing: { after: 60 } }),
          ...entry.details.map(bulletParagraph),
        ]),
      ];
    case "experience":
      return [
        sectionHeading(setting.label),
        ...data.experience.flatMap((entry) => [
          roleLine(`${entry.role}, ${entry.organization}`, `${entry.startDate} - ${entry.endDate}`),
          new Paragraph({ text: entry.location, spacing: { after: 60 } }),
          ...entry.bullets.map(bulletParagraph),
        ]),
      ];
    case "projects":
      return [
        sectionHeading(setting.label),
        ...data.projects.flatMap((entry) => [
          roleLine(`${entry.name}${entry.stack ? ` | ${entry.stack}` : ""}`, entry.link),
          ...entry.bullets.map(bulletParagraph),
        ]),
      ];
    case "skills":
      return data.skills.length
        ? [sectionHeading(setting.label), new Paragraph({ text: data.skills.join(" | ") })]
        : [];
    case "publications":
      return [
        sectionHeading(setting.label),
        ...data.publications.map(
          (entry) =>
            new Paragraph({
              children: [
                new TextRun(entry.citation),
                new TextRun({ text: ` ${entry.venue}, ${entry.year}`, italics: true }),
              ],
              spacing: { after: 80 },
            }),
        ),
      ];
    case "awards":
    case "leadership":
    case "certifications":
      return [
        sectionHeading(setting.label),
        ...data[key].flatMap((entry) => [
          roleLine(entry.title, entry.date),
          entry.subtitle ? new Paragraph({ text: entry.subtitle, spacing: { after: 60 } }) : new Paragraph(""),
          ...entry.bullets.map(bulletParagraph),
        ]),
      ];
    case "custom":
      return data.customSections
        .filter((section) => section.visible)
        .flatMap((section) => [
          sectionHeading(section.title),
          ...section.items.flatMap((entry) => [
            roleLine(entry.title, entry.date),
            entry.subtitle ? new Paragraph({ text: entry.subtitle, spacing: { after: 60 } }) : new Paragraph(""),
            ...entry.bullets.map(bulletParagraph),
          ]),
        ]);
    default:
      return [];
  }
}

export async function exportResumeDocx(data: ResumeData) {
  const contact = [
    text(data.basics.email),
    text(data.basics.phone),
    text(data.basics.location),
    text(data.basics.linkedin),
    text(data.basics.github),
    text(data.basics.portfolio),
  ]
    .filter(Boolean)
    .join(" | ");

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
          },
        },
        children: [
          new Paragraph({
            text: data.basics.fullName || "Resume",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
          }),
          data.basics.headline
            ? new Paragraph({ text: data.basics.headline, alignment: AlignmentType.CENTER })
            : new Paragraph(""),
          contact ? new Paragraph({ text: contact, alignment: AlignmentType.CENTER }) : new Paragraph(""),
          ...data.sectionOrder.flatMap((key) => renderSection(data, key)),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const filename = `${data.basics.fullName || "resume"}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  saveAs(blob, `${filename || "resume"}.docx`);
}
