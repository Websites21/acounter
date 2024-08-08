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

export type TGoogleUser = {
  sub: string;
  name: string;
  given_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
};
