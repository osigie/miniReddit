import { Stack } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import Layout from "../components/Layout";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { Feature } from "../components/Feature";

const Index = () => {
  const limit = 10;
  const [{ data }] = usePostsQuery({ variables: { limit, cursor: null } });
  return (
    <Layout variant="large">
      {!data ? (
        <div>Loading....</div>
      ) : (
        <Stack spacing={8} direction="column">
          {data.posts.map((each, i) => {
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
    </Layout>
  );
};
export default withUrqlClient(createUrqlClient, { ssr: true })(Index);

export type FeatureProps = {
  title: string;
  desc: string;
};
