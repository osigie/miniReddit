import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Box, Heading, Link, Text, IconButton, Flex } from "@chakra-ui/react";
import NextLink from "next/link";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";
import { EditAndDeleteButton } from "./EditAndDeleteButton";
export type FeatureProps = {
  title: string;
  desc: string;
  name: string;
  id: number;
  creatorId: number;
};

export function Feature({
  title,
  desc,
  name,
  id,
  creatorId,
  ...rest
}: FeatureProps) {
  const [, deletePost] = useDeletePostMutation();
  const [{ data }] = useMeQuery();
  return (
    <Box flex={1}>
      <NextLink href="/post/[id]" as={`/post/${id}`}>
        <Link>
          <Heading fontSize="xl">{title}</Heading>
        </Link>
      </NextLink>

      <Text mt={4}>{name}</Text>
      <Flex flex={1}>
        <Text mt={4} mr="5px">
          {desc}
        </Text>
        {/* {data?.me?._id === creatorId && (
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
        )} */}

        <EditAndDeleteButton id={id} creatorId={creatorId} />
      </Flex>
    </Box>
  );
}
