import { Box, Heading, Stack, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import Layout from "../components/Layout";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  const limit = 10
  const [{ data }] = usePostsQuery({variables: {limit, cursor: null}})
  return (
    <Layout variant="large">
      {!data ? (
        <div>Loading....</div>
      ) : (
        <Stack spacing={8} direction="column">
          {data.posts.map((each, i) => {
            return (
              <Feature title={each.title} desc={each.text} key={each._id} />
            );
          })}
        </Stack>
      )}
    </Layout>
  );
};
export default withUrqlClient(createUrqlClient, { ssr: true })(Index);

type FeatureProps = {
  title: string;
  desc: string;
};
function Feature({ title, desc, ...rest }: FeatureProps) {
  return (
    <Box p={5} shadow="md" borderWidth="1px" {...rest}>
      <Heading fontSize="xl">{title}</Heading>
      <Text mt={4}>{desc}</Text>
    </Box>
  );
}
