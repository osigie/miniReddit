import { Button, Flex, Stack } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import Layout from "../components/Layout";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { Feature } from "../components/Feature";

const Index = () => {
  const limit = 10;
  const [{ data, fetching }] = usePostsQuery({
    variables: { limit, cursor: null },
  });

  if (!data && !fetching) {
    return <div>Somthing went wrong...</div>;
  }
  return (
    <Layout variant="large">
      {!data ? (
        <div>Loading....</div>
      ) : (
        <Stack spacing={8} direction="column">
          {data.posts.posts.map((each, i) => {
            return (
              <Feature
                title={each.title}
                desc={each.textSnippet}
                key={each._id}
              />
            );
          })}
        </Stack>
      )}
      {data && !data.posts.more ? (
        <Flex>
          <Button m="auto" my={5} isLoading={fetching}>
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
};
