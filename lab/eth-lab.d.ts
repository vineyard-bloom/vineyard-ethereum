export interface EthLab {
    getSweepAddress(): string;
    start(): Promise<void>;
    send(address: string, amount): Promise<void>;
    reset(): Promise<any>;
    generate(blockCount: number): Promise<any>;
}
