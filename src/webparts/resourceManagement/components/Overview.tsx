import { WebPartContext } from "@microsoft/sp-webpart-base";
import * as React from "react";
import BookingOverviewComponent from "./BookingOverview/BookingOverviewComponent";
import { Stack, Panel } from "@fluentui/react";
import useGlobal from "../hooks/useGlobal";
import BookingComponent from "./BookingCreation/BookingComponent";

export interface IOverview {
  context: WebPartContext;
}

const Overview: React.FC<IOverview> = ({ context }) => {
  const {
    showBookingComponentPanel,
    setShowBookingComponentPanel,
    selectedRegistration,
  } = useGlobal();
  return (
    <Stack>
      <BookingOverviewComponent context={context} />
      <Panel isOpen={showBookingComponentPanel}>
        <BookingComponent
          registration={selectedRegistration}
          context={context}
          dismissPanel={() => setShowBookingComponentPanel(false)}
          onFinish={() => undefined}
        />
      </Panel>
    </Stack>
  );
};

export default Overview;
