import { IUserRouteConfig } from '@shuvi/service'

let routes: IUserRouteConfig[] = []

export const setRoutes = (newRoutes: IUserRouteConfig[]) => {
  routes = newRoutes
}

export const getRoutes = () => routes
