import { UserDetails } from "../types/UserDetails";

export const validateRegister = (details: UserDetails) => {
  if (details.username.length < 3) {
    return [
      {
        field: "username",
        message: "username must be at least 3 characters",
      },
    ];
  }

  if (details.username.includes("@")) {
    return [
      {
        field: "username",
        message: "username must not contain @ character",
      },
    ];
  }
  if (!details.email.includes("@") && !details.email.includes(".")) {
    return [
      {
        field: "email",
        message: "invalid email address",
      },
    ];
  }

  if (details.password.length < 5) {
    return [
      {
        field: "password",
        message: "password must be at least 5 characters",
      },
    ];
  }
  return null;
};
