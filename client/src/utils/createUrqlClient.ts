import {
  cacheExchange,
  DataField,
  Resolver,
  Cache,
} from "@urql/exchange-graphcache";
import { gql } from "@urql/core";
import {
  dedupExchange,
  Exchange,
  fetchExchange,
  stringifyVariables,
} from "urql";
import {
  LoginMutation,
  MeQuery,
  MeDocument,
  RegisterMutation,
  LogoutMutation,
  VoteMutationVariables,
  DeletePostMutationVariables,
} from "../generated/graphql";
import { betterQuery } from "./betterQuery";
import Router from "next/router";
import { pipe, tap } from "wonka";
import { Field } from "formik";
import { createBox } from "framer-motion";

//errorExchange is a function from wonka that takes in a urql
//error and returns a new error with a better message
const errorExchange: Exchange =
  ({ forward }) =>
  (ops$) => {
    return pipe(
      forward(ops$),
      tap(({ error }) => {
        if (error?.message.includes("not authenticated")) {
          Router.replace("/");
        }
      })
    );
  };

export const simplePagination = (): Resolver<any, any, any> => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }
    ///handle when to load more

    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isLoading = cache.resolve(entityKey, fieldKey);

    info.partial = !isLoading;
    let result;
    fieldInfos.forEach((info) => {
      const data = cache.resolve(entityKey, info.fieldName, info.arguments);
      result = data;
    });
    return result;
  };
};

const isServerSide = typeof window === "undefined";

const invalidateAllPost = (cache: Cache) => {
  const allFields = cache.inspectFields("Query");
  const fieldInfos = allFields.filter((field) => {
    return field.fieldName === "posts";
  });

  fieldInfos.forEach((field) => {
    cache.invalidate("Query", field.fieldName, field.arguments || {});
  });
};

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
  let cookie;
  if (isServerSide) {
    cookie = ctx.req.headers.cookie;
  }
  return {
    url: "http://localhost:3500/graphql",
    fetchOptions: {
      credentials: "include" as const,
      headers: cookie ? { cookie } : undefined,
    },
    exchanges: [
      dedupExchange,
      cacheExchange({
        keys: {
          PaginatedPosts: () => null,
        },
        resolvers: {
          Query: {
            posts: simplePagination(),
          },
        },
        updates: {
          Mutation: {
            deletePost: (_result, args, cache, info) => {
              cache.invalidate({
                __typename: "Post",
                id: (args as any).id,
              });
            },
            vote: (_result, args, cache, info) => {
              const { point, postId } = args as VoteMutationVariables;
              const data = cache.readFragment(
                gql`
                  fragment _ on Post {
                    _id
                    points
                    voteStatus
                  }
                `,
                { _id: postId }
              ); // Data or null
              if (data) {
                if (data.voteStatus === point) {
                  return;
                }
                const newPointValue =
                  data.points + (!data.points ? 1 : 2) * point;

                cache.writeFragment(
                  gql`
                    fragment _ on Post {
                      points
                      voteStatus
                    }
                  `,
                  { _id: postId, points: newPointValue, voteStatus: point }
                );
              }
            },
            createPost: (_result, args, cache, info) => {
              invalidateAllPost(cache);
            },

            login: (_result, args, cache, info) => {
              betterQuery<LoginMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.login.errors) {
                    return query;
                  } else if (result.login.user) {
                    return {
                      me: result.login.user,
                    };
                  }
                }
              );
              invalidateAllPost(cache);
            },
            register: (_result, args, cache, info) => {
              betterQuery<RegisterMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.register.errors) {
                    return query;
                  } else if (result.register.user) {
                    return {
                      me: result.register.user,
                    };
                  }
                }
              );
            },
            logout: (_result, args, cache, info) => {
              betterQuery<LogoutMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                () => {
                  return { me: null };
                }
              );
            },
          },
        },
      }),
      errorExchange,
      ssrExchange,
      fetchExchange,
    ],
  };
};
