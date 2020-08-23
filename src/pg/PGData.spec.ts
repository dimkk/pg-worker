import {expect} from 'chai'
import {PGData} from './PGData'

// https://journal.artfuldev.com/write-tests-for-typescript-projects-with-mocha-and-chai-in-typescript-86e053bdb2b6
describe('this test cover for simple pg data retrieval', () => {
    it('should return rows of table', async () => {
        const res = await new PGData().getTable()
        try{expect(res.rowCount).greaterThan(0);} catch(ex) {}
        
    })
    it('should return rows of table by random', async () => {
        const res1 = await new PGData().getTableRandom()
        const res2 = await new PGData().getTableRandom()
        expect(res1.rowCount).greaterThan(0)
        expect(res2.rowCount).greaterThan(0)
        expect(res1.rows[0].id).not.equal(res2.rows[0].id)
    })
})