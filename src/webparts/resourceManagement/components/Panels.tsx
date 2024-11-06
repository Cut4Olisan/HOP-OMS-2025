import * as React from "react";
import { Panel, Stack, PanelType } from "@fluentui/react";
import useGlobal from "../hooks/useGlobal";
import RegistrationForm from "./forms/RegistrationForm";
import RequestsList from "./RequestsList";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import {
  RegistrationPanelState,
  RequestsPanelState,
} from "../context/GlobalContext";
import { FormMode } from "./interfaces/IRequestComponentProps";
import RequestForm from "./forms/RequestForm";
import BackEndService from "../services/BackEnd";

const Panels: React.FC<{ context: WebPartContext }> = ({ context }) => {
  const {
    bookingPanelState,
    setBookingPanelState,

    requestsPanelState,
    setRequestsPanelState,

    showRequestListPanel,
    setShowRequestListPanel,

    setRegistrations,
  } = useGlobal();

  return (
    <Stack>
      <Panel
        type={PanelType.medium}
        isOpen={bookingPanelState.state !== RegistrationPanelState.Hidden}
        onDismiss={() =>
          setBookingPanelState({
            state: RegistrationPanelState.Hidden,
            data: undefined,
          })
        }
        headerText={(() => {
          if (bookingPanelState.state === RegistrationPanelState.Create)
            return "Opret booking";
          if (bookingPanelState.state === RegistrationPanelState.Edit)
            return "Rediger booking";
        })()}
      >
        <RegistrationForm
          formState={bookingPanelState}
          context={context}
          dismissPanel={() =>
            setBookingPanelState({
              state: RegistrationPanelState.Hidden,
              data: undefined,
            })
          }
          onFinish={async () => {
            setRegistrations(
              (await BackEndService.Api.registrationsTypeDetail(2)).data
            );
            setBookingPanelState({
              state: RegistrationPanelState.Hidden,
              data: undefined,
            });
          }}
        />
      </Panel>

      <Panel
        type={PanelType.medium}
        isOpen={requestsPanelState.state !== RequestsPanelState.Hidden}
        onDismiss={() =>
          setRequestsPanelState({
            state: RequestsPanelState.Hidden,
            data: undefined,
          })
        }
        headerText={(() => {
          if (requestsPanelState.state === RequestsPanelState.Create)
            return "Opret anmodning";
          if (requestsPanelState.state === RequestsPanelState.Confirm)
            return "Håndter anmodning";
        })()}
      >
        {requestsPanelState.state === RequestsPanelState.Create && (
          <RequestForm
            context={context}
            mode={FormMode.CreateRequest}
            onFinish={() => undefined}
            onDismiss={() =>
              setRequestsPanelState({
                state: RequestsPanelState.Hidden,
                data: undefined,
              })
            }
          />
        )}
        {requestsPanelState.state === RequestsPanelState.Confirm && (
          <RequestForm
            context={context}
            mode={FormMode.ConfirmRequest}
            onFinish={() => undefined}
            onDismiss={() =>
              setRequestsPanelState({
                state: RequestsPanelState.Hidden,
                data: undefined,
              })
            }
            request={requestsPanelState.data}
          />
        )}
      </Panel>

      <Panel
        type={PanelType.medium}
        isOpen={showRequestListPanel}
        onDismiss={() => setShowRequestListPanel(false)}
        headerText="Modtagede anmodninger"
      >
        <RequestsList context={context} />
      </Panel>
    </Stack>
  );
};

export default Panels;
