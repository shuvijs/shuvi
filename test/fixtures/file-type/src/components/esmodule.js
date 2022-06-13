import { useState } from 'react';

export default function esmodule() {
  const [index, setIndex] = useState(0);
  return (
    <div>
      <div id="support-esmodule">export default</div>
      <div id="index">Index Number:{index}</div>
      <button
        onClick={() => {
          setIndex(index + 1);
        }}
      >
        plus one
      </button>
    </div>
  );
}
