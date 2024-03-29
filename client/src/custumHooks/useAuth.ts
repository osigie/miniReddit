import { useRouter } from "next/router";
import { useEffect } from "react";
import { useMeQuery } from "../generated/graphql";

export const useAuth = () => {
  const [{ fetching, data }] = useMeQuery();
  const router = useRouter();
  useEffect(() => {
    if (!fetching && !data?.me) {
      router.replace("/login?next=" + router.pathname);
    }
  }, [data, router, fetching]);
};
