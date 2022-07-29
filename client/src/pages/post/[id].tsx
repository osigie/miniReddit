import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import Layout from "../../components/Layout";
import { usePostQuery } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import {
  Button,
  Flex,
  Heading,
  Link,
  Stack,
  StatArrow,
} from "@chakra-ui/react";

type Props = {};

const Post = (props: Props) => {
  const router = useRouter();
  const intId =
    typeof router.query.id === "string" ? parseInt(router.query.id) : -1;
  const [{ data, fetching }] = usePostQuery({
    pause: intId === -1,
    variables: { postId: intId },
  });

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
        <Heading>{data?.post?.title}</Heading>
      <div>{data?.post?.text}</div>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
