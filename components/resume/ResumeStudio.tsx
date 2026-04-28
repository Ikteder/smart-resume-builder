"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  FileDown,
  FileText,
  Moon,
  Printer,
  RotateCcw,
  Sparkles,
  Sun,
  Trash2,
  Upload,
} from "lucide-react";

import { ResumeForm } from "@/components/forms/ResumeForm";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { Button } from "@/components/ui/button";
import { emptyResume, sampleResume } from "@/data/sample-resume";
import { exportResumeDocx } from "@/lib/docx-export";
import { clearStoredResume, loadResumeFromStorage, saveResumeToStorage } from "@/lib/storage";
import type { ResumeData } from "@/types/resume";

function fileName(data: ResumeData, extension: string) {
  const base = (data.basics.fullName || "resume")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base || "resume"}.${extension}`;
}

function isOriginalSample(data: ResumeData) {
  return JSON.stringify(data) === JSON.stringify(sampleResume);
}

export function ResumeStudio() {
  const [resume, setResume] = useState<ResumeData>(emptyResume);
  const [mobileMode, setMobileMode] = useState<"edit" | "preview">("edit");
  const [darkMode, setDarkMode] = useState(false);
  const [status, setStatus] = useState("Blank resume ready");
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = loadResumeFromStorage();
    if (stored && !isOriginalSample(stored)) {
      setResume(stored);
      setStatus("Restored saved progress");
    } else if (stored) {
      clearStoredResume();
      setStatus("Blank resume ready");
    }
  }, []);

  useEffect(() => {
    saveResumeToStorage(resume);
  }, [resume]);

  const contentStats = useMemo(() => {
    const bullets =
      resume.education.reduce((count, entry) => count + entry.details.length, 0) +
      resume.experience.reduce((count, entry) => count + entry.bullets.length, 0) +
      resume.projects.reduce((count, entry) => count + entry.bullets.length, 0) +
      resume.awards.reduce((count, entry) => count + entry.bullets.length, 0) +
      resume.leadership.reduce((count, entry) => count + entry.bullets.length, 0);
    const words = JSON.stringify(resume)
      .split(/\s+/)
      .filter((word) => word.length > 2).length;
    return { bullets, words };
  }, [resume]);

  async function exportPdf() {
    if (!previewRef.current) return;
    setStatus("Preparing PDF export...");
    const html2pdf = (await import("html2pdf.js")).default;
    await html2pdf()
      .set({
        margin: 0,
        filename: fileName(resume, "pdf"),
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] },
      })
      .from(previewRef.current)
      .save();
    setStatus("PDF exported");
  }

  async function exportDocx() {
    setStatus("Preparing DOCX export...");
    await exportResumeDocx(resume);
    setStatus("DOCX exported");
  }

  function printResume() {
    window.print();
  }

  function downloadJson() {
    const blob = new Blob([JSON.stringify(resume, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName(resume, "json");
    link.click();
    URL.revokeObjectURL(url);
    setStatus("JSON backup downloaded");
  }

  function importJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as ResumeData;
        setResume(parsed);
        setStatus("JSON backup imported");
      } catch {
        setStatus("Import failed: invalid JSON file");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function clearData() {
    const confirmed = window.confirm("Clear all resume data from this browser?");
    if (!confirmed) return;
    clearStoredResume();
    setResume(emptyResume);
    setStatus("Local data cleared; blank resume ready");
  }

  function loadSampleResume() {
    setResume(sampleResume);
    setStatus("Sample resume loaded");
  }

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
        <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
            <div className="flex flex-col justify-center gap-5">
              <div className="inline-flex w-fit items-center gap-2 rounded-md border border-cyan-200 bg-cyan-50 px-3 py-1 text-sm font-medium text-cyan-800 dark:border-cyan-900 dark:bg-cyan-950 dark:text-cyan-200">
                <Sparkles className="h-4 w-4" />
                Smart Resume Studio
              </div>
              <div>
                <h1 className="max-w-4xl text-4xl font-semibold tracking-normal text-slate-950 dark:text-white md:text-6xl">
                  AI Resume Builder
                </h1>
                <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                  Build a polished, ATS-friendly resume with live preview, professional templates,
                  local autosave, JSON backup, PDF export, and editable DOCX export.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={() => document.getElementById("builder")?.scrollIntoView()}>
                  Start Building
                </Button>
                <Button type="button" variant="outline" onClick={loadSampleResume}>
                  <RotateCcw className="h-4 w-4" />
                  Load sample resume
                </Button>
              </div>
            </div>
            <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-md bg-white p-3 dark:bg-slate-900">
                  <div className="text-2xl font-semibold">{contentStats.bullets}</div>
                  <div className="text-xs text-slate-500">bullets</div>
                </div>
                <div className="rounded-md bg-white p-3 dark:bg-slate-900">
                  <div className="text-2xl font-semibold">{resume.sectionOrder.length}</div>
                  <div className="text-xs text-slate-500">sections</div>
                </div>
                <div className="rounded-md bg-white p-3 dark:bg-slate-900">
                  <div className="text-2xl font-semibold">{resume.template}</div>
                  <div className="text-xs text-slate-500">template</div>
                </div>
              </div>
              <p className="rounded-md bg-white p-3 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                {contentStats.words < 250
                  ? "Add more project and research detail before applying."
                  : contentStats.words > 1200
                    ? "Consider trimming or using compact mode for one-page roles."
                    : "Resume length is in a healthy range for most applications."}
              </p>
            </div>
          </div>
        </section>

        <section id="builder" className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">
          <div className="sticky top-0 z-20 -mx-4 mb-5 border-b border-slate-200 bg-slate-100/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{status}</p>
                <p className="text-xs text-slate-500">Autosaves locally in this browser. No login required.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex rounded-md border border-slate-300 bg-white p-1 2xl:hidden dark:border-slate-700 dark:bg-slate-900">
                  <button
                    type="button"
                    onClick={() => setMobileMode("edit")}
                    className={`rounded px-3 py-1.5 text-sm ${mobileMode === "edit" ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "text-slate-700 dark:text-slate-200"}`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileMode("preview")}
                    className={`rounded px-3 py-1.5 text-sm ${mobileMode === "preview" ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "text-slate-700 dark:text-slate-200"}`}
                  >
                    Preview
                  </button>
                </div>
                <Button type="button" variant="outline" onClick={exportPdf}>
                  <FileDown className="h-4 w-4" />
                  PDF
                </Button>
                <Button type="button" variant="outline" onClick={exportDocx}>
                  <FileText className="h-4 w-4" />
                  DOCX
                </Button>
                <Button type="button" variant="outline" onClick={printResume}>
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
                <Button type="button" variant="outline" onClick={downloadJson}>
                  <Download className="h-4 w-4" />
                  JSON
                </Button>
                <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                  <Upload className="h-4 w-4" />
                  Import
                  <input type="file" accept="application/json" className="hidden" onChange={importJson} />
                </label>
                <Button type="button" variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)} title="Toggle dark mode">
                  {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={clearData} title="Clear data">
                  <Trash2 className="h-4 w-4 text-rose-600" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-6 2xl:grid-cols-[minmax(440px,680px)_1fr]">
            <div className={mobileMode === "preview" ? "hidden 2xl:block" : "block"}>
              <ResumeForm data={resume} onChange={setResume} />
            </div>
            <aside className={mobileMode === "edit" ? "hidden 2xl:block" : "block"}>
              <div className="sticky top-28 flex justify-center overflow-auto rounded-lg border border-slate-200 bg-slate-200 p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="origin-top scale-[0.54] sm:scale-[0.72] lg:scale-[0.67] xl:scale-[0.8] 2xl:scale-90">
                  <ResumePreview data={resume} previewRef={previewRef} />
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
}
