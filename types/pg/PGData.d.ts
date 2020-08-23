import { Pool, QueryResult, PoolConfig } from 'pg';
export declare class PGData {
    _client: Pool;
    _params: IGetData;
    /**
     *
     */
    constructor(params?: IGetData);
    getTable: (tableName?: string | undefined) => Promise<QueryResult>;
    getTableRandom: (tableName?: string | undefined, randomLimit?: number | undefined) => Promise<QueryResult>;
}
export interface IGetData {
    pgClientConfig?: PoolConfig;
    tableName?: string;
    query?: string;
}
