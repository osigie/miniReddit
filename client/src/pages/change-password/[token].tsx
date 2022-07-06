import { Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { Box } from "framer-motion";
import { NextPage } from "next";
import router from "next/router";
import React from "react";
import InputField from "../../components/InputField";
import Wrapper from "../../components/Wrapper";
import { errorConverter } from "../../utils/errorConverter";
import login from "../login";

type Props = {
  token: string;
};

const changePassword: NextPage<{ token: string }> = ({ token }: Props) => {
  return (
    <Formik
      initialValues={{ newPassword: "" }}
      onSubmit={async (values, { setErrors }) => {
        // const response = await login({
        //   password: values.password,
        //   usernameOrEmail: values.usernameOrEmail,
        // });
        // if (response.data?.login.errors) {
        //   setErrors(errorConverter(response.data.login.errors));
        // } else if (response.data?.login.user) {
        //   // login
        //   router.push("/");
        // }
      }}
    >
      {({ isSubmitting }) => (
        <Wrapper varaint={"small"}>
          <Form>
            <InputField
              name="newPassword"
              label="New Password"
              placeholder="new password"
              type="password"
            />

            <Button
              type="submit"
              isLoading={isSubmitting}
              colorScheme="teal"
              mt={4}
            >
              submit
            </Button>
          </Form>
        </Wrapper>
      )}
    </Formik>
  );
};

changePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string,
  };
};

export default changePassword;
