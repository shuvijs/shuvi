import { RouterService } from "@shuvi/types/core";
export default class RouterServiceImpl implements RouterService {
    getRoutes(): {
        id: string;
        path: string;
        componentFile: string;
    }[];
}
