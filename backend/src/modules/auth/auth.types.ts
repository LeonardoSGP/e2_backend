export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  rol_id?: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: number;
      name: string;
      email: string;
      roles: string[];
      carrera?: string | null;
      no_control?: string | null;
      telefono?: string | null;
    };
    token?: string;
    refreshToken?: string;
    dashboardRoute?: string;
  };
}
