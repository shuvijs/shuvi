import { RouterService } from "@shuvi/types/core";
export default class RouterServiceImpl implements RouterService {
    getRoutes(): {
        id: string;
        path: string;
        exact: boolean;
        componentFile: string;
    }[];
}
