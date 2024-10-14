import {
  AcceptRequestRequestDTO,
  Api,
  EditRegistrationRequestDTO,
} from "../components/interfaces";
import {
  IRegistration,
  IRegistrationData,
} from "../components/interfaces/IRegistrationProps";
import {
  IRequest,
  IRequestCreateDTO,
} from "../components/RequestCreation/interfaces/IRequestComponentProps";

class BackEndService extends Api<unknown> {
  private static _instance: BackEndService;

  public static get Instance(): BackEndService {
    if (!this._instance) {
      this._instance = new BackEndService();
    }
    return this._instance;
  }

  public static Init(url: string): BackEndService {
    this._instance = new BackEndService({ baseUrl: url });
    return this._instance;
  }

  // Static endpoints
  private static baseurl: string = "https://ngage-financial.azurewebsites.net/";
  private static API_URL_RegistrationType: string =
    BackEndService.baseurl + "api/registrationType";
  private static API_URL_Registration: string =
    BackEndService.baseurl + "api/registrations";

  public static client = new Api({
    baseUrl: this.baseurl,
    baseApiParams: { headers: this.getHeaders() },
  });

  private static handleResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }
    const data = await response.json();
    return data as unknown as T;
  };

  public static getHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      "api-key": "e67651b1-80a9-41c5-9f1e-acf409d5464b",
    };
  }

  public async getRegistrationTypes<
    RegistrationType,
  >(): Promise<RegistrationType> {
    const response = await fetch(BackEndService.API_URL_RegistrationType, {
      method: "GET",
      headers: BackEndService.getHeaders(),
    });
    return await BackEndService.handleResponse(response);
  }

  public async createRegistration(
    data: IRegistrationData
  ): Promise<IRegistration> {
    const response = await fetch(BackEndService.API_URL_Registration, {
      method: "POST",
      headers: BackEndService.getHeaders(),
      body: JSON.stringify(data),
    });
    return await BackEndService.handleResponse<IRegistration>(response);
  }

  public async updateRegistrations(
    id: number,
    data: EditRegistrationRequestDTO
  ): Promise<void> {
    const response = await this.api.registrationsUpdate(id, data, {
      headers: BackEndService.getHeaders(),
    });
    await BackEndService.handleResponse(response);
  }

  public async deleteBooking(bookingId: number): Promise<void> {
    const response = await fetch(
      `${BackEndService.API_URL_Registration}/${bookingId}`,
      {
        method: "DELETE",
        headers: BackEndService.getHeaders(),
      }
    );

    return await BackEndService.handleResponse<void>(response);
  }

  public async getRegistrationsByType(
    registrationType?: number
  ): Promise<IRegistration[]> {
    const url = registrationType
      ? `${BackEndService.API_URL_Registration}/type/${registrationType}`
      : BackEndService.API_URL_Registration;

    const response = await fetch(url, {
      method: "GET",
      headers: BackEndService.getHeaders(),
    });

    return await BackEndService.handleResponse<IRegistration[]>(response);
  }

  public async getRequests(): Promise<IRequest[]> {
    const response: IRequest[] = await this.api
      .requestsList({ headers: BackEndService.getHeaders() })
      .then((r) => r.json());

    return response;
  }

  public async createRequest(
    data: Partial<IRequestCreateDTO>
  ): Promise<IRequestCreateDTO> {
    const response = await this.api
      .requestsCreate(data, {
        headers: BackEndService.getHeaders(),
      })
      .then((r) => r.json());
    return response as IRequestCreateDTO;
  }

  public async acceptRequest(
    id: number,
    data: AcceptRequestRequestDTO
  ): Promise<void> {
    const requestData: AcceptRequestRequestDTO = {
      start: data.start,
      end: data.end,
      repeated: data.repeated,
    };

    const response = await this.api
      .requestsAcceptPartialUpdate(id, requestData)
      .then((r) => r.json());

    return response;
  }

  public async rejectRequest(id: number): Promise<void> {
    const response = await this.api
      .requestsRejectPartialUpdate(id)
      .then((r) => r.json());
    return response;
  }
}

export default BackEndService;
