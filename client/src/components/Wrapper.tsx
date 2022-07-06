import React from "react";
import { Box } from "@chakra-ui/react";

type Props = {
  variant: "small" | "large";
};

export default function Wrapper({ children, varaint }) {
  return (
    <Box
      mt={8}
      maxW={varaint === "large" ? "800px" : "400px"}
      w="100%"
      mx="auto"
    >
      {children}
    </Box>
  );
}
