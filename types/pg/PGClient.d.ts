import pg from 'pg';
import { IGetData } from './PGData';
export declare class PGClient {
    _opts: IGetData;
    _client: pg.Pool;
    /**
     * Client spawner
     */
    constructor(opts?: IGetData);
    getClient: () => pg.Pool;
}
