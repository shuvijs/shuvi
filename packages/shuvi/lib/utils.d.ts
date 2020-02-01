export declare function acceptsHtml(header: any, { htmlAcceptHeaders }?: {
    htmlAcceptHeaders?: string[];
}): boolean;
export declare function dedupe<T extends Record<string, any>, K extends keyof T>(bundles: T[], prop: K): any[];
