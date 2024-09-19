export interface Registration {
  id: number;
  shortDescription: string;
  description: string | undefined;
  projectId: number | undefined;
  date: string;
  start: string;
  end: string;
  time: number | undefined;
  invoiceable: boolean;
  hourlyRate: number | undefined;
  employee: string;
  registrationType: number | undefined;
  forecastEstimate: number | undefined;
}

export interface RegistrationType {
  id: number;
  name: string;
}

export type RegistrationData = Omit<
  Registration,
  "id" | "projectId" | "invoiceable" | "hourlyRate" | "forecastEstimate"
>;
