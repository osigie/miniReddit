import { useRouter } from "next/router";
import { usePostQuery } from "../generated/graphql";
import { useGetId } from "./useGetId";

export const useGetQueryFromUrl = () => {
const intId= useGetId()
  return usePostQuery({
    pause: intId === -1,
    variables: { postId: intId },
  });
};
