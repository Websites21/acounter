export type TSignupForm = {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
};

export type TLoginForm = {
  email: string;
  password: string;
};

export type TVerifyEmailForm = {
  code: string;
};
