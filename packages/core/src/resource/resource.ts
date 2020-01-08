export type ResourceId = number;

export type ResourceBuiltInType = "file";

export type ResourceBuiltInTypeProps = {
  file: {
    name: string;
    content: string;
  };
};

export type ResourceType<P = {}> = Resource<P> | ResourceBuiltInType;

export type ResourceElement<P = {}> = {
  type: ResourceType<P>;
  props: P;
};

export type ResourceNode<P = {}> =
  | ResourceElement<P>
  | string
  | null
  | undefined;

let uid = 0;
export abstract class Resource<Props = {}> {
  id: ResourceId = ++uid;

  props: Props;

  constructor(props: Props) {
    this.props = props;
  }

  abstract build(): ResourceNode | ResourceNode[];
}

type Children<Props> = Props extends { children: infer C } ? C : never;

type GetPropsFromType<T> = T extends ResourceBuiltInType
  ? ResourceBuiltInTypeProps[ResourceBuiltInType]
  : T extends Resource<infer P>
  ? P
  : {};

export function createElement<T extends ResourceType>(
  type: T,
  config: GetPropsFromType<T> | null,
  children?: Children<GetPropsFromType<T>>
): ResourceElement {
  const props = {} as GetPropsFromType<T>;
  if (config !== null) {
    Object.assign(props, config);
  }

  if (children) {
    (props as any).children = children;
  }

  return { type: type as any, props };
}
