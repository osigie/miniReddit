


import { withUrqlClient } from 'next-urql';
import React from 'react'
import { createUrqlClient } from '../../utils/createUrqlClient';

type Props = {}

const Post = (props: Props) => {
  return (
    <div>[id]</div>
  )
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);