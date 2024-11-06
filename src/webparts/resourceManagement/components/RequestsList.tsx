import * as React from "react";
import { Stack, Text, Separator, Persona, PersonaSize } from "@fluentui/react";
import BackEndService from "../services/BackEnd";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { RequestsDTO } from "./interfaces";
import useGlobal from "../hooks/useGlobal";
import { formatDateForDisplay } from "../utilities/DateUtilities";
import { RequestsPanelState } from "../context/GlobalContext";
import globalStyles from "./styles.module.scss";

interface IRequestListProps {
  context: WebPartContext;
}

const RequestsList: React.FC<IRequestListProps> = ({ context }) => {
  const { setRequestsPanelState } = useGlobal();
  const [requests, setRequests] = React.useState<RequestsDTO[]>([]);
  const [registrations, setRegistrations] = React.useState<Record<number, any>>(
    {}
  );

  React.useEffect(() => {
    const fetchRegistrationDetail = async (
      registrationId: number
    ): Promise<void> => {
      try {
        const response = await BackEndService.Api.registrationsTypeDetail(5);
        const registration = response.data.find(
          (data) => data.id === registrationId
        );
        if (registration) {
          setRegistrations((prevRegistrations) => ({
            ...prevRegistrations,
            [registrationId]: registration,
          }));
        }
      } catch (error) {
        console.error(
          `Kunne ikke hente registrering for ID ${registrationId}:`,
          error
        );
      }
    };
    const fetchRequests = async (): Promise<void> => {
      try {
        const response = await BackEndService.Api.requestsList();
        setRequests(response.data);
        response.data.forEach((req: RequestsDTO) => {
          if (req.registrationId) {
            return fetchRegistrationDetail(req.registrationId);
          }
        });
      } catch (error) {
        console.error("Kunne ikke hente anmodninger:", error);
      }
    };

    fetchRequests().catch((e) => console.error(e));
  }, []);

  return (
    <Stack tokens={{ childrenGap: 15 }}>
      <Separator />
      {requests.map((req, index) => (
        <div
          key={req.id}
          onClick={() => {
            setRequestsPanelState({
              state: RequestsPanelState.Confirm,
              data: req,
            });
          }}
          className={globalStyles.requestCard}
        >
          <Text block className={globalStyles.bold}>
            {req.title}
          </Text>
          {/* Finder "employee" og viser dem i en Persona komponent */}
          {req.registrationId && registrations[req.registrationId] ? (
            <Persona
              size={PersonaSize.size24}
              style={{ marginBlock: 8 }}
              imageUrl={`${context.pageContext.web.absoluteUrl}/_layouts/15/userphoto.aspx?size=M&accountname=${registrations[req.registrationId].employee}`}
              text={registrations[req.registrationId].employee
                .split("@")[0]
                .split(".")
                .map(
                  (name: string) => name.charAt(0).toUpperCase() + name.slice(1)
                )
                .join(" ")}
            />
          ) : (
            <Persona
              size={PersonaSize.size24}
              style={{ marginBlock: 8 }}
              showUnknownPersonaCoin={true}
              text="Ingen medarbejder tilkoblet"
            />
          )}
          {req.registrationId && registrations[req.registrationId] ? (
            <Text>{`${formatDateForDisplay(registrations[req.registrationId].date.split("T")[0])} ${registrations[req.registrationId].start}-${registrations[req.registrationId].end}`}</Text>
          ) : (
            <Text>Ingen dato valgt</Text>
          )}
          <Text>{req.accepted}</Text>
          {/* {!!requests[index + 1] ? <Separator /> : undefined} */}
        </div>
      ))}
    </Stack>
  );
};

export default RequestsList;
