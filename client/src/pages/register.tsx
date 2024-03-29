import React from "react";
import { Form, Formik } from "formik";
import { Box, Button } from "@chakra-ui/react";
import Wrapper from "../components/Wrapper";
import InputField from "../components/InputField";
import { useRegisterMutation } from "../generated/graphql";
import { errorConverter } from "../utils/errorConverter";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
type Props = {};

function Register({}: Props) {
  const router = useRouter();
  const [, register] = useRegisterMutation();
  return (
    <Formik
      initialValues={{ username: "", password: "", email:"" }}
      onSubmit={async (values, { setErrors }) => {
        const response = await register({ details: values });
        console.log(response);
        if (response.data?.register.errors) {
          setErrors(errorConverter(response.data?.register.errors));
        } else if (response.data?.register.user) {
          // login
          router.push("/");
        }
      }}
    >
      {({ isSubmitting }) => (
        <Wrapper varaint={"small"}>
          <Form>
            <InputField
              name="username"
              label="Username"
              placeholder="username"
              type="text"
            />

            <Box mt={8}>
              <InputField
                name="email"
                label="Email"
                placeholder="email"
                type="email"
              />
            </Box>

            <Box mt={8}>
              <InputField
                name="password"
                label="Password"
                placeholder="password"
                type="password"
              />
            </Box>
            <Button
              type="submit"
              isLoading={isSubmitting}
              colorScheme="teal"
              mt={4}
            >
              register
            </Button>
          </Form>
        </Wrapper>
      )}
    </Formik>
  );
}

export default withUrqlClient(createUrqlClient)(Register);
