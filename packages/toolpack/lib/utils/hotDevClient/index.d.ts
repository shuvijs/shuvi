export default function connect(options: any): {
    subscribeToHmrEvent(handler: any): void;
    reportRuntimeError(err: any): void;
    prepareError(err: any): Error;
};
