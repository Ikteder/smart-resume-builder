import type { ResumeData } from "@/types/resume";

export const STORAGE_KEY = "smart-resume-builder:v1";

export function loadResumeFromStorage() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ResumeData;
  } catch {
    return null;
  }
}

export function saveResumeToStorage(data: ResumeData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearStoredResume() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
