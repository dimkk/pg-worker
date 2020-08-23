import {PGClient} from './PGClient'
import { Pool, QueryResult, PoolConfig } from 'pg'
import logger from '../utils/logger'

export class PGData {
    _client:Pool
    _params:IGetData
    /**
     *
     */
    constructor(params?:IGetData) {
        this._params = params || {}
        this._client = new PGClient(params).getClient()
    }

    getTable = async (tableName?:string):Promise<QueryResult> => {
        let client = await this._client.connect()
        
        // try {
            
        // } catch(err) {
        //     logger.log('error', `error connecting to PG ${err}`)
        // }
        const table = tableName || this._params.tableName || 'industry'
        if (!table) logger.log('error', `cannot find ${table} or tableName wasn't provided`)
        const simpleQuery = `SELECT * FROM public.${table} ORDER BY id ASC `
        let res = await this._client.query(simpleQuery)
        // try {
            
        // } catch(err) {
        //     logger.log('error', `error getting data for this query '${simpleQuery}', error- ${err}`)
        // }
        client.release(true)
        return res
    }

    getTableRandom = async (tableName?:string, randomLimit?:number):Promise<QueryResult> => {
        let client = await this._client.connect()
        const table = tableName || this._params.tableName || 'industry'
        randomLimit = randomLimit || 680
        if (!table) logger.log('error', `cannot find ${table} or tableName wasn't provided`)
        const randomItems = `SELECT id, "Name", "Key" FROM public.${table} order BY RANDOM() LIMIT ${randomLimit} ;`
        let res = await this._client.query(randomItems)
        client.release(true)
        return res
    }
}


export interface IGetData {
    pgClientConfig?: PoolConfig,
    tableName?:string,
    query?:string
}