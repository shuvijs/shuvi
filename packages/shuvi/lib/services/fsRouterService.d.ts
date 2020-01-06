import { RouterService } from "@shuvi/core";
export default class RouterServiceImpl implements RouterService.RouterService {
    getRouteConfig(): {
        path: string;
        component: string;
    }[];
}
