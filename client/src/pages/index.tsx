import Navbar from "../components/Navbar";
import { createUrqlClient } from "../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";
import { usePostsQuery } from "../generated/graphql";

const Index = () => {
  const [{ data }] = usePostsQuery();
  return (
    <>
      <Navbar />
      {!data
        ? null
        : data.posts.map((each, i) => <div key={i}>{each.title}</div>)}
      <div>index</div>
    </>
  );
};
export default withUrqlClient(createUrqlClient)(Index);
