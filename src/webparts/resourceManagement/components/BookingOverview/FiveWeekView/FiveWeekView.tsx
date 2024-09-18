import * as React from "react";
import { useState, useEffect } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Text, DefaultButton, ComboBox } from "@fluentui/react";
import {
  ArrowLeftRegular,
  ArrowRightRegular,
  AddSquareMultipleRegular,
} from "@fluentui/react-icons";
import styles from "./FiveWeekView.module.scss";
import WeeklyView from "../WeeklyView/WeeklyView";
import BackEndService, { Registration } from "../../../services/BackEnd";
import {
  Customer,
  Project,
} from "../../../components/booking/BookingComponent";
import { getWeeksFromDate, getWeekNumber } from "../../dateUtils";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import BookingComponent from "../../../components/booking/BookingComponent";
import PeoplePickerComboBox from "./peoplePickerComponent";

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
      <Text className={styles.customerName} variant="small">
        Project {booking.projectId}
      </Text>
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
  context: WebPartContext; // Add WebPartContext to props
}

const FiveWeekView: React.FC<IFiveWeekViewProps> = ({ context }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string[]>([]);
  const [clearSelection, setClearSelection] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string | undefined>(
    undefined
  );
  const [selectedProject, setSelectedProject] = useState<string | undefined>(
    undefined
  );
  const [selectedBooking, setSelectedBooking] = useState<
    Registration | undefined
  >(undefined);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [showBookingComponent, setShowBookingComponent] =
    useState<boolean>(false);

  useEffect((): void => {
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

  const handleAddBookingClick = (): void => {
    setShowBookingComponent(true);
  };

  /*const handleCloseBookingComponent = (): void => {
    setShowBookingComponent(false);
  };*/

  const weeksToDisplay = getWeeksFromDate(currentDate);

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
        return { ...booking, date: `2024-W${newWeekNumber}` }; // Adjust date format as needed
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
      (!selectedCustomer ||
        booking.projectId?.toString() === selectedCustomer) &&
      (!selectedProject || booking.projectId?.toString() === selectedProject)
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

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.container}>
        <div className={styles.controlsContainer}>
          <div className={styles.filterContainer}>
            <AddSquareMultipleRegular
              className={styles.iconWrapper}
              onClick={handleAddBookingClick}
            />

            <PeoplePickerComboBox
              context={context}
              onChange={(selectedKeys) => {
                setSelectedEmployee(selectedKeys);
              }}
              clearSelection={clearSelection} // Pass the clearSelection prop
            />

            <ComboBox
              placeholder="Vælg en kunde"
              options={customers.map((customer) => ({
                key: customer.id.toString(),
                text: customer.name,
              }))}
              selectedKey={selectedCustomer || ""}
              onChange={(e, option) =>
                setSelectedCustomer(option ? option.key.toString() : undefined)
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
              options={projects.map((project) => ({
                key: project.id.toString(),
                text: project.name,
              }))}
              selectedKey={selectedProject || ""}
              onChange={(e, option) =>
                setSelectedProject(option ? option.key.toString() : undefined)
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
            <ArrowLeftRegular
              className={styles.arrowButton}
              onClick={handlePreviousWeeks}
            />
            <ArrowRightRegular
              className={styles.arrowButton}
              onClick={handleNextWeeks}
            />
          </div>
        </div>

        {/* Conditionally render BookingComponent */}
        {showBookingComponent && (
          <BookingComponent
            context={context}
            customers={customers.map((c) => ({
              key: c.id.toString(),
              text: c.name,
            }))}
            coworkers={[]}
            projects={projects.map((p) => ({ key: p.id, text: p.name }))}
          />
        )}

        {/* Week Header */}
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

        {/* Week Columns */}
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
