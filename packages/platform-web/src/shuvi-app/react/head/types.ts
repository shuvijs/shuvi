import { IHtmlTag } from '@shuvi/platform-shared/esm/runtime';

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

export type HeadState = IHtmlTag[];

export type HeadItem = IHtmlTag;
