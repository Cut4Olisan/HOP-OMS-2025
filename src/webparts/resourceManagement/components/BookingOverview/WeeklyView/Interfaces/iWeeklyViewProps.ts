import { RegistrationDTO } from "../../mock/iMockData";

export interface WeeklyViewProps {
  weekNumber: string;
  employeeId: string;
  weekBookings: RegistrationDTO[];
  employeeName: string;
  onBack: () => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}
