export declare class GethServer {
    private status;
    private stdout;
    private stderr;
    private childProcess;
    start(): Promise<void>;
    stop(): Promise<{}> | Promise<void>;
}
