export type ToolType = "symptom_checker" | "nearby_hospitals" | "appointment" | "emergency" | "medical_records";

export interface Tool {
  id: ToolType;
  label: string;
  description: string;
  icon: string;
  color: string;
}

export const TOOLS: Tool[] = [
  {
    id: "symptom_checker",
    label: "Symptom Checker",
    description: "Guided symptom assessment",
    icon: "Stethoscope",
    color: "text-primary",
  },
  {
    id: "nearby_hospitals",
    label: "Nearby Hospitals",
    description: "Find healthcare facilities",
    icon: "MapPin",
    color: "text-accent",
  },
  {
    id: "appointment",
    label: "Appointment Assistant",
    description: "Schedule & manage visits",
    icon: "CalendarPlus",
    color: "text-info",
  },
  {
    id: "emergency",
    label: "Emergency Mode",
    description: "Critical symptom guidance",
    icon: "AlertTriangle",
    color: "text-emergency",
  },
  {
    id: "medical_records",
    label: "Medical Records",
    description: "View & manage health history",
    icon: "FileText",
    color: "text-muted-foreground",
  },
];

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  tool?: ToolType;
  timestamp: Date;
}
