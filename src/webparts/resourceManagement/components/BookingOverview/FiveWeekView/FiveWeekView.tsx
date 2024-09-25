import * as React from "react";
import { useState, useEffect } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Text,
  DefaultButton,
  ComboBox,
  Panel,
  //ActionButton,
} from "@fluentui/react";
import {
  ArrowLeftRegular,
  ArrowRightRegular,
  AddSquareMultipleRegular,
} from "@fluentui/react-icons";
import styles from "./FiveWeekView.module.scss";
import WeeklyView from "../WeeklyView/WeeklyView";
import BackEndService from "../../../services/BackEnd";
import { Registration } from "../../interfaces/IRegistrationProps";
import { ICustomer, IProject } from "../../interfaces/ICustomerProjectsProps";
import { getWeeksFromDate, getWeekNumber } from "../../dateUtils";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { useBoolean } from "@fluentui/react-hooks";
import PeoplePickerComboBox from "./peoplePickerComponent";
import BookingCardMenu from "./bookingCardMenu";
import BookingComponent from "../../BookingCreation/BookingComponent";
import { Button, Tooltip } from "@fluentui/react-components"; //Bruges til at lave iconButtons

const ItemType = "BOOKING"; // Draggable item type

// Booking Card component
const BookingCard: React.FC<{
  booking: Registration;
  onDrop: (booking: Registration, newWeekNumber: number) => void;
  onEmployeeClick: (booking: Registration) => void;
}> = ({ booking, onDrop, onEmployeeClick }) => {
  const [, drag] = useDrag({
    type: ItemType,
    item: booking,
  });

  return (
    <div ref={drag} className={styles.bookingCard}>
      <Text className={styles.projectName} variant="medium">
        {booking.shortDescription}
      </Text>
      <Text
        className={styles.employeeName}
        variant="small"
        onClick={() => onEmployeeClick(booking)} // Navigate to WeeklyView on click
      >
        {booking.employee}
      </Text>
      <div className={styles.projectAndEditIcon}>
        <Text
          className={styles.customerName /*style navn ændres*/}
          variant="small"
        >
          Project: {booking.projectId /*hente project navn baseret på id*/}
        </Text>
        <div className={styles.EditIcon}>
          <BookingCardMenu />
        </div>
      </div>
    </div>
  );
};

// Weekly Column component
const WeekColumn: React.FC<{
  weekNumber: number;
  startDate: string;
  endDate: string;
  bookings: Registration[];
  onDrop: (booking: Registration, newWeekNumber: number) => void;
  onEmployeeClick: (booking: Registration) => void;
}> = ({
  weekNumber,
  startDate,
  endDate,
  bookings,
  onDrop,
  onEmployeeClick,
}) => {
  const [, drop] = useDrop({
    accept: ItemType,
    drop: (item: Registration) => {
      onDrop(item, weekNumber);
    },
  });

  return (
    <div ref={drop} className={styles.weekColumn}>
      {bookings.length > 0 ? (
        bookings.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            onDrop={onDrop}
            onEmployeeClick={onEmployeeClick}
          />
        ))
      ) : (
        <Text>Ingen bookinger</Text>
      )}
    </div>
  );
};

interface IFiveWeekViewProps {
  context: WebPartContext;
}

export interface IBookingComponentProps {
  context: WebPartContext;
  customers: ICustomer[];
  coworkers: { key: string; text: string }[];
  projects: IProject[];
  onFinish: (bookings: unknown[]) => void;
}

