import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { NextPage } from "next";
import React, { useState } from "react";
import InputField from "../../components/InputField";
import Wrapper from "../../components/Wrapper";
import { useNewPasswordMutation } from "../../generated/graphql";
import { errorConverter } from "../../utils/errorConverter";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import NextLink from "next/link";
import { type } from "os";

type Props = {
  // token: string;
};

const changePassword = ({}: Props) => {
  const router = useRouter();
  const [state, setState] = useState("");

  const [, changePassword] = useNewPasswordMutation();
  return (
    <Formik
      initialValues={{ newPassword: "" }}
      onSubmit={async (values, { setErrors }) => {
        const response = await changePassword({
          token:
            typeof router.query.token !== "string" ? "" : router.query.token,
          newPassword: values.newPassword,
        });
        if (response.data?.newPassword.errors) {
          const error = errorConverter(response.data?.newPassword.errors);
          if ("token" in error) {
            setState(error.token);
          }
          setErrors(error);
        } else if (response.data?.newPassword.user) {
          // login
          router.push("/");
        }
      }}
    >
      {({ isSubmitting }) => (
        <Wrapper variant={"small"}>
          <Form>
            <InputField
              name="newPassword"
              label="New Password"
              placeholder="new password"
              type="password"
            />
            {state && (
              <Flex>
                <Box color="red" mr={2}>
                  {state}
                </Box>
                <NextLink href="/forgot-password">
                  <Link>click here to get a new one</Link>
                </NextLink>
              </Flex>
            )}

            <Button
              type="submit"
              isLoading={isSubmitting}
              colorScheme="teal"
              mt={4}
            >
              change password
            </Button>
          </Form>
        </Wrapper>
      )}
    </Formik>
  );
};

// changePassword.getInitialProps = ({ query }) => {
//   return {
//     token: query.token as string,
//   };
// };

export default withUrqlClient(createUrqlClient)(changePassword);
