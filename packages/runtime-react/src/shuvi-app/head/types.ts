import { Runtime } from '@shuvi/types';

export type SideEffectProps = {
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

export type HeadState = Runtime.IHtmlTag[];

export type HeadItem = Runtime.IHtmlTag;
