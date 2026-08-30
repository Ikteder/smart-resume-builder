import { describe, expect, it } from "vitest";

import { sampleResume } from "@/data/sample-resume";
import { analyzeJobDescription, applyTailoringDraft } from "@/lib/job-tailor";

describe("grounded job-description tailoring", () => {
  const jobDescription = `
    We are seeking a machine learning researcher with Python and PyTorch experience.
    The role emphasizes quantization, ONNX deployment, benchmarking, and computer vision.
  `;

  it("separates matched and missing terms using resume evidence", () => {
    const analysis = analyzeJobDescription(sampleResume, jobDescription);

    expect(analysis.matchedKeywords).toEqual(expect.arrayContaining(["python", "pytorch", "quantization", "onnx"]));
    expect(analysis.relevantBullets.length).toBeGreaterThan(0);
    expect(analysis.score).toBeGreaterThan(0);
    expect(analysis.score).toBeLessThanOrEqual(100);
  });

  it("applies the draft without replacing the source experience entries", () => {
    const analysis = analyzeJobDescription(sampleResume, jobDescription);
    const tailored = applyTailoringDraft(sampleResume, analysis);

    expect(tailored.atsMode).toBe(true);
    expect(tailored.experience.map((entry) => entry.id)).toEqual(
      sampleResume.experience.map((entry) => entry.id),
    );
    expect(tailored.customSections[0]?.title).toBe("Target Role Alignment");
  });
});
