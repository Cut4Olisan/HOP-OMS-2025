import * as React from "react";
import { Stack, Text, Separator, Persona, PersonaSize } from "@fluentui/react";
import BackEndService from "../../services/BackEnd";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { RequestsDTO } from "../interfaces/index";
import useGlobal from "../../hooks/useGlobal";
import styles from "./RequestComponent.module.scss";
import { formatDateForDisplay } from "../dateUtils";

interface IRequestListProps {
  context: WebPartContext;
}

const RequestList: React.FC<IRequestListProps> = ({ context }) => {
  const { setSelectedRequest, setShowRequestComponentPanel } = useGlobal();
  const [requests, setRequests] = React.useState<RequestsDTO[]>([]);
  const [registrations, setRegistrations] = React.useState<Record<number, any>>(
    {}
  );

  React.useEffect(() => {
    const fetchRequests = async (): Promise<void> => {
      try {
        const response = await BackEndService.Api.requestsList();
        setRequests(response.data);
        response.data.forEach((req: RequestsDTO) => {
          if (req.registrationId) {
            fetchRegistrationDetail(req.registrationId);
          }
        });
      } catch (error) {
        console.error("Kunne ikke hente anmodninger:", error);
      }
    };

    const fetchRegistrationDetail = async (registrationId: number) => {
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

    fetchRequests();
  }, []);

  return (
    <Stack tokens={{ childrenGap: 15 }}>
      <Separator />
      {requests.map((req, index) => (
        <div
          key={req.id}
          onClick={() => {
            setSelectedRequest(req);
            setShowRequestComponentPanel(true);
          }}
          className={styles.requestCard}
        >
          <Text block className={styles.cardTitle}>{req.title}</Text>
          {/* Finder "employee" og viser dem i en Persona komponent */}
          {req.registrationId && registrations[req.registrationId] ? (
            <Persona
              size={PersonaSize.size24}
              className={styles.blockSpacing}
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
              className={styles.blockSpacing}
              showUnknownPersonaCoin={true}
              text="Ingen medarbejder tilkoblet"
            />
          )}
          {req.registrationId && registrations[req.registrationId] ? (
            <Text>{`${formatDateForDisplay(registrations[req.registrationId].date.split("T")[0])} ${registrations[req.registrationId].start}-${registrations[req.registrationId].end}`}</Text>
          ) : (
            <Text>Ingen dato valgt</Text>
          )}
          {/* {!!requests[index + 1] ? <Separator /> : undefined} */}
        </div>
      ))}
    </Stack>
  );
};

export default RequestList;
