import ReactFS, { BuiltInElements } from "./reconciler";
declare global {
    namespace JSX {
        interface IntrinsicElements extends BuiltInElements {
        }
    }
}
export default ReactFS;
