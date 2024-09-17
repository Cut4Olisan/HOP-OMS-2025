import * as React from "react";
import { useState, useEffect } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Dropdown, Text, DefaultButton } from "@fluentui/react";
import { ArrowLeftRegular, ArrowRightRegular } from "@fluentui/react-icons";
import styles from "./FiveWeekView.module.scss";
import WeeklyView from "../WeeklyView/WeeklyView";
import BackEndService, { Registration } from "../../../services/BackEnd";
import {
  Customer,
  Project,
} from "../../../components/booking/BookingComponent";
import { getWeeksFromDate, getWeekNumber } from "../../dateUtils";

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

// Fix for lint warnings
const FiveWeekView: React.FC = (): JSX.Element => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string | undefined>(
    undefined
  );
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

    // Handle the promise
    void fetchData();
  }, []);

  const weeksToDisplay = getWeeksFromDate(currentDate);

  const clearFilters = (): void => {
    setSelectedEmployee(undefined);
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
      (!selectedEmployee || booking.employee === selectedEmployee) &&
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
            <Dropdown
              placeholder="Vælg Medarbejder"
              options={registrations.map((booking) => ({
                key: booking.employee,
                text: booking.employee,
              }))}
              onChange={(e, opt) =>
                setSelectedEmployee(opt ? opt.key.toString() : undefined)
              }
              selectedKey={selectedEmployee}
            />
            <Dropdown
              placeholder="Vælg Kunde"
              options={customers.map((customer) => ({
                key: customer.id.toString(),
                text: `Kunde ${customer.name}`,
              }))}
              onChange={(e, opt) =>
                setSelectedCustomer(opt ? opt.key.toString() : undefined)
              }
              selectedKey={selectedCustomer}
            />
            <Dropdown
              placeholder="Vælg Projekt"
              options={projects.map((project) => ({
                key: project.id.toString(),
                text: project.name,
              }))}
              onChange={(e, opt) =>
                setSelectedProject(opt ? opt.key.toString() : undefined)
              }
              selectedKey={selectedProject}
            />
            {(selectedEmployee || selectedCustomer || selectedProject) && (
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
