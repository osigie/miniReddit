import { Button, Box } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import router, { useRouter } from "next/router";
import React from "react";
import InputField from "../../../components/InputField";
import Layout from "../../../components/Layout";
import Wrapper from "../../../components/Wrapper";
import { useUpdatePostMutation } from "../../../generated/graphql";
import { createUrqlClient } from "../../../utils/createUrqlClient";
import { useGetId } from "../../../utils/useGetId";
import { useGetQueryFromUrl } from "../../../utils/useGetQueryFromUrl";
import createPost from "../../create-post";

type Props = {};

function EditPost({}: Props) {
  const [{ fetching, data }] = useGetQueryFromUrl();
  const router = useRouter();
  const [, updatePost] = useUpdatePostMutation();
  const intId = useGetId();

  if (!fetching && !data?.post) {
    return (
      <Layout variant="small">
        <div>Could not find post</div>
      </Layout>
    );
  }
  return fetching ? (
    <Layout variant="small">
      <div>Loading...</div>
    </Layout>
  ) : (
    <Layout variant="small">
      <Formik
        initialValues={{ title: data?.post?.title, text: data?.post?.text }}
        onSubmit={async (values, { setErrors }) => {
          if (!values.title || !values.text) {
            return;
          }
          await updatePost({
            updatePostId: intId,
            title: values.title,
            text: values.text,
          });
          router.back();
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
                update post
              </Button>
            </Form>
          </Wrapper>
        )}
      </Formik>
    </Layout>
  );
}

export default withUrqlClient(createUrqlClient, { ssr: true })(EditPost);
