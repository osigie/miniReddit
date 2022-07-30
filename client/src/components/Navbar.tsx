import React, { useEffect, useState } from "react";
import { Box, Button, Flex, Heading, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import {useRouter} from "next/router"
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
type Props = {};

export default function Navbar({}: Props) {
  const router = useRouter(); 
  const [shouldFetch, setShouldFetch] = useState(true);
  const [{ fetching: isFetching }, logout] = useLogoutMutation();
  const [{ fetching, data }] = useMeQuery({
    pause: shouldFetch,
  });
  useEffect(() => setShouldFetch(false), []);
  let body = null;
  if (fetching) {
    //body should be null
  } else if (!data?.me) {
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
          <Button as={Link} mr={2}>
            create post
          </Button>
        </NextLink>
        <Box mr={2}>{data.me.username}</Box>
        <Button
          onClick={async () => {
            await logout();
            router.reload()
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
    <Flex p={5} bg="tan" position="sticky" top={0} zIndex={1} align="center">
      <Flex align="center" maxW={800} margin="auto" flex = {1}>
        <NextLink href="/">
          <Link mr={2}>
            <Heading>miniReddit</Heading>
          </Link>
        </NextLink>
        <Box ml={"auto"}>{body}</Box>
      </Flex>
    </Flex>
  );
}
