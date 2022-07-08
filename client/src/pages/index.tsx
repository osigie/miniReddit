import Navbar from "../components/Navbar";
import { createUrqlClient } from "../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";
import { usePostsQuery } from "../generated/graphql";

const Index = () => {
  const [{ data }] = usePostsQuery();
  return (
    <>
    
      <Navbar />
      {!data ? (
        <div>Loading....</div>
      ) : (
        data.posts.map((each, i) => {
          return <div key={i}>{each.title}</div>;
        })
      )}
    </>
  );
};
export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
