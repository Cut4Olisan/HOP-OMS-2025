import * as React from 'react';
import styles from './BookingComponent.module.scss';
import { TextField, Dropdown, DatePicker, DefaultButton, PrimaryButton, Stack, DayOfWeek } from '@fluentui/react';

export interface IBookingComponentProps {
  customers: { key: string, text: string }[];
  coworkers: { key: string, text: string }[];
  projects: { key: string, text: string }[];
}

const BookingComponent: React.FC<IBookingComponentProps> = ({ customers, coworkers, projects }) => {
  const [title, setTitle] = React.useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = React.useState<string | undefined>(undefined);
  const [estimatedHours, setEstimatedHours] = React.useState<string>('');
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);
  const [selectedCoworker, setSelectedCoworker] = React.useState<string | undefined>(undefined);

  const onSave = ():void => {
    console.log({
      title,
      selectedCustomer,
      estimatedHours,
      selectedDate,
      selectedCoworker,
    });
  };

  const formatDate = (date?: Date): string => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <Stack tokens={{ childrenGap: 15 }}>
      <TextField
        placeholder='Titel'
        value={title}
        onChange={(e, newValue) => setTitle(newValue || '')}
        className={styles.inputFields}
        required
      />
      
      <Dropdown
        placeholder="Vælg kunde"
        options={customers}
        selectedKey={selectedCustomer}
        onChange={(e, option) => setSelectedCustomer(option?.key as string)}
        className={styles.inputFields}
        required
      />
      
      <TextField
        placeholder='Estimat i hele timer'
        value={estimatedHours}
        onChange={(e, newValue) => setEstimatedHours(newValue || '')}
        type="number"
        className={styles.inputFields}
        required
      />
      
      <DatePicker
        placeholder="Vælg dato"
        showMonthPickerAsOverlay
        value={new Date() || selectedDate}
        onSelectDate={(date) => setSelectedDate(date || undefined)}
        firstDayOfWeek={DayOfWeek.Monday}
        className={styles.inputFields}
        formatDate={formatDate}
      />
      
      <Dropdown
        placeholder="Vælg medarbejder"
        options={coworkers}
        selectedKey={selectedCoworker}
        onChange={(e, option) => setSelectedCoworker(option?.key as string)}
        className={styles.inputFields}
        required
      />

      <Stack horizontal tokens={{ childrenGap: 10 }}>
        <PrimaryButton text="Gem" onClick={onSave} />
        <DefaultButton text="Annuller" onClick={() => console.log('Cancelled')} />
      </Stack>
    </Stack>
  );
};

export default BookingComponent;
