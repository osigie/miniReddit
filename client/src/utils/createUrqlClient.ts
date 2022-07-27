import { cacheExchange, DataField, Resolver } from "@urql/exchange-graphcache";
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
} from "../generated/graphql";
import { betterQuery } from "./betterQuery";
import Router from "next/router";
import { pipe, tap } from "wonka";
import { Field } from "formik";

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

export const createUrqlClient = (ssrExchange: any) => ({
  url: "http://localhost:3500/graphql",
  fetchOptions: {
    credentials: "include" as const,
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
});
