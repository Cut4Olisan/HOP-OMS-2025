import * as React from "react";
import { useState, useEffect } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Text,
  DefaultButton,
  ComboBox,
  Panel,
  TooltipHost,
} from "@fluentui/react";
import {
  ArrowLeftRegular,
  ArrowRightRegular,
  AddSquareMultipleRegular,
} from "@fluentui/react-icons";
import styles from "./FiveWeekView.module.scss";
import WeeklyView from "../WeeklyView/WeeklyView";
import BackEndService from "../../../services/BackEnd";
import { IRegistration } from "../../interfaces/IRegistrationProps";
import { getWeeksFromDate, getWeekNumber } from "../../dateUtils";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { useBoolean } from "@fluentui/react-hooks";
import PeoplePickerComboBox from "./peoplePickerComponent";
import BookingComponent from "../../BookingCreation/BookingComponent";
import { Button, Divider } from "@fluentui/react-components";
import BookingCardMenu from "./bookingCardMenu";
import {
  ICustomer,
  IProject,
} from "../../RequestCreation/interfaces/IComponentFormData";

const ItemType = "BOOKING";

// Booking Card component
const BookingCard: React.FC<{
  booking: IRegistration;
  onDrop: (booking: IRegistration, newWeekNumber: number) => void;
  onEmployeeClick: (booking: IRegistration) => void;
  projects: IProject[];
  customers: ICustomer[];
}> = ({ booking, onDrop, onEmployeeClick, projects, customers }) => {
  const [, drag] = useDrag({
    type: ItemType,
    item: booking,
  });

  const project = projects.find(
    (project) => Number(project.id) === booking.projectId
  );
  const projectName = project?.name || "Unknown Project";

  const customer = customers.find(
    (customer) => customer.id === project?.customerId
  );
  const customerName = customer?.name || "Unknown Customer";

  const capitalize = (word: string) =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

  const employeeFullName = booking.employee.split("@")[0];
  const employeeNameParts = employeeFullName.split(".");
  const formattedEmployeeName = `${capitalize(employeeNameParts[0])} ${capitalize(employeeNameParts[1])}`;
  const [, setRegistrations] = useState<IRegistration[]>([]);

  return (
    <div ref={drag} className={styles.bookingCard}>
      <div className={styles.TitelAndEditIcon}>
        <Text className={styles.projectName} variant="large">
          {booking.shortDescription}
        </Text>
        <BookingCardMenu
          bookingId={booking.id}
          onBookingDeleted={(deletedBookingId) => {
            setRegistrations((prevRegistrations) =>
              prevRegistrations.filter((reg) => reg.id !== deletedBookingId)
            ); // Update the registrations state by removing the deleted booking
          }}
        />
      </div>
      <Divider></Divider>
      <Text
        className={styles.employeeName}
        variant="medium"
        onClick={() => onEmployeeClick(booking)}
      >
        {formattedEmployeeName}
      </Text>
      <div className={styles.customerAndProjectName}>
        <Text variant="medium">
          <strong>Kunde </strong> {customerName}
        </Text>
        <Text variant="medium">
          <strong>Projekt </strong> {projectName}
        </Text>
      </div>
    </div>
  );
};

// Weekly Column component
const WeekColumn: React.FC<{
  weekNumber: number;
  startDate: string;
  endDate: string;
  bookings: IRegistration[];
  onDrop: (booking: IRegistration, newWeekNumber: number) => void;
  onEmployeeClick: (booking: IRegistration) => void;
  projects: IProject[];
  customers: ICustomer[];
}> = ({
  weekNumber,
  startDate,
  endDate,
  bookings,
  onDrop,
  onEmployeeClick,
  projects,
  customers,
}) => {
  const [, drop] = useDrop({
    accept: ItemType,
    drop: (item: IRegistration) => {
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
            projects={projects}
            customers={customers}
          />
        ))
      ) : (
        <Text className={styles.centered}>
          <strong>Ingen bookinger</strong>
        </Text>
      )}
    </div>
  );
};

interface IFiveWeekViewProps {
  context: WebPartContext;
}