const FiveWeekView: React.FC<IFiveWeekViewProps> = ({ context }) => {
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [projects, setProjects] = useState<IProject[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string[]>([]);

  const [clearSelection, setClearSelection] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = React.useState<
    ICustomer | undefined
  >(undefined);
  const [selectedProject, setSelectedProject] = useState<string | undefined>(
    undefined
  );
  const [selectedBooking, setSelectedBooking] = useState<
    Registration | undefined
  >(undefined);
  const [currentDate, setCurrentDate] = useState(new Date());
  //const [showBookingComponent, setShowBookingComponent] =
  useState<boolean>(false);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const fetchedCustomers = await BackEndService.Instance.getCustomers();
        const fetchedProjects = await BackEndService.Instance.getProjects();
        const fetchedRegistrations =
          await BackEndService.Instance.getRegistrationsByType();

        setCustomers(fetchedCustomers);
        setProjects(fetchedProjects);
        setRegistrations(fetchedRegistrations);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    void fetchData();
  }, []);

  useEffect(() => {
    if (clearSelection) {
      setClearSelection(false);
    }
  }, [clearSelection]);

  //Kunde => project relation i filter
  const filteredProjects = selectedCustomer
    ? projects
        .filter((p) => p.customerId === selectedCustomer.id)
        .map((project) => ({
          key: project.id,
          text: project.name,
        }))
    : projects;

  const weeksToDisplay = getWeeksFromDate(currentDate);
  //When filters are updated and reflects to the bookingcard - update to actaully clear the filters
  const clearFilters = (): void => {
    setSelectedEmployee([]);
    setClearSelection(true);
    setSelectedCustomer(undefined);
    setSelectedProject(undefined);
  };

  const handlePreviousWeeks = (): void => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7 * 5);
    setCurrentDate(newDate);
  };

  const handleNextWeeks = (): void => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7 * 5);
    setCurrentDate(newDate);
  };

  const handleDrop = (
    movedBooking: Registration,
    newWeekNumber: number
  ): void => {
    const updatedBookings = registrations.map((booking) => {
      if (booking.id === movedBooking.id) {
        return { ...booking, date: `2024-W${newWeekNumber}` }; // Adjust date format
      }
      return booking;
    });
    setRegistrations(updatedBookings);
  };

  const handleEmployeeClick = (booking: Registration): void => {
    setSelectedBooking(booking);
  };

  const filteredBookings = registrations.filter((booking) => {
    return (
      booking.registrationType === 2 &&
      (selectedEmployee.length === 0 ||
        selectedEmployee.includes(booking.employee)) &&
      (selectedCustomer || selectedCustomer) &&
      (selectedProject || booking.projectId?.toString() === selectedProject)
    );
  });

  if (selectedBooking) {
    const selectedWeekNumber = getWeekNumber(new Date(selectedBooking.date));
    const weekBookings = registrations.filter(
      (booking) =>
        getWeekNumber(new Date(booking.date)) === selectedWeekNumber &&
        booking.employee === selectedBooking.employee &&
        booking.registrationType === 2
    );

    return (
      <WeeklyView
        weekNumber={selectedWeekNumber.toString()}
        employeeId={selectedBooking.employee}
        weekBookings={weekBookings}
        employeeName={selectedBooking.employee}
        onBack={() => setSelectedBooking(undefined)}
        onPreviousWeek={handlePreviousWeeks}
        onNextWeek={handleNextWeeks}
      />
    );
  }
  //Opret booking panel controller
  const [isOpen, { setTrue: openPanel, setFalse: dismissPanel }] =
    useBoolean(false);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.container}>
        <div className={styles.controlsContainer}>
          <div className={styles.filterContainer}>
            <PeoplePickerComboBox
              context={context}
              onChange={(selectedEmails) => {
                setSelectedEmployee(selectedEmails); // Directly set the array of emails
              }}
              clearSelection={clearSelection}
            />

            <ComboBox
              placeholder="Vælg en kunde"
              options={customers
                .filter((c) => c.active)
                .map((customer) => ({
                  key: customer.id,
                  text: customer.name,
                }))}
              selectedKey={selectedCustomer?.id}
              onChange={(e, option) =>
                option
                  ? setSelectedCustomer(
                      customers.find((c) => c.id === Number(option?.key))
                    )
                  : undefined
              }
              calloutProps={{
                doNotLayer: true,
                className: styles.limitCalloutSize,
              }}
              allowFreeInput
              autoComplete="on"
            />
            {/*WIP - ufunktionel as of now - fejlen ligger muligvis i filtringen længere oppe.*/}
            <ComboBox
              placeholder="Vælg et projekt"
              options={filteredProjects.map((project) => ({
                key: "",
                text: "",
              }))}
              selectedKey={selectedProject}
              onChange={(e, option) =>
                setSelectedProject(option?.key as string)
              }
              calloutProps={{
                doNotLayer: true,
                className: styles.limitCalloutSize,
              }}
              allowFreeInput
              autoComplete="on"
            />

            {(selectedEmployee.length > 0 ||
              selectedCustomer ||
              selectedProject) && (
              <DefaultButton text="Ryd filter" onClick={clearFilters} />
            )}
          </div>

          <div className={styles.navigationContainer}>
            <Panel
              isOpen={isOpen}
              closeButtonAriaLabel="Close"
              isHiddenOnDismiss={true}
              onDismiss={dismissPanel}
            >
              <div>
                <BookingComponent
                  context={context}
                  customers={customers}
                  coworkers={[]}
                  projects={projects}
                  dismissPanel //få passed object rigtigt
                  onFinish={(registrations) => {
                    console.log("Finished bookings", registrations);
                  }}
                />
              </div>
            </Panel>

            <Button
              appearance="subtle"
              size="large"
              icon={<ArrowLeftRegular />}
              onClick={handlePreviousWeeks}
            />
            <Button
              appearance="subtle"
              size="large"
              icon={<ArrowRightRegular />}
              onClick={handleNextWeeks}
            />
            <Button
              appearance="subtle"
              size="large"
              icon={<AddSquareMultipleRegular />}
              onClick={openPanel}
            />
            <Tooltip content="Opret en booking" relationship="label"></Tooltip>
          </div>
        </div>

        <div className={styles.gridHeader}>
          {weeksToDisplay.map((week, index) => (
            <div key={index} className={styles.weekHeader}>
              <Text variant="large">Uge {week.weekNumber}</Text>
              <Text variant="small">
                {week.start.toLocaleDateString()} -{" "}
                {week.end.toLocaleDateString()}
              </Text>
            </div>
          ))}
        </div>

        <div className={styles.weekGrid}>
          {weeksToDisplay.map((week, index) => {
            const weekNumber = week.weekNumber;
            const weekBookings = filteredBookings.filter(
              (booking) => getWeekNumber(new Date(booking.date)) === weekNumber
            );

            return (
              <WeekColumn
                key={index}
                weekNumber={weekNumber}
                startDate={week.start.toLocaleDateString()}
                endDate={week.end.toLocaleDateString()}
                bookings={weekBookings}
                onDrop={handleDrop}
                onEmployeeClick={handleEmployeeClick}
              />
            );
          })}
        </div>
      </div>
    </DndProvider>
  );
};

export default FiveWeekView;
