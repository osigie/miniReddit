import {
  Button,
  Flex,
  Heading,
  Link,
  Stack,
  StatArrow,
} from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import Layout from "../components/Layout";
import { PostsDocument, usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { Feature } from "../components/Feature";
import { useState } from "react";
import NextLink from "next/link";
import {Updoots} from "../components/Updoots";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 10,
    cursor: null as null | string,
  });

  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  if (!data && !fetching) {
    return <div>Somthing went wrong...</div>;
  }
  return (
    <Layout variant="large">
      <Flex>
        <Heading>miniReddit</Heading>
        <NextLink href="/create-post">
          <Link ml="auto">create post</Link>
        </NextLink>
      </Flex>

      <br />
      {!data ? (
        <div>Loading....</div>
      ) : (
        <Stack spacing={8} direction="column">
          {data?.posts.posts?.map((each, i) => {
            return (
              <Flex key={each._id} p={5} shadow={"md"} borderWidth="1px">
                <Updoots post={each} />
                <Feature
                  title={each.title}
                  name={"posted by " + each.creator.username}
                  desc={each.textSnippet}
                  key={each._id}
                />
              </Flex>
            );
          })}
        </Stack>
      )}
      {data && data.posts.more ? (
        <Flex>
          <Button
            m="auto"
            my={5}
            isLoading={fetching}
            onClick={() =>
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              })
            }
          >
            Load More
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};
export default withUrqlClient(createUrqlClient, { ssr: true })(Index);

export type FeatureProps = {
  title: string;
  desc: string;
  name: string;
};
