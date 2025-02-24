export const BASE_URL = `${import.meta.env.VITE_APP_SERVER_URL || "http://127.0.0.1:3000"}/api/v1`;
export type { AuthResponse } from './AuthResponse';
export { logIn } from './LogIn';
export { sendVerificationCode } from './SendVerificationCode';
export { signUp } from './SignUp';
export { logOut } from './Logout';