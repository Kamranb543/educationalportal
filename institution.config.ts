// institution.config.ts

export type ThemeColorKey =
  | "primary"
  | "secondary"
  | "accent"
  | "background"
  | "card"
  | "muted";

export interface InstitutionConfig {
  identity: {
    name: string;
    shortName: string;
    type: "Academy" | "School" | "College" | "Training Institute";
    tagline: string;
    logoUrl: string;
    ownerName: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
  };
  localization: {
    currencySymbol: string; // e.g. "Rs." or "$"
    currencyCode: string;   // e.g. "PKR" or "USD"
    dateFormat: string;     // e.g. "DD/MM/YYYY"
    timezone: string;       // e.g. "Asia/Karachi"
  };
  branding: {
    themeMode: "light" | "dark" | "system";
    colors: {
      primary: string;    // Core brand color (buttons, primary links)
      secondary: string;  // Supporting UI elements
      accent: string;     // Badges, highlights, active indicators
      background: string; // Page body background
      card: string;       // Card surfaces and container backgrounds
      muted: string;      // Borders, subtle backgrounds, inactive text
    };
    sidebar: {
      variant: "dark" | "light" | "brand";
      backgroundColor: ThemeColorKey; // Maps to key in branding.colors
      textColor: ThemeColorKey;       // Maps to key in branding.colors
      activeItemColor: ThemeColorKey; // Maps to key in branding.colors
    };
  };
  terminology: {
    studentLabel: string; // e.g. "Student" or "Trainee"
    teacherLabel: string; // e.g. "Teacher" or "Instructor" or "Faculty"
    classLabel: string;   // e.g. "Class" or "Batch" or "Section"
    courseLabel: string;  // e.g. "Course" or "Subject"
  };
  /** Format for auto-generated student roll numbers (e.g. "FA26-001"). */
  rollNumberConfig: {
    prefix: string; // Admission-cycle prefix, e.g. "FA26"
    pad: number;    // Zero-padded sequence width
    separator: string;
  };
  /** Format for auto-generated faculty employee IDs (e.g. "EMP-1001"). */
  teacherIdConfig: {
    prefix: string;
    pad: number;
    separator: string;
    startAt: number; // First sequence number for new hires
  };
  enabledModules: {
    financialLedger: boolean;
    studentFees: boolean;
    teacherPayroll: boolean;
    customExpenses: boolean;
    attendanceTracking: boolean;
    announcements: boolean;
    reportsAndAnalytics: boolean;
  };
}

export const defaultInstitutionConfig: InstitutionConfig = {
  identity: {
    name: "PakMillat Academy",
    shortName: "PMA",
    type: "Academy",
    tagline: "Excellence in Modern Education",
    logoUrl: "/logo.png",
    ownerName: "Muhammad Kamran",
    contactEmail: "info@pakmillat.edu.pk",
    contactPhone: "+92 300 1234567",
    address: "Main Campus, Education Zone, Pakistan",
  },
  localization: {
    currencySymbol: "Rs.",
    currencyCode: "PKR",
    dateFormat: "DD/MM/YYYY",
    timezone: "Asia/Karachi",
  },
  branding: {
    themeMode: "light",
    colors: {
      primary: "#0f172a",    // Dark Slate
      secondary: "#475569",  // Muted Slate
      accent: "#2563eb",     // Royal Blue
      background: "#f8fafc", // Crisp light blue-gray
      card: "#ffffff",       // Pure White
      muted: "#e2e8f0",      // Soft Gray
    },
    sidebar: {
      variant: "brand",
      backgroundColor: "primary",    // Sidebar uses primary color
      textColor: "muted",            // Sidebar text uses muted color
      activeItemColor: "accent",     // Active nav link uses accent color
    },
  },
  terminology: {
    studentLabel: "Trainee",
    teacherLabel: "Teacher",
    classLabel: "Class",
    courseLabel: "Course",
  },
  rollNumberConfig: {
    prefix: "FA26",
    pad: 3,
    separator: "-",
  },
  teacherIdConfig: {
    prefix: "EMP",
    pad: 4,
    separator: "-",
    startAt: 1001,
  },
  
  enabledModules: {
    financialLedger: true,
    studentFees: true,
    teacherPayroll: true,
    customExpenses: true,
    attendanceTracking: true,
    announcements: true,
    reportsAndAnalytics: true,
  },
};