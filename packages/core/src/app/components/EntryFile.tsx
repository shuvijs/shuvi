import React from 'react';
import { observer } from 'mobx-react';
import { File } from '@shuvi/react-fs';
import { useSelector } from '../models/store';

function Index() {
  const content = useSelector(state => state.entryFile);
  return <File name="entry.js" content={`import('${content}');`} />;
}

export default observer(Index);
