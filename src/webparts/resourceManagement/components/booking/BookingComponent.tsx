import * as React from 'react';
import styles from './BookingComponent.module.scss';
import { Text, TextField, Dropdown, DatePicker, DefaultButton, PrimaryButton, Stack, DayOfWeek, IDropdownStyles, IBasePickerSuggestionsProps, IPersonaProps, CompactPeoplePicker, } from '@fluentui/react';
import { useCustomerList } from '../Customers/fetchCustomers';

export interface IBookingComponentProps {
  customers: { key: string, text: string }[];
  coworkers: { key: string, text: string }[];
  projects: { key: string, text: string }[];
}
const suggestionProps: IBasePickerSuggestionsProps = {
  suggestionsHeaderText: 'Vælg medarbejder',
  mostRecentlyUsedHeaderText: 'Vælg medarbejder',
  noResultsFoundText: 'Ingen medarbejder fundet',
  loadingText: 'Indlæser',
  showRemoveButtons: false,
  suggestionsAvailableAlertText: 'Valg af medarbejdere tilgængelig',
};

const BookingComponent: React.FC<IBookingComponentProps> = ({ coworkers, projects }) => {
  const [title, setTitle] = React.useState<string>('');
  const [info, setInfo] = React.useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = React.useState<string | undefined>(undefined);
  const [estimatedHours, setEstimatedHours] = React.useState<string>('');
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);
  const [selectedCoworkers, setSelectedCoworkers] = React.useState<IPersonaProps[]>([]);

  const { customers} = useCustomerList();

  const people: IPersonaProps[] = [
    { text: 'Anders Ravn Andriansen'},
    { text: 'Charlotte Flarup'},
    { text: 'Esben Rytter'},
    { text: 'Frank Nielsen'},
    { text: 'Frederik Juhl-Hansen'},
    { text: 'Kristian Bækmark Kjær'},
    { text: 'Louise Bjerregaard'},
    { text: 'Maria Bech'},
    { text: 'Martin Rossen'},
    { text: 'Oliver Max Sund'},
    { text: 'Pernille Østergaard'},
    { text: 'Sara Avijaja Schou Nielsen'},
    { text: 'Tobias Juul Michaelsen'},
  ];
  

  const onFilterChanged = (filterText: string, currentPersonas: IPersonaProps[]): IPersonaProps[] | Promise<IPersonaProps[]> => {
    if (filterText) {
      const filteredPersonas: IPersonaProps[] = people.filter((persona: { text: string; }) =>
        persona.text?.toLowerCase().includes(filterText.toLowerCase())
      );
      return filteredPersonas;
    }
    return people;
  };


  const handleFocus = (): void => {
    onFilterChanged('', selectedCoworkers);
  };
  const handleCoworkerChange = (items?: IPersonaProps[]):void => {
    if (items) {
      setSelectedCoworkers(items);
    }
  };

  const onSave = ():void => {
    console.log({
      title,
      selectedCustomer,
      estimatedHours,
      selectedDate,
      selectedCoworkers,
    });
  };

  const formatDate = (date?: Date): string => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const dropdownStyles: Partial<IDropdownStyles> = {
    callout: {
      maxHeight: 200,
      overflowY: 'auto',
    },
    dropdown: {
      maxWidth: 300,
    },
    dropdownItem: {
      height: 'auto',
    },
    dropdownOptionText: {
      overflow: 'visible',
      whiteSpace: 'normal',
    },
  };

  return (
    <Stack horizontal>
    <div className={styles.halfWidth}>
      <Stack tokens={{ childrenGap: 15 }}>
        <Text variant={'xxLargePlus'} className={styles.headingMargin}>Opret booking</Text>
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
          styles={dropdownStyles}
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
          value={selectedDate}
          onSelectDate={(date) => setSelectedDate(date || undefined)}
          firstDayOfWeek={DayOfWeek.Monday}
          className={styles.inputFields}
          formatDate={formatDate}
          />

        <CompactPeoplePicker
            onResolveSuggestions={onFilterChanged}
            pickerSuggestionsProps={suggestionProps}
            getTextFromItem={(persona) => persona.text || ''}
            selectedItems={selectedCoworkers}
            onChange={handleCoworkerChange}
            inputProps={{
              'aria-label': 'People Picker',
              onFocus: handleFocus
            }}
            className={styles.inputFields}
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
      </div>
      <div className={styles.halfWidth}>
        <Text variant={'xxLarge'} className={styles.headingMargin}>Fremtidige bookinger på</Text>
      </div>
    </Stack>
  );
};

export default BookingComponent;
