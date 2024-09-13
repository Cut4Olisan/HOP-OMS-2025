import { RegistrationDTO } from "../../mock/iMockData";

export interface TimeSlotProps {
  timeSlotId: string;
  booking: RegistrationDTO | undefined;
  onDrop: (booking: RegistrationDTO, newStart: string) => void;
}
