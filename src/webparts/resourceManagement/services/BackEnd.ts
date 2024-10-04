import { Api } from "../components/interfaces";
import {
  ICustomer,
  IProject,
} from "../components/interfaces/ICustomerProjectsProps";
import {
  IRegistration,
  IRegistrationData,
} from "../components/interfaces/IRegistrationProps";
import {
  IRequest,
  IRequestAcceptDTO,
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
  private static API_URL_Customers: string =
    BackEndService.baseurl + "api/customers";
  private static API_URL_Registration: string =
    BackEndService.baseurl + "api/registrations";
  private static API_URL_Projects = BackEndService.baseurl + "api/projects";
  private static API_URL_Requests = BackEndService.baseurl + "api/Requests";

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
    RegistrationType
  >(): Promise<RegistrationType> {
    const response = await fetch(BackEndService.API_URL_RegistrationType, {
      method: "GET",
      headers: BackEndService.getHeaders(),
    });
    return await BackEndService.handleResponse(response);
  }

  public async getCustomers(): Promise<ICustomer[]> {
    const response = await fetch(BackEndService.API_URL_Customers, {
      method: "GET",
      headers: BackEndService.getHeaders(),
    });

    return await BackEndService.handleResponse<ICustomer[]>(response);
  }

  public async getProjects(): Promise<IProject[]> {
    const response = await fetch(BackEndService.API_URL_Projects, {
      method: "GET",
      headers: BackEndService.getHeaders(),
    });

    return await BackEndService.handleResponse<IProject[]>(response);
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
    const response = await fetch(BackEndService.API_URL_Requests, {
      method: "GET",
      headers: BackEndService.getHeaders(),
    });

    return await BackEndService.handleResponse<IRequest[]>(response);
  }

  public async createRequest(
    data: Partial<IRequestCreateDTO>
  ): Promise<IRequestCreateDTO> {
    const response = await fetch(BackEndService.API_URL_Requests, {
      method: "POST",
      headers: BackEndService.getHeaders(),
      body: JSON.stringify(data),
    });
    return await BackEndService.handleResponse<IRequestCreateDTO>(response);
  }

  public async acceptRequest(
    id: number,
    data: IRequestAcceptDTO
  ): Promise<void> {
    const url = `${BackEndService.API_URL_Requests}/${id}/accept`;

    const requestData: IRequestAcceptDTO = {
      start: data.start,
      end: data.end,
      repeated: data.repeated,
    };

    const response = await fetch(url, {
      method: "PATCH",
      headers: BackEndService.getHeaders(),
      body: JSON.stringify(requestData),
    });

    await BackEndService.handleResponse<void>(response);
  }

  public async rejectRequest(id: number): Promise<void> {
    const url = `${BackEndService.API_URL_Requests}/${id}/reject`;

    const response = await fetch(url, {
      method: "PATCH",
      headers: BackEndService.getHeaders(),
    });

    await BackEndService.handleResponse<void>(response);
  }
}

export default BackEndService;
