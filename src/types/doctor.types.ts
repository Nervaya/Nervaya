export interface Doctor {
    _id: string;
    name: string;
    email?: string;
    qualifications?: string[];
    experience?: string;
    languages?: string[];
    specializations?: string[];
    image?: string;
}
