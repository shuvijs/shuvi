import { BaseComponent } from "./Base";
interface Props {
    src: string;
}
export default class Bootstrap extends BaseComponent<Props> {
    render(): JSX.Element;
}
export {};
