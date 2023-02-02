import {DidEventName, isEvent} from '../../src/model/Erc1056Event'

describe('Enum model', function () {
    describe('Event name', () => {
        it('Convert ', function () {
            console.log(DidEventName.DidDelegateChanged)
            let name1 = 'DidDelegateChanged'
            let name2 = DidEventName[DidEventName.DidDelegateChanged]
            expect(name2).toBe(name1)
            expect(name1 in DidEventName).toBeTruthy()
            const events = [DidEventName.DidDelegateChanged, DidEventName.DidAttributeChanged]
            expect(isEvent('DIDDelegateChanged', events)).toBeTruthy()
            expect(isEvent('DidDelegateChange', events)).toBeFalsy()
        })
    })
})