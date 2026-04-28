import type { ResumeData, SectionSettings } from "@/types/resume";

const sectionSettings: SectionSettings = {
  summary: { label: "Professional Summary", visible: true },
  education: { label: "Education", visible: true },
  experience: { label: "Research & Work Experience", visible: true },
  projects: { label: "Selected Projects", visible: true },
  skills: { label: "Technical Skills", visible: true },
  publications: { label: "Publications", visible: true },
  awards: { label: "Awards & Honors", visible: true },
  leadership: { label: "Leadership & Teaching", visible: true },
  certifications: { label: "Certifications", visible: true },
  custom: { label: "Custom Sections", visible: true },
};

export const emptyResume: ResumeData = {
  basics: {
    fullName: "",
    headline: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
  },
  summary: "",
  education: [],
  experience: [],
  projects: [],
  skills: [],
  publications: [],
  awards: [],
  leadership: [],
  certifications: [],
  customSections: [],
  sectionOrder: [
    "summary",
    "education",
    "experience",
    "projects",
    "skills",
    "publications",
    "awards",
    "leadership",
    "certifications",
    "custom",
  ],
  sectionSettings,
  template: "classic",
  accentColor: "#155e75",
  font: "serif",
  atsMode: false,
};

export const sampleResume: ResumeData = {
  ...emptyResume,
  basics: {
    fullName: "Ikteder Akhand Udoy",
    headline: "Computer Science PhD Student | Machine Learning, Efficient AI, Vision, LLM Systems",
    email: "ikteder.udoy@example.com",
    phone: "+1 (555) 012-8042",
    location: "United States",
    linkedin: "linkedin.com/in/ikteder-akhand-udoy",
    github: "github.com/Ikteder",
    portfolio: "ikteder.dev",
  },
  summary:
    "Computer Science PhD student researching efficient and robust machine learning systems, with a focus on computer vision, quantization-aware deployment, LLM inference, and hardware-aware deep learning. Experienced building reproducible experiment pipelines, benchmark suites, and production-minded ML tooling for model evaluation, export, and deployment.",
  education: [
    {
      id: "edu-phd",
      school: "University Research Lab",
      degree: "PhD in Computer Science, Machine Learning Systems",
      location: "United States",
      startDate: "2024",
      endDate: "Present",
      details: [
        "Research focus: efficient AI, computer vision robustness, quantization, LLM inference, and hardware-aware neural networks.",
        "Coursework includes deep learning, optimization, distributed systems, computer architecture, and statistical machine learning.",
      ],
    },
    {
      id: "edu-bs",
      school: "Metropolitan Institute of Technology",
      degree: "BS in Computer Science",
      location: "Dhaka, Bangladesh",
      startDate: "2019",
      endDate: "2023",
      details: [
        "Graduated with high distinction; completed thesis on efficient neural network compression for resource-constrained devices.",
      ],
    },
  ],
  experience: [
    {
      id: "exp-research",
      organization: "Machine Learning Systems Lab",
      role: "Graduate Research Assistant",
      location: "United States",
      startDate: "2024",
      endDate: "Present",
      bullets: [
        "Developed benchmark harnesses comparing model accuracy, latency, memory footprint, and robustness across ResNet, MobileNetV3, EfficientNet, ConvNeXt, and transformer workloads.",
        "Designed quantization and sparsity experiments to evaluate accuracy-efficiency trade-offs for deployment on CPU and edge-style inference environments.",
        "Built reproducible pipelines for model export validation, ONNX/TorchScript benchmarking, and drift-aware predictive maintenance experiments.",
      ],
    },
    {
      id: "exp-ta",
      organization: "Department of Computer Science",
      role: "Teaching Assistant, Deep Learning and Data Mining",
      location: "United States",
      startDate: "2024",
      endDate: "2025",
      bullets: [
        "Led labs on PyTorch, model evaluation, feature engineering, and reproducible experiment tracking for 80+ students.",
        "Created grading rubrics and debugging guides focused on data leakage, metric interpretation, and model failure analysis.",
      ],
    },
  ],
  projects: [
    {
      id: "proj-edge",
      name: "Edge AI Benchmark Suite",
      stack: "Python, PyTorch, scikit-learn, psutil, matplotlib",
      link: "github.com/Ikteder/edge-ai-benchmark-suite",
      bullets: [
        "Compared classical ML, CNN backbones, and lightweight transformer workloads under accuracy, latency, memory, model size, and energy-proxy constraints.",
        "Produced Pareto-front visualizations and paper-style reports to identify deployment-ready model families.",
      ],
    },
    {
      id: "proj-llm",
      name: "Efficient LLM Inference Research Toolkit",
      stack: "Python, Hugging Face Transformers, PyTorch",
      link: "github.com/Ikteder/efficient-llm-inference-research-toolkit",
      bullets: [
        "Benchmarked DistilGPT-2 and GPT-2 variants across FP32, int8, pruning, low-rank compression, and export compatibility settings.",
        "Measured perplexity, tokens/sec, latency, memory, model size, and approximation error with generated research reports.",
      ],
    },
    {
      id: "proj-agent",
      name: "LLM Agent for Experiment and Knowledge Workflows",
      stack: "FastAPI, Streamlit, RAG, SQLite, Python",
      link: "github.com/Ikteder/llm-agent-workflows",
      bullets: [
        "Built an agent system that answers grounded questions over experiment reports, logs, CSV metrics, and generated summaries.",
        "Added retrieval evaluation with 25 benchmark questions, source citations, report generation, and session memory.",
      ],
    },
  ],
  skills: [
    "Python",
    "PyTorch",
    "TensorFlow",
    "scikit-learn",
    "Hugging Face Transformers",
    "Computer Vision",
    "LLM Inference",
    "Quantization",
    "ONNX",
    "TorchScript",
    "Model Benchmarking",
    "FastAPI",
    "React",
    "Next.js",
    "Docker",
    "Git",
  ],
  publications: [
    {
      id: "pub-1",
      citation:
        "Udoy, I. A., and Research Group. Hardware-Aware Quantization for Efficient Vision Transformers on Edge Devices.",
      venue: "Workshop on Efficient Deep Learning Systems",
      year: "2026",
    },
    {
      id: "pub-2",
      citation:
        "Udoy, I. A., and Collaborators. Robustness and Deployment Trade-offs in Compact Computer Vision Backbones.",
      venue: "ML Systems Student Research Symposium",
      year: "2025",
    },
  ],
  awards: [
    {
      id: "award-1",
      title: "Graduate Research Fellowship Nominee",
      subtitle: "Recognized for research in efficient AI systems",
      date: "2025",
      bullets: [],
    },
    {
      id: "award-2",
      title: "Outstanding Undergraduate Thesis",
      subtitle: "Efficient neural network compression for constrained devices",
      date: "2023",
      bullets: [],
    },
  ],
  leadership: [
    {
      id: "lead-1",
      title: "ML Reading Group Organizer",
      subtitle: "Machine Learning Systems Lab",
      date: "2025",
      bullets: [
        "Organized weekly discussions on LLM systems, pruning, quantization, model export, and reproducibility.",
      ],
    },
  ],
  certifications: [
    {
      id: "cert-1",
      title: "Deep Learning Specialization",
      subtitle: "Coursera",
      date: "2024",
      bullets: [],
    },
  ],
  customSections: [
    {
      id: "custom-1",
      title: "Research Interests",
      visible: true,
      items: [
        {
          id: "interest-1",
          title: "Efficient and Robust AI",
          subtitle: "Quantization, model compression, multimodal inference, and deployment evaluation",
          date: "",
          bullets: [],
        },
      ],
    },
  ],
};