const FiveWeekView: React.FC<IFiveWeekViewProps> = ({ context }) => {
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [projects, setProjects] = useState<IProject[]>([]);
  const [registrations, setRegistrations] = useState<IRegistration[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string[]>([]);
  const [clearSelection, setClearSelection] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<
    ICustomer | undefined
  >(undefined);
  const [selectedProject, setSelectedProject] = useState<string | undefined>(
    undefined
  );
  const [selectedBooking, setSelectedBooking] = useState<
    IRegistration | undefined
  >(undefined);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isOpen, { setTrue: openPanel, setFalse: dismissPanel }] =
    useBoolean(false); // Panel control

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

  const weeksToDisplay = getWeeksFromDate(currentDate);

  const clearFilters = (): void => {
    setSelectedEmployee([]);
    setSelectedCustomer(undefined);
    setSelectedProject(undefined);
    setClearSelection(true);
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
    movedBooking: IRegistration,
    newWeekNumber: number
  ): void => {
    const updatedBookings = registrations.map((booking) => {
      if (booking.id === movedBooking.id) {
        return { ...booking, date: `2024-W${newWeekNumber}` };
      }
      return booking;
    });
    setRegistrations(updatedBookings);
  };

  const handleEmployeeClick = (booking: IRegistration): void => {
    setSelectedBooking(booking); // Update selected booking
    dismissPanel(); // Close panel if open
  };

  // Filter bookings based on selected filters (employee, customer, project)
  const filteredBookings = registrations.filter((booking) => {
    const project = projects.find((p) => Number(p.id) === booking.projectId);
    return (
      booking.registrationType === 2 &&
      (selectedEmployee.length === 0 ||
        selectedEmployee.includes(booking.employee)) &&
      (!selectedCustomer || project?.customerId === selectedCustomer?.id) &&
      (!selectedProject || booking.projectId === Number(selectedProject))
    );
  });

  const filteredProjects = selectedCustomer
    ? projects.filter((p) => p.customerId === selectedCustomer.id)
    : projects;

  // If an employee is clicked, render the WeeklyView
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
        onBack={() => setSelectedBooking(undefined)} // Reset to go back to FiveWeekView
        onPreviousWeek={handlePreviousWeeks}
        onNextWeek={handleNextWeeks}
        projects={projects}
        customers={customers}
      />
    );
  }

  return (
    <div className={styles.teamsContext}>
      <DndProvider backend={HTML5Backend}>
        <div className={styles.container}>
          <div className={styles.controlsContainer}>
            <div className={styles.filterContainer}>
              <PeoplePickerComboBox
                context={context}
                onChange={(selectedEmails) =>
                  setSelectedEmployee(selectedEmails)
                }
                clearSelection={clearSelection}
              />

              <ComboBox
                placeholder="Vælg en kunde"
                options={customers
                  .filter((c) => c.active)
                  .map((customer) => ({
                    key: customer.id.toString(),
                    text: customer.name,
                  }))}
                selectedKey={selectedCustomer?.id?.toString() || ""}
                onChange={(e, option) =>
                  setSelectedCustomer(
                    customers.find((c) => c.id.toString() === option?.key) ||
                      undefined
                  )
                }
                calloutProps={{
                  doNotLayer: true,
                  className: styles.limitCalloutSize,
                }}
                allowFreeInput
                autoComplete="on"
              />

              <ComboBox
                placeholder="Vælg et projekt"
                options={filteredProjects.map((project: IProject) => ({
                  key: project.id.toString(),
                  text: project.name,
                }))}
                selectedKey={selectedProject || ""}
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
                type={5}
                isOpen={isOpen}
                closeButtonAriaLabel="Close"
                isHiddenOnDismiss={false} // **Hvis sat til true vil panel ikke åbne igen efter at have åbnet site acces eller lign.**
                onDismiss={dismissPanel}
              >
                <BookingComponent
                  context={context}
                  customers={customers}
                  coworkers={[]}
                  projects={projects}
                  dismissPanel={dismissPanel}
                  onFinish={(registrations) => {
                    console.log("Finished bookings", registrations);
                    dismissPanel();
                  }}
                />
              </Panel>
              <TooltipHost content="Forrige uge..">
                <Button
                  className={styles.upIconScale}
                  appearance="subtle"
                  size="large"
                  icon={<ArrowLeftRegular />}
                  onClick={handlePreviousWeeks}
                />
              </TooltipHost>

              <TooltipHost content="Næste uge..">
                <Button
                  className={styles.upIconScale}
                  appearance="subtle"
                  size="large"
                  icon={<ArrowRightRegular />}
                  onClick={handleNextWeeks}
                />
              </TooltipHost>

              <TooltipHost content="Opret booking..">
                <Button
                  className={styles.upIconScale}
                  appearance="subtle"
                  size="large"
                  icon={<AddSquareMultipleRegular />}
                  onClick={openPanel}
                />
              </TooltipHost>
            </div>
          </div>
          <div className={styles.gridHeader}>
            {weeksToDisplay.map((week, index) => (
              <div key={index} className={styles.weekHeader}>
                <Text variant="large">
                  <strong>Uge {week.weekNumber}</strong>
                  <Text>(timer)</Text>
                  {/*regn sum af timer for ugen ud, ved filter regn sum for den/de valgte medarbejdere*/}
                </Text>
                <Text>
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
                (booking) =>
                  getWeekNumber(new Date(booking.date)) === weekNumber
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
                  projects={projects}
                  customers={customers}
                />
              );
            })}
          </div>
        </div>
      </DndProvider>
    </div>
  );
};

export default FiveWeekView;
