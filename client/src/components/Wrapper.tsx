import React from "react";
import { Box } from "@chakra-ui/react";

export type WrapperVariant = "small" | "large" 

type Props = {
  variant: WrapperVariant
  children: React.ReactNode;
};

export default function Wrapper({ children, variant }: Props) {
  return (
    <Box
      mt={8}
      maxW={variant === "large" ? "800px" : "400px"}
      w="100%"
      mx="auto"
    >
      {children}
    </Box>
  );
}
