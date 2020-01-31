import { BaseComponent } from "./Base";
interface Props {
    file: string;
}
export default class Bootstrap extends BaseComponent<Props> {
    render(): JSX.Element;
}
export {};
