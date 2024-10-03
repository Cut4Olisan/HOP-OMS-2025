import {
  ICustomer,
  IProject,
} from "../components/interfaces/ICustomerProjectsProps";
import {
  Registration,
  RegistrationData,
} from "../components/interfaces/IRegistrationProps";

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
  private static API_KEY: string = "e67651b1-80a9-41c5-9f1e-acf409d5464b";

  private static handleResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }
    const data = await response.json();
    return data as unknown as T;
  };

  public async getRegistrationTypes<
    RegistrationType,
  >(): Promise<RegistrationType> {
    const response = await fetch(BackEndService.API_URL_RegistrationType, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "api-key": BackEndService.API_KEY,
      },
    });
    return await BackEndService.handleResponse(response);
  }

  public async getCustomers(): Promise<ICustomer[]> {
    const response = await fetch(BackEndService.API_URL_Customers, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "api-key": BackEndService.API_KEY,
      },
    });

    return await BackEndService.handleResponse<ICustomer[]>(response);
  }

  public async getProjects(): Promise<IProject[]> {
    const response = await fetch(BackEndService.API_URL_Projects, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "api-key": BackEndService.API_KEY,
      },
    });

    return await BackEndService.handleResponse<IProject[]>(response);
  }

  public async createRegistration(
    data: RegistrationData
  ): Promise<Registration> {
    const response = await fetch(BackEndService.API_URL_Registration, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BackEndService.API_KEY,
      },
      body: JSON.stringify(data),
    });
    return await BackEndService.handleResponse<Registration>(response);
  }

  public async deleteBooking(bookingId: number): Promise<void> {
    const response = await fetch(
      `${BackEndService.API_URL_Registration}/${bookingId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "api-key": BackEndService.API_KEY,
        },
      }
    );

    return await BackEndService.handleResponse<void>(response);
  }

  public async getRegistrationsByType(
    registrationType?: number
  ): Promise<Registration[]> {
    const response = await fetch(BackEndService.API_URL_Registration, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "api-key": BackEndService.API_KEY,
      },
    });
    const allRegistrations =
      await BackEndService.handleResponse<Registration[]>(response);

    const filteredRegistrations = registrationType
      ? allRegistrations.filter(
          (reg) => reg.registrationType === registrationType
        )
      : allRegistrations;

    return filteredRegistrations;
  }
}

export default BackEndService;
