export default function ExportOther() {
  return <div>ExportOther</div>;
}

const other = function () {
  console.log('other-symbol');
};

export { other };
