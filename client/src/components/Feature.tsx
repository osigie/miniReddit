import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Box, Heading, Link, Text, IconButton, Flex } from "@chakra-ui/react";
import NextLink from "next/link";
import { useDeletePostMutation } from "../generated/graphql";
export type FeatureProps = {
  title: string;
  desc: string;
  name: string;
  id: number;
};

export function Feature({ title, desc, name, id, ...rest }: FeatureProps) {
  const [, deletePost] = useDeletePostMutation();
  return (
    <Box flex={1}>
      <NextLink href="/post/[id]" as={`/post/${id}`}>
        <Link>
          <Heading fontSize="xl">{title}</Heading>
        </Link>
      </NextLink>

      <Text mt={4}>{name}</Text>
      <Flex flex={1}>
        <Text mt={4}>{desc}</Text>

        <IconButton
          aria-label="delete post"
          ml="auto"
          icon={<DeleteIcon />}
          colorScheme="red"
          onClick={() => {
            deletePost({ deletePostId: Number(id) });
          }}
        ></IconButton>
        <IconButton aria-label="edit post" icon={<EditIcon />}></IconButton>
      </Flex>
    </Box>
  );
}
