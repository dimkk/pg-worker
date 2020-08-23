import pg from 'pg'
import { IGetData } from './PGData'

export class PGClient {
    _opts:IGetData = {
        pgClientConfig: {
            user: 'postgres',
            database: 'crunchbase',
            password: 'postgres',
            connectionTimeoutMillis: 300,
            idleTimeoutMillis: 3000
        }  
    }
    _client:pg.Pool
    /**
     * Client spawner
     */
    constructor(opts?:IGetData) {
        Object.assign(this._opts, opts, {})
        this._client = new pg.Pool(this._opts.pgClientConfig)
    }

    getClient = () => {
        return this._client
    }
    
}