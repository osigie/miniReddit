import React from "react";
import { Form, Formik } from "formik";
import { Box, Button, Flex, Link } from "@chakra-ui/react";
import Wrapper from "../components/Wrapper";
import InputField from "../components/InputField";
import { useLoginMutation } from "../generated/graphql";
import { errorConverter } from "../utils/errorConverter";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from "next/link";
type Props = {};
function Login({}: Props) {
  const router = useRouter();
  const [, login] = useLoginMutation();
  return (
    <Formik
      initialValues={{ usernameOrEmail: "", password: "" }}
      onSubmit={async (values, { setErrors }) => {
        const response = await login({
          password: values.password,
          usernameOrEmail: values.usernameOrEmail,
        });
        if (response.data?.login.errors) {
          setErrors(errorConverter(response.data.login.errors));
        } else if (response.data?.login.user) {
          // login
          router.push("/");
        }
      }}
    >
      {({ isSubmitting }) => (
        <Wrapper varaint={"small"}>
          <Form>
            <InputField
              name="usernameOrEmail"
              label="Username or email"
              placeholder="username Or Email"
              type="text"
            />

            <Box mt={8}>
              <InputField
                name="password"
                label="Password"
                placeholder="password"
                type="password"
              />
            </Box>
            <Box mt={2}>
              <Flex>
                <NextLink href="/forgot-password">
                  <Link ml = "auto">forgot password?</Link>
                </NextLink>
              </Flex>
            </Box>
            <Button
              type="submit"
              isLoading={isSubmitting}
              colorScheme="teal"
              mt={4}
            >
              login
            </Button>
          </Form>
        </Wrapper>
      )}
    </Formik>
  );
}

export default withUrqlClient(createUrqlClient)(Login);
