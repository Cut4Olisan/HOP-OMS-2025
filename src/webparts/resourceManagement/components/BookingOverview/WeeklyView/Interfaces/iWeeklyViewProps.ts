export interface WeeklyViewProps {
  weekNumber: string;
  employeeId: string;
  employeeName: string;
  onBack: () => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}
