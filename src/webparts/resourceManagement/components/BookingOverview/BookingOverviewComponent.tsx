import React from "react";
import FiveWeekView from "./FiveWeekView/FiveWeekView";

interface OverviewComponentsProps {}

const BookingOverviewComponent: React.FC<OverviewComponentsProps> = () => {
  return (
    <div>
      <FiveWeekView />
    </div>
  );
};

export default BookingOverviewComponent;
