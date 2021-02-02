import React from 'react';
import { observer } from 'mobx-react';
import { File } from '@shuvi/react-fs';
import { useSelector } from '../models/store';

function Index() {
  const content = useSelector(state => state.entryFileContent);
  return <File name="entry.js" content={content} />;
}

export default observer(Index);
