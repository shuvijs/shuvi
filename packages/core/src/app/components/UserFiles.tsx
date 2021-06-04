import React from 'react';
import { observer } from 'mobx-react';
import FileNode from './files/FileNode';
import { useSelector } from '../models/store';

function UserFiles() {
  const files = useSelector(state => state.extraFiles);
  return (
    <>
      {files.map(file => (
        <FileNode key={file.name} file={file} />
      ))}
    </>
  );
}

export default observer(UserFiles);
