import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type FieldError = {
  __typename?: 'FieldError';
  field: Scalars['String'];
  message: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createPost?: Maybe<Post>;
  deletePost?: Maybe<Scalars['String']>;
  forgotPassword: Scalars['Boolean'];
  login: UserResponse;
  logout: Scalars['Boolean'];
  newPassword: UserResponse;
  register: UserResponse;
  updatePost?: Maybe<Post>;
};


export type MutationCreatePostArgs = {
  input: UserInput;
};


export type MutationDeletePostArgs = {
  id: Scalars['Float'];
};


export type MutationForgotPasswordArgs = {
  email: Scalars['String'];
};


export type MutationLoginArgs = {
  password: Scalars['String'];
  usernameOrEmail: Scalars['String'];
};


export type MutationNewPasswordArgs = {
  newPassword: Scalars['String'];
  token: Scalars['String'];
};


export type MutationRegisterArgs = {
  details: UserDetails;
};


export type MutationUpdatePostArgs = {
  id: Scalars['Float'];
  title: Scalars['String'];
};

export type Post = {
  __typename?: 'Post';
  _id: Scalars['Float'];
  createdAt: Scalars['String'];
  creatorId: Scalars['Float'];
  points: Scalars['Float'];
  text: Scalars['String'];
  title: Scalars['String'];
  updatedAt: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  hello: Scalars['String'];
  me?: Maybe<User>;
  post?: Maybe<Post>;
  posts: Array<Post>;
};


export type QueryPostArgs = {
  id: Scalars['Float'];
};


export type QueryPostsArgs = {
  cursor?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Float']>;
};

export type User = {
  __typename?: 'User';
  _id: Scalars['Float'];
  createdAt: Scalars['String'];
  email: Scalars['String'];
  updatedAt: Scalars['String'];
  username: Scalars['String'];
};

export type UserDetails = {
  email: Scalars['String'];
  password: Scalars['String'];
  username: Scalars['String'];
};

export type UserInput = {
  text: Scalars['String'];
  title: Scalars['String'];
};

export type UserResponse = {
  __typename?: 'UserResponse';
  errors?: Maybe<Array<FieldError>>;
  user?: Maybe<User>;
};

export type NormalUserFragment = { __typename?: 'User', _id: number, username: string };

export type CreatePostMutationVariables = Exact<{
  input: UserInput;
}>;


export type CreatePostMutation = { __typename?: 'Mutation', createPost?: { __typename?: 'Post', _id: number, createdAt: string, updatedAt: string, title: string, creatorId: number, text: string, points: number } | null };

export type ForgotPasswordMutationVariables = Exact<{
  email: Scalars['String'];
}>;


export type ForgotPasswordMutation = { __typename?: 'Mutation', forgotPassword: boolean };

export type LoginMutationVariables = Exact<{
  password: Scalars['String'];
  usernameOrEmail: Scalars['String'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'UserResponse', errors?: Array<{ __typename?: 'FieldError', field: string, message: string }> | null, user?: { __typename?: 'User', _id: number, username: string } | null } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: boolean };

export type NewPasswordMutationVariables = Exact<{
  token: Scalars['String'];
  newPassword: Scalars['String'];
}>;


export type NewPasswordMutation = { __typename?: 'Mutation', newPassword: { __typename?: 'UserResponse', errors?: Array<{ __typename?: 'FieldError', field: string, message: string }> | null, user?: { __typename?: 'User', _id: number, createdAt: string, updatedAt: string, username: string, email: string } | null } };

export type RegisterMutationVariables = Exact<{
  details: UserDetails;
}>;


export type RegisterMutation = { __typename?: 'Mutation', register: { __typename?: 'UserResponse', errors?: Array<{ __typename?: 'FieldError', field: string, message: string }> | null, user?: { __typename?: 'User', _id: number, username: string } | null } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', _id: number, username: string } | null };

export type PostsQueryVariables = Exact<{
  cursor?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Float']>;
}>;


export type PostsQuery = { __typename?: 'Query', posts: Array<{ __typename?: 'Post', _id: number, createdAt: string, updatedAt: string, title: string, creatorId: number, text: string, points: number }> };

export const NormalUserFragmentDoc = gql`
    fragment NormalUser on User {
  _id
  username
}
    `;
export const CreatePostDocument = gql`
    mutation CreatePost($input: UserInput!) {
  createPost(input: $input) {
    _id
    createdAt
    updatedAt
    title
    creatorId
    text
    points
  }
}
    `;

export function useCreatePostMutation() {
  return Urql.useMutation<CreatePostMutation, CreatePostMutationVariables>(CreatePostDocument);
};
export const ForgotPasswordDocument = gql`
    mutation ForgotPassword($email: String!) {
  forgotPassword(email: $email)
}
    `;

export function useForgotPasswordMutation() {
  return Urql.useMutation<ForgotPasswordMutation, ForgotPasswordMutationVariables>(ForgotPasswordDocument);
};
export const LoginDocument = gql`
    mutation Login($password: String!, $usernameOrEmail: String!) {
  login(password: $password, usernameOrEmail: $usernameOrEmail) {
    errors {
      field
      message
    }
    user {
      ...NormalUser
    }
  }
}
    ${NormalUserFragmentDoc}`;

export function useLoginMutation() {
  return Urql.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument);
};
export const LogoutDocument = gql`
    mutation Logout {
  logout
}
    `;

export function useLogoutMutation() {
  return Urql.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument);
};
export const NewPasswordDocument = gql`
    mutation NewPassword($token: String!, $newPassword: String!) {
  newPassword(token: $token, newPassword: $newPassword) {
    errors {
      field
      message
    }
    user {
      _id
      createdAt
      updatedAt
      username
      email
    }
  }
}
    `;

export function useNewPasswordMutation() {
  return Urql.useMutation<NewPasswordMutation, NewPasswordMutationVariables>(NewPasswordDocument);
};
export const RegisterDocument = gql`
    mutation Register($details: UserDetails!) {
  register(details: $details) {
    errors {
      field
      message
    }
    user {
      ...NormalUser
    }
  }
}
    ${NormalUserFragmentDoc}`;

export function useRegisterMutation() {
  return Urql.useMutation<RegisterMutation, RegisterMutationVariables>(RegisterDocument);
};
export const MeDocument = gql`
    query Me {
  me {
    ...NormalUser
  }
}
    ${NormalUserFragmentDoc}`;

export function useMeQuery(options?: Omit<Urql.UseQueryArgs<MeQueryVariables>, 'query'>) {
  return Urql.useQuery<MeQuery>({ query: MeDocument, ...options });
};
export const PostsDocument = gql`
    query Posts($cursor: String, $limit: Float) {
  posts(cursor: $cursor, limit: $limit) {
    _id
    createdAt
    updatedAt
    title
    creatorId
    text
    points
  }
}
    `;

export function usePostsQuery(options?: Omit<Urql.UseQueryArgs<PostsQueryVariables>, 'query'>) {
  return Urql.useQuery<PostsQuery>({ query: PostsDocument, ...options });
};