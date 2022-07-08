import { Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import router from "next/router";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import { useCreatePostMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { errorConverter } from "../utils/errorConverter";
import {useRouter} from "next/router";
import Layout from "../components/Layout";

type Props = {};

const createPost = (props: Props) => {
  const router = useRouter();
  const [, createPost] = useCreatePostMutation();
  return (
    <Layout variant = "small">
      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await createPost({ input: values });
          router.push("/");
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
