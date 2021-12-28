import { Plugin, Models } from '../rematch'

const effectsPlugin = <
  TModels extends Models<TModels>,
  TExtraModels extends Models<TModels>
>(): Plugin<TModels, TExtraModels> => ({
  onModel(model, rematch) {
    const { effects } = model
    const effectNames = Object.keys(effects || {})
    const { dispatch } = rematch
    if (dispatch) {
      for (const modelName in dispatch) {
        const modelDispatch = dispatch[modelName]
        for (const name of effectNames) {
          const dispatcher = modelDispatch[name]
          rematch.dispatch[modelName][name] = (payload: any) => {
            const params = {
              state: rematch.getState()[modelName],
              rootState: rematch.getState(),
              dispatch: rematch.dispatch[modelName],
              rootDispatch: rematch.dispatch
            }
            return dispatcher(payload, params)
          }
        }
      }
    }
    return model
  },
})

export default effectsPlugin
