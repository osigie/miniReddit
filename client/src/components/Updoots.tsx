import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import { useState } from "react";
import {
  PostSnippetFragment,
  PostsQuery,
  useVoteMutation,
} from "../generated/graphql";

type Props = {
  // posts: PostsQuery["posts"]["posts"][0]
  post: PostSnippetFragment;
};

export const Updoots = (props: Props) => {
  const [loadingState, setLoadingState] = useState<
    "updoot-loading" | "downdoot-loading" | "not-loading"
  >("not-loading");
  const [, vote] = useVoteMutation();
  return (
    <Flex direction="column" justifyContent="center" alignItems="center" mr={4}>
      <IconButton
        onClick={async () => {
          if (props.post.voteStatus === 1) {
            return;
          }
          setLoadingState("updoot-loading");
          await vote({
            postId: props.post._id,
            point: 1,
          });
          setLoadingState("not-loading");
        }}
        aria-label="updoots post"
        icon={<ChevronUpIcon />}
        isLoading={loadingState === "updoot-loading"}
        colorScheme={props.post.voteStatus === 1 ? "green" : undefined}
      />
      {props.post.points}
      <IconButton
        onClick={async () => {
          if (props.post.voteStatus === -1) {
            return;
          }
          setLoadingState("downdoot-loading");
          await vote({
            postId: props.post._id,
            point: -1,
          });
          setLoadingState("not-loading");
        }}
        aria-label="downdoots post"
        icon={<ChevronDownIcon />}
        isLoading={loadingState === "downdoot-loading"}
        colorScheme={props.post.voteStatus === -1 ? "red" : undefined}
      />
    </Flex>
  );
};
