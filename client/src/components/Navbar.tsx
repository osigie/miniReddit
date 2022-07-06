import React from "react";
import { Box, Button, Flex, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
type Props = {};

export default function Navbar({}: Props) {
  const [{ fetching: isFetching }, logout] = useLogoutMutation();
  const [{ fetching, data }] = useMeQuery();
  let body = null;
  if (fetching) {
    //body should be null
  } else if (!data.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link mr={2}>Login</Link>
        </NextLink>

        <NextLink href="/register">
          <Link>Register</Link>
        </NextLink>
      </>
    );
  } else {
    body = (
      <Flex align="center">
        <NextLink href="/create-post">
          <Link mr={2}>Create Post</Link>
        </NextLink>
        <NextLink href="/profile">
          <Link mr={2}>Profile</Link>
        </NextLink>
        <Box mr={2}>{data.me.username}</Box>
        <Button
          onClick={() => {
            logout();
          }}
          isLoading={isFetching}
          variant={"link"}
        >
          Logout
        </Button>
      </Flex>
    );
  }
  return (
    <Flex p={5} bg="blue">
      <Box ml={"auto"}>{body}</Box>
    </Flex>
  );
}
