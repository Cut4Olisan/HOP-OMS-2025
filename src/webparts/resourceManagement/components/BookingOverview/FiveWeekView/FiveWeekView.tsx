import {
  Dropdown,
  IDropdownOption,
  Text,
  DefaultButton,
} from "@fluentui/react";
import {
  AddSquare24Regular,
  ArrowLeftRegular,
  ArrowRightRegular,
} from "@fluentui/react-icons";
import styles from "./FiveWeekView.module.scss";
import WeeklyView from "../WeeklyView/WeeklyView";
import { mockRegistrations, mockProjects } from "../mock/mockData";
import { RegistrationDTO } from "../mock/iMockData";
import { useState } from "react";
import React from "react";

// Helper function to calculate the week range (Monday to Sunday) for a given date
const getWeekRange = (date: Date) => {
  const firstDayOfWeek = new Date(
    date.setDate(date.getDate() - date.getDay() + 1)
  ); // Monday
  const lastDayOfWeek = new Date(date.setDate(firstDayOfWeek.getDate() + 6));
  return {
    start: firstDayOfWeek,
    end: lastDayOfWeek,
  };
};

// Helper function to calculate the week number of the year for a given date
const getWeekNumber = (date: Date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

// Get 5 weeks starting from a given date
const getWeeksFromDate = (startDate: Date) => {
  const weeks = [];
  let currentDate = new Date(startDate);
  for (let i = 0; i < 5; i++) {
    const { start, end } = getWeekRange(new Date(currentDate));
    weeks.push({ start, end });
    currentDate.setDate(currentDate.getDate() + 7);
  }
  return weeks;
};

const FiveWeekView: React.FC = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] =
    useState<RegistrationDTO | null>(null);

  // Track the current date to display the starting week for the view
  const [currentDate, setCurrentDate] = useState(new Date());

  // Generate the 5 weeks dynamically starting from currentDate
  const weeksToDisplay = getWeeksFromDate(currentDate);

  // Handlers for dropdown filters
  const onEmployeeChange = (
    event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ) => {
    setSelectedEmployee(option ? option.key.toString() : null);
  };

  const onCustomerChange = (
    event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ) => {
    setSelectedCustomer(option ? option.key.toString() : null);
  };

  const onProjectChange = (
    event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ) => {
    setSelectedProject(option ? option.key.toString() : null);
  };

  // Function to reset filters
  const clearFilters = () => {
    setSelectedEmployee(null);
    setSelectedCustomer(null);
    setSelectedProject(null);
  };

  // Function to handle going to the next 5 weeks
  const handleNextWeeks = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7 * 5);
    setCurrentDate(newDate);
  };

  // Function to handle going to the previous 5 weeks
  const handlePreviousWeeks = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7 * 5);
    setCurrentDate(newDate);
  };

  const handlePreviousWeekInWeeklyView = () => {
    if (selectedBooking) {
      const bookingDate = new Date(selectedBooking.date);
      bookingDate.setDate(bookingDate.getDate() - 7);
      setSelectedBooking({
        ...selectedBooking,
        weekNumber: getWeekNumber(bookingDate),
        date: bookingDate.toISOString(),
      });
    }
  };

  // Function to handle navigating to the next week in WeeklyView
  const handleNextWeekInWeeklyView = () => {
    if (selectedBooking) {
      const bookingDate = new Date(selectedBooking.date);
      bookingDate.setDate(bookingDate.getDate() + 7);
      setSelectedBooking({
        ...selectedBooking,
        weekNumber: getWeekNumber(bookingDate),
        date: bookingDate.toISOString(),
      });
    }
  };

  const filteredBookings = mockRegistrations.filter((booking) => {
    const project = mockProjects.find((p) => p.id === booking.projectId);
    return (
      (!selectedEmployee || booking.employee === selectedEmployee) &&
      (!selectedCustomer ||
        project?.customerId.toString() === selectedCustomer) &&
      (!selectedProject || booking.projectId.toString() === selectedProject)
    );
  });

  if (selectedBooking) {
    return (
      <WeeklyView
        weekNumber={selectedBooking.weekNumber.toString()}
        employeeId={selectedBooking.employee}
        onBack={() => setSelectedBooking(null)}
        onPreviousWeek={handlePreviousWeekInWeeklyView}
        onNextWeek={handleNextWeekInWeeklyView}
      />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.controlsContainer}>
        <div className={styles.filterContainer}>
          <Dropdown
            placeholder="Vælg Medarbejder"
            options={mockRegistrations.map((booking) => ({
              key: booking.employee,
              text: booking.employee,
            }))}
            onChange={onEmployeeChange}
            className={styles.filterContainerProps}
            selectedKey={selectedEmployee}
          />
          <Dropdown
            placeholder="Vælg Kunde"
            options={mockProjects.map((project) => ({
              key: project.customerId.toString(),
              text: `Kunde ${project.customerId}`,
            }))}
            onChange={onCustomerChange}
            className={styles.filterContainerProps}
            selectedKey={selectedCustomer}
          />
          <Dropdown
            placeholder="Vælg Projekt"
            options={mockProjects.map((project) => ({
              key: project.id.toString(),
              text: project.name,
            }))}
            onChange={onProjectChange}
            className={styles.filterContainerProps}
            selectedKey={selectedProject}
          />

          {(selectedEmployee || selectedCustomer || selectedProject) && (
            <DefaultButton
              text="Ryd filter"
              onClick={clearFilters}
              className={styles.clearButton}
            />
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
      <div className={styles.weeksContainer}>
        {weeksToDisplay.map((week, index) => {
          const weekNumber = getWeekNumber(week.start);

          const bookingsForWeek = filteredBookings.filter(
            (booking) => booking.weekNumber === weekNumber
          );

          return (
            <div key={index} className={styles.weekBlock}>
              <div className={styles.weekHeader}>
                <AddSquare24Regular className={styles.addIcon} />
                <Text variant="large" className={styles.Bold}>
                  Uge {weekNumber}
                </Text>
                <Text variant="small">
                  (Timer:{" "}
                  {bookingsForWeek.reduce(
                    (total, booking) => total + (booking.time || 0),
                    0
                  )}
                  )
                </Text>
              </div>
              <div className={styles.dateBlock}>
                <Text variant="medium">
                  {week.start.toLocaleDateString()} -{" "}
                  {week.end.toLocaleDateString()}
                </Text>
              </div>

              <div className={styles.bookingsList}>
                {bookingsForWeek.length > 0 ? (
                  bookingsForWeek.map((booking) => (
                    <div key={booking.id} className={styles.bookingCard}>
                      <Text className={styles.projectName} variant="large">
                        {
                          mockProjects.find((p) => p.id === booking.projectId)
                            ?.name
                        }
                      </Text>
                      <Text
                        className={styles.employeeName}
                        onClick={() => setSelectedBooking(booking)}
                      >
                        {booking.employee}
                      </Text>
                      <Text className={styles.customerName}>
                        Kunde{" "}
                        {
                          mockProjects.find((p) => p.id === booking.projectId)
                            ?.customerId
                        }
                      </Text>
                    </div>
                  ))
                ) : (
                  <Text>Ingen bookinger for denne uge</Text>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FiveWeekView;
