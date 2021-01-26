import React from 'react';
import { observer } from 'mobx-react';
import { File } from '@shuvi/react-fs';
import { useSelector } from '../models/store';

function Index() {
  const content = useSelector(state => state.bootstrapContent);
  return <File name="bootstrap.js" content={content} />;
}

export default observer(Index);
