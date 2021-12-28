import { ExtractRematchDispatcherFromReducer } from './rematch/types';
export type State = any;

export type StateCollection = Record<string, State>;

export type Effect<
  S extends State,
  R extends Reducers<S>,
  RM extends ModelCollection,
  Payload = any
> = (
  payload: Payload,
  state: S,
  dispatch: DispatcherOfReducers<S, R>,
  rootState: StateOfModelCollection<RM>,
  rootDispatch: any
) => any;

export type Effects<S, R extends Reducers<S>, RM extends ModelCollection> = {
  [x: string]: Effect<S, R, RM>;
};

export type Reducer<S extends State, Payload = any> = (
  state: S,
  payload: Payload
) => S;

export type Reducers<S> = {
  [x: string]: Reducer<S>;
};

export type StateOfModelCollection<RM> = RM extends ModelCollection
  ? {
      [K in keyof RM]: RM[K]['state'];
    }
  : RM;

export type View<S extends State, RM extends ModelCollection> = (
  state: S,
  rootState: StateOfModelCollection<RM>,
  views: {},
  args: any
) => unknown;

export type Views<S extends State, RM extends ModelCollection> = {
  [key: string]: View<S, RM>;
};

/**
 * @template S State
 * @template RM RootModel
 */
export type Model<
  S,
  RM extends ModelCollection,
  R extends Reducers<S>,
  E extends Effects<S, R, RM>,
  V extends Views<S, RM>
> = {
  name: string;
  state: S;
  reducers?: R;
  effects?: E;
  views?: V;
};

export type ModelCollection = Record<
  string,
  InternalModel<any, any, any, any, any>
>;

export type InternalModel<
  S,
  RM extends ModelCollection,
  R extends Reducers<S>,
  E extends Effects<S, R, RM>,
  V extends Views<S, RM>
> = Model<S, RM, R, E, V> & {
  _rootModels: RM;
  _beDepends: Set<string>;
};

export type DispatcherOfReducers<S, T> = T extends Reducers<any>
  ? {
      [K in keyof T]: ExtractRematchDispatcherFromReducer<S, T[K]>;
    }
  : never;

export type DispatcherOfReducer<T> = T extends (
  s: infer S,
  p: infer P
) => infer R
  ? (payload?: P) => R
  : T;

export type IUseModel = <
  S,
  RM extends ModelCollection,
  R extends Reducers<S>,
  E extends Effects<S, R, RM>,
  V extends Views<S, RM>
>(
  model: InternalModel<S, RM, R, E, V>
) => [S, DispatcherOfReducers<S, R>];

export type InternalModelArray = Array<InternalModel<any, any, any, any, any>>;

export const testUse: IUseModel = <
  S,
  RM extends ModelCollection,
  R extends Reducers<S>,
  E extends Effects<S, R, RM>,
  V extends Views<S, RM>
>(
  model: InternalModel<S, RM, R, E, V>
) => {
  return [] as any as [S, DispatcherOfReducers<S, R>];
};

export const defineModel = <
  S,
  R extends Reducers<S>,
  E extends Effects<S, R, RM>,
  RM extends ModelCollection = {},
  V extends Views<S, RM> = {}
>(
  modelOptions: Model<S, RM, R, E, V>,
  depends?: RM
) => {
  // collection _beDepends, a depends b, when b update, call a need update
  if (depends) {
    let dependModels = [];
    if (Array.isArray(depends)) {
      dependModels = depends;
    } else {
      dependModels = Object.values(depends);
    }
    const modelName = modelOptions.name;
    dependModels.forEach(dependModel => {
      if (!dependModel._beDepends) {
        dependModel._beDepends = new Set([modelName]);
      } else {
        dependModel._beDepends.add(modelName);
      }
    });
  }
  const finalModel = {
    ...modelOptions,
    _rootModels: depends
  } as InternalModel<S, RM, R, E, V>;
  if (!finalModel._beDepends) {
    finalModel._beDepends = new Set();
  }
  const { effects } = finalModel;
  if (finalModel.effects) {
    for (const effectName in effects) {
      const effectFunction = effects[effectName];
      // @ts-ignore
      finalModel.effects[effectName] = (
        payload,
        { state, dispatch, rootState, rootDispatch }
      ) => {
        return effectFunction(
          payload,
          state,
          dispatch,
          rootState,
          rootDispatch
        );
      };
    }
  }
  return finalModel;
};

export const getDependentModels = (model: any): any => {
  const rootModels = model._rootModels;
  return rootModels
    ? Object.values(rootModels).reduce(
        (acc, model) => Object.assign(acc, getDependentModels(model)),
        rootModels
      )
    : {};
};
