import { Box, Heading, Text } from "@chakra-ui/react";
import { FeatureProps } from "../pages/index";

export function Feature({ title, desc,name, ...rest }: FeatureProps) {
  return (
    <Box >
      <Heading fontSize="xl">{title}</Heading>
      <Text mt={4}>{name}</Text>
      <Text mt={4}>{desc}</Text>
    </Box>
  );
}
