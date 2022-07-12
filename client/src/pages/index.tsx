import Navbar from "../components/Navbar";
import { createUrqlClient } from "../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";
import { usePostsQuery } from "../generated/graphql";
import Layout from "../components/Layout";

const Index = () => {
  const [{ data }] = usePostsQuery();
  console.log(data)
  return (
    <Layout variant = "large">
      {!data ? (
        <div>Loading....</div>
      ) : (
        data.posts.map((each, i) => {
          return <div key={i}>{each.title}</div>;
        })
      )}
    </Layout>
  );
};
export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
