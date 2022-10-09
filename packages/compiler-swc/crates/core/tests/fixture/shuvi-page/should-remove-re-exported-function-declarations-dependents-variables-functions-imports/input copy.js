import drop_me from "bla";
import { drop_me2 } from "foo";

var var1 = 1;
let var2 = 2;

function inception1() {
  var2;
  drop_me2;
}

const bla = () => {
  inception1;
};

function loader() {
  bla();
  return { props: { var1 } };
}

export { loader };

export default function Test() {
  return <div />;
}
