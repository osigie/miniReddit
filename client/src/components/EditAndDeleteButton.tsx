import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { IconButton } from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";

type Props = {
  id: number;
  creatorId: number;
};

export const EditAndDeleteButton = ({ id, creatorId }: Props) => {
  const [{ data }] = useMeQuery();
  const [, deletePost] = useDeletePostMutation();
  if (data?.me?._id !== creatorId) {
    return null;
  }

  return (
    <>
      <IconButton
        aria-label="delete post"
        ml="auto"
        icon={<DeleteIcon />}
        colorScheme="red"
        onClick={() => {
          deletePost({ deletePostId: Number(id) });
        }}
      ></IconButton>
      <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
        <IconButton
          aria-label="edit post"
          icon={<EditIcon />}
          ml="10px"
        ></IconButton>
      </NextLink>
    </>
  );
};
