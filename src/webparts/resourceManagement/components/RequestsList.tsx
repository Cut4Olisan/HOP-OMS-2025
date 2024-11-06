import * as React from "react";
import { Stack, Text, Separator, Persona, PersonaSize } from "@fluentui/react";
import BackEndService from "../services/BackEnd";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { RegistrationDTO, RequestsDTO } from "./interfaces";
import useGlobal from "../hooks/useGlobal";
import { formatDateForDisplay } from "../utilities/DateUtilities";
import { RequestsPanelState } from "../context/GlobalContext";
import globalStyles from "./styles.module.scss";

interface IRequestListProps {
  context: WebPartContext;
}

export interface IRequestListItem {
  request: RequestsDTO;
  templateRegistration?: RegistrationDTO;
}

const RequestsList: React.FC<IRequestListProps> = ({ context }) => {
  const { setRequestsPanelState, requests } = useGlobal();

  const [listItems, setListItems] = React.useState<IRequestListItem[]>([]);

  React.useEffect(() => {
    (async () => {
      const templates = (await BackEndService.Api.registrationsTypeDetail(5))
        .data;

      setListItems(
        await Promise.all(
          requests.map<Promise<IRequestListItem>>(async (req) => {
            if (!req.registrationId) return { request: req };

            const template = templates.find((r) => r.id === req.registrationId);

            return { request: req, templateRegistration: template };
          })
        )
      );
    })().catch((e) => console.log(e));
    /*     const fetchRegistrationDetail = async (
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

    fetchRequests().catch((e) => console.error(e)); */
  }, [requests]);

  return (
    <Stack tokens={{ childrenGap: 15 }}>
      <Separator />
      {listItems.map((item, index) => (
        <div
          key={item.request.id}
          onClick={() => {
            setRequestsPanelState({
              state: RequestsPanelState.Confirm,
              data: item.request,
            });
          }}
          className={globalStyles.requestCard}
        >
          <Text block className={globalStyles.bold}>
            {item.request.title}
          </Text>
          {/* Finder "employee" og viser dem i en Persona komponent */}
          {item.request.registrationId &&
          item.templateRegistration?.employee ? (
            <Persona
              size={PersonaSize.size24}
              style={{ marginBlock: 8 }}
              imageUrl={`${context.pageContext.web.absoluteUrl}/_layouts/15/userphoto.aspx?size=M&accountname=${item.templateRegistration.employee}`}
              text={item.templateRegistration?.employee
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
          {item.request.registrationId &&
          item.templateRegistration &&
          item.templateRegistration?.date &&
          item.templateRegistration?.start &&
          item.templateRegistration?.end ? (
            <Text>{`${formatDateForDisplay(item.templateRegistration?.date.split("T")[0])} ${item.templateRegistration.start}-${item.templateRegistration.end}`}</Text>
          ) : (
            <Text>Ingen dato valgt</Text>
          )}
          <Text>{item.request.accepted}</Text>
          {/* {!!requests[index + 1] ? <Separator /> : undefined} */}
        </div>
      ))}
    </Stack>
  );
};

export default RequestsList;
