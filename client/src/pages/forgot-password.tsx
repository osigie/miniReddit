import React, { useState } from "react";
import { Form, Formik } from "formik";
import { Box, Button } from "@chakra-ui/react";
import Wrapper from "../components/Wrapper";
import InputField from "../components/InputField";
import {
  useForgotPasswordMutation,
} from "../generated/graphql";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
type Props = {};

function ForgotPassword({}: Props) {
  const [sent, setSent] = useState(false);
  const router = useRouter();
  const [, forgotPassword] = useForgotPasswordMutation();
  return (
    <Formik
      initialValues={{ email: "" }}
      onSubmit={async (values, { setErrors }) => {
        const response = await forgotPassword({
          email: values.email,
        });
        if (response) {
          setSent(true);
        }
      }}
    >
      {({ isSubmitting }) => (
        <Wrapper varaint={"small"}>
          {sent ? (
            <div>Email has been sent to your mail!</div>
          ) : (
            <Form>
              <InputField
                name="email"
                label="Email"
                placeholder="Email"
                type="text"
              />

              <Button
                type="submit"
                isLoading={isSubmitting}
                colorScheme="teal"
                mt={4}
              >
                forgot password
              </Button>
            </Form>
          )}
        </Wrapper>
      )}
    </Formik>
  );
}

export default withUrqlClient(createUrqlClient)(ForgotPassword);
