import { Box, Heading, Text } from "@chakra-ui/react";
import { FeatureProps } from "../pages/index";

export function Feature({ title, desc, ...rest }: FeatureProps) {
  return (
    <Box p={5} shadow="md" borderWidth="1px" {...rest}>
      <Heading fontSize="xl">{title}</Heading>
      <Text mt={4}>{desc}</Text>
    </Box>
  );
}
