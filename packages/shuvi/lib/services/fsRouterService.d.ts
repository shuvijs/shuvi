import { RouterService } from "@shuvi/core";
export default class RouterServiceImpl implements RouterService.RouterService {
    getRoutes(): {
        path: string;
        componentFile: string;
    }[];
}
