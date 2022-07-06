import Navbar from "../components/Navbar";
import { createUrqlClient } from "../utils/urqlClient";
import { withUrqlClient } from "next-urql";
import { usePostsQuery } from "../generated/graphql";



const Index = () => (
  <>
    <Navbar />
    <div>index</div>
  </>
);
export default withUrqlClient(createUrqlClient)(Index);
