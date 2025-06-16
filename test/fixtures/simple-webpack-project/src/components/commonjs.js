var useState = require('react').useState;
exports.default = function Commonjs() {
  const [index, setIndex] = useState(0);
  return (
    <div>
      <div id="support-commonjs">exports.default</div>
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
};
