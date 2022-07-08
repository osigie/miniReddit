import React from "react";
import Navbar from "./Navbar";
import Wrapper, { WrapperVariant } from "./Wrapper";

type Props = {
  children: React.ReactNode;
  variant: WrapperVariant;
};
export default function Layout({ children, variant }: Props) {
  return (
    <>
      <Navbar />
      <Wrapper variant={variant}>{children}</Wrapper>
    </>
  );
}
