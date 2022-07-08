import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import InputField from "../components/InputField";
import Layout from "../components/Layout";
import Wrapper from "../components/Wrapper";
import { useAuth } from "../custumHooks/useAuth";
import { useCreatePostMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

type Props = {};

const createPost = (props: Props) => {
   const router = useRouter();
  const [, createPost] = useCreatePostMutation();
  useAuth()
  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async (values, { setErrors }) => {
          const { error } = await createPost({ input: values });
          if (!error) {
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Wrapper variant={"small"}>
            <Form>
              <InputField
                name="title"
                label="Title"
                placeholder="title"
                type="text"
              />

              <Box mt={8}>
                <InputField
                  name="text"
                  label="Body"
                  placeholder="body...."
                  type="text"
                  isTextArea={true}
                />
              </Box>

              <Button
                type="submit"
                isLoading={isSubmitting}
                colorScheme="teal"
                mt={4}
              >
                create post
              </Button>
            </Form>
          </Wrapper>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(createPost);
