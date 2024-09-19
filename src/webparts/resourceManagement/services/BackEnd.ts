import {
  Customer,
  Project,
} from "../components/BookingCreation/CustomerAndProjects/interfaces/ICustomerProjectsProps";
import { Registration } from "../components/BookingCreation/interfaces/IRegistrationProps";
import {
  IRequest,
  IRequestAcceptDTO,
  IRequestCreateDTO,
} from "../components/RequestCreation/interfaces/IRequestComponentProps";

class BackEndService {
  private static _instance: BackEndService;

  public static get Instance(): BackEndService {
    if (!this._instance) {
      this._instance = new BackEndService();
    }
    return this._instance;
  }

  public static Init(): BackEndService {
    this._instance = new BackEndService();
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

  private static handleResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }
    const data = await response.json();
    return data as unknown as T;
  };

  public async getRegistrationTypes<
    RegistrationType
  >(): Promise<RegistrationType> {
    const response = await fetch(BackEndService.API_URL_RegistrationType, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await BackEndService.handleResponse(response);
  }

  public async getCustomers(): Promise<Customer[]> {
    const response = await fetch(BackEndService.API_URL_Customers, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await BackEndService.handleResponse<Customer[]>(response);
  }

  public async getProjects(): Promise<Project[]> {
    const response = await fetch(BackEndService.API_URL_Projects, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await BackEndService.handleResponse<Project[]>(response);
  }

  public async createRegistration(
    data: Partial<Registration | undefined>
  ): Promise<Registration> {
    const response = await fetch(BackEndService.API_URL_Registration, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return await BackEndService.handleResponse<Registration>(response);
  }

  public async getRegistrationsByType(
    registrationType?: number
  ): Promise<Registration[]> {
    const url = registrationType
      ? `${BackEndService.API_URL_Registration}/type/${registrationType}`
      : BackEndService.API_URL_Registration;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await BackEndService.handleResponse<Registration[]>(response);
  }

  public async getRequests(): Promise<IRequest[]> {
    const response = await fetch(BackEndService.API_URL_Requests, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await BackEndService.handleResponse<IRequest[]>(response);
  }

  public async createRequest(
    data: Partial<IRequestCreateDTO>
  ): Promise<IRequestCreateDTO> {
    const response = await fetch(BackEndService.API_URL_Requests, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return await BackEndService.handleResponse<IRequestCreateDTO>(response);
  }

  public async acceptRequest(id: number, data: Omit<IRequestAcceptDTO, 'Accepted'>): Promise<void> {
    const url = `${BackEndService.API_URL_Requests}/${id}/accept`;
  
    const requestData: IRequestAcceptDTO = {
      ...data,
      Accepted: true,
    };
  
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });
  
    await BackEndService.handleResponse<void>(response);
  }

  public async rejectRequest(id: number): Promise<void> {
    const url = `${BackEndService.API_URL_Requests}/${id}/reject`;
  
    const requestData: Partial<IRequestAcceptDTO> = {
      Accepted: false,
    };
  
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });
  
    await BackEndService.handleResponse<void>(response);
  }
}

export default BackEndService;
