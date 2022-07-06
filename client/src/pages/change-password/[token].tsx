import { NextPage } from "next";
import React from "react";

type Props = {
  token: string;
};

const changePassword: NextPage<{ token: string }> = ({ token }: Props) => {
  return <div>{token}</div>;
};

changePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string,
  };
};

export default changePassword;
