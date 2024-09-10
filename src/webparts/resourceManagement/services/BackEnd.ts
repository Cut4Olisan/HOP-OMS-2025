export interface Registration {
  id: number;
  shortDescription: string;
  description: string | undefined;
  projectId: number | undefined;
  date: string;
  start: string;
  end: string;
  time: number | undefined;
  invoiceable: boolean;
  hourlyRate: number | undefined;
  employee: string;
  registrationType: number | undefined;
  forecastEstimate: number | undefined;
}

export interface RegistrationType {
  id: number;
  name: string;
}

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
  // private static API_URL_Projects: string = BackEndService.baseurl + "api/projects";
  // private static API_URL_ProjectStatus: string = BackEndService.baseurl + "api/projectStatus";

  private static handleResponse = async (response: Response): Promise<any> => {
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }
    return response.json();
  };

  public async getRegistrationTypes<T>(): Promise<T> {
    const response = await fetch(BackEndService.API_URL_RegistrationType, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await BackEndService.handleResponse(response);
  }

  public async getCustomers<T>(): Promise<T> {
    const response = await fetch(BackEndService.API_URL_Customers, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await BackEndService.handleResponse(response);
  }

  public async createRegistration(data: Partial<Registration>): Promise<void> {
    const response = await fetch(BackEndService.API_URL_Registration, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return await BackEndService.handleResponse(response);
  }

  public async getRegistrations<T>(registrationType?: number): Promise<T> {
    const response = await fetch(BackEndService.API_URL_Registration);
    
    if (!response.ok) {
      throw new Error("Fejl ved hentning af data");
    }
    const allRegistrations = (await response.json()) as Registration[];
  
    // If registrationType is provided, filter the registrations
    const filteredRegistrations = registrationType
      ? allRegistrations.filter(reg => reg.registrationType === registrationType)
      : allRegistrations;
  
    return filteredRegistrations as unknown as T;
  }
  
}

export default BackEndService;
