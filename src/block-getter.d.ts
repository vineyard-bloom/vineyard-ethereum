import { BlockInfo, FullBlock } from 'vineyard-blockchain';
export declare function getFullBlock(block: BlockInfo): Promise<FullBlock>;
export declare function getNextFullBlock(block: BlockInfo): Promise<FullBlock>;
