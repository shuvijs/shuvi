/// <reference types="react" />
import { IHtmlTag } from '@shuvi/platform-shared/shared';
export declare type SideEffectProps = {
  reduceComponentsToState: <T>(
    components: Array<React.ReactElement<any>>,
    props: T
  ) => HeadState;
  handleStateChange?: (state: HeadState) => void;
};
export interface HeadElement {
  type: string;
  props: {
    [name: string]: any;
    children?: string | string[];
  };
}
export declare type HeadState = IHtmlTag[];
export declare type HeadItem = IHtmlTag;
