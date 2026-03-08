import { request } from "../api/request";
import { API_FORGOT_PASSWORD, API_RESET_PASSWORD } from "../api/apiConfig";

type MessageResponse = {
  message: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export const requestPasswordResetLink = (
  payload: ForgotPasswordPayload
): Promise<MessageResponse> =>
  request<MessageResponse>("POST", API_FORGOT_PASSWORD, payload);

export const resetPassword = (payload: ResetPasswordPayload): Promise<MessageResponse> =>
  request<MessageResponse>("POST", API_RESET_PASSWORD, payload);
