import { RouterService } from "@shuvi/types/core";
export default class RouterServiceImpl implements RouterService {
    getRoutes(): {
        path: string;
        componentFile: string;
    }[];
}
