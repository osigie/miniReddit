import { Box, Heading, Link, Text } from "@chakra-ui/react";
import NextLink from "next/link";
export type FeatureProps = {
  title: string;
  desc: string;
  name: string;
  id: number;
};

export function Feature({ title, desc, name, id, ...rest }: FeatureProps) {
  return (
    <Box>
      <NextLink href="/post/[id]" as={`/post/${id}`}>
        <Link>
          <Heading fontSize="xl">{title}</Heading>
        </Link>
      </NextLink>

      <Text mt={4}>{name}</Text>
      <Text mt={4}>{desc}</Text>
    </Box>
  );
}
