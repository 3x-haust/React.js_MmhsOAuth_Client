export interface AuthResponse {
  data?:
    | string
    | {
        accessToken: string;
        refreshToken: string;
      };
  status: number;
  timeStamp: string;
  message: string;
}
