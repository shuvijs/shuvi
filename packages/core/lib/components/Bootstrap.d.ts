import { BaseComponent } from "./Base";
interface Props {
    module: string;
}
export default class Bootstrap extends BaseComponent<Props> {
    render(): JSX.Element;
}
export {};
