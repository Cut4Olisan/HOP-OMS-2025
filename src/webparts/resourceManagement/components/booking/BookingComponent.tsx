import * as React from 'react';
import styles from './BookingComponent.module.scss';
import { Text, TextField, Dropdown, DatePicker, DefaultButton, PrimaryButton, Stack, DayOfWeek } from '@fluentui/react';
import { useCustomerList } from '../Customers/fetchCustomers';

export interface IBookingComponentProps {
  coworkers: { key: string, text: string }[];
  projects: { key: string, text: string }[];
}

const BookingComponent: React.FC<IBookingComponentProps> = ({ coworkers, projects }) => {
  const [title, setTitle] = React.useState<string>('');
  const [info, setInfo] = React.useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = React.useState<string | undefined>(undefined);
  const [estimatedHours, setEstimatedHours] = React.useState<string>('');
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);
  const [selectedCoworker, setSelectedCoworker] = React.useState<string | undefined>(undefined);

  const { customers, error } = useCustomerList();
  console.log(error);

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
    <>
      <Text variant={'large'}>Opret booking</Text>
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
          options={customers.map(customer => ({ key: customer.id, text: customer.name }))}
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

        <TextField
          placeholder='Information...'
          value={info}
          onChange={(e, newValue) => setInfo(newValue || '')}
          multiline
          rows = {7}
          resizable={false}
          className={styles.textArea}
          />

        <Stack horizontal tokens={{ childrenGap: 10 }}>
          <PrimaryButton text="Gem" onClick={onSave} />
          <DefaultButton text="Annuller" onClick={() => console.log('Cancelled')} />
        </Stack>
      </Stack>
    </>
  );
};

export default BookingComponent;
