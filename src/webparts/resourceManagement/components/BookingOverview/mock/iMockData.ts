export interface RegistrationTypeDTO {
  id: number;
  name: string;
}

export interface RegistrationDTO {
  weekNumber: number;
  id: number;
  shortDescription: string;
  description: string;
  projectId: number;
  date: string; // ISO 8601 format (e.g., 2024-09-07T00:00:00Z)
  start: string;
  end: string;
  time: number;
  invoiceable: boolean;
  hourlyRate: number;
  employee: string;
  registrationType: number;
  forecastEstimate: number | null;
}

export interface ProjectDTO {
  id: number;
  name: string;
  customerId: number;
  parentProjectId: number | null;
  hourlyRate: number;
  invoiceable: boolean;
  projectStatus: number;
}
