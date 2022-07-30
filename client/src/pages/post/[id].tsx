import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import Layout from "../../components/Layout";
import { usePostQuery } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Stack,
  StatArrow,
} from "@chakra-ui/react";
import { useGetQueryFromUrl } from "../../utils/useGetQueryFromUrl";
import { EditAndDeleteButton } from "../../components/EditAndDeleteButton";

type Props = {};

const Post = (props: Props) => {
  const [{ data, fetching }] = useGetQueryFromUrl();

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
      <Box mt={4}>
        <EditAndDeleteButton
          id={data?.post?._id as number}
          creatorId={data?.post?.creatorId as number}
        />
      </Box>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
