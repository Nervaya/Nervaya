export interface ConsultingHour {
    dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    startTime: string; // Format: "09:00 AM"
    endTime: string; // Format: "05:00 PM"
    isEnabled: boolean;
}

export interface Therapist {
    _id: string;
    name: string;
    email?: string;
    qualifications?: string[];
    experience?: string;
    languages?: string[];
    specializations?: string[];
    image?: string;
    consultingHours?: ConsultingHour[];
}
