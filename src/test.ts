import { db, isNode, Type } from "any-db"
import { flatObject, getDeep, getKey, setDeep, Store, store } from "./utils"
import { inspect } from "util"
import { Airline, Airport, Deal, Flight } from "."

const localDB: Record<string, any> = {}
const serverDB: Record<string, any> = {}

const myDB = db({
    server: {
        set: (path, value) => {
            setDeep(path, value, serverDB)
        },
        list: (...path) => ({
            done: true,
            chunk: flatObject(getDeep(path, serverDB), (obj) => !isNode(obj))
        })
    },
    local: {
        set: (path, value) => {
            setDeep(path, value, localDB)
        },
        list: (...path) => ({
            done: true,
            chunk: flatObject(getDeep(path, localDB), (obj) => !isNode(obj))
        }),
        clear: () => { Object.keys(localDB).forEach(k => delete localDB[k]) },
    },
    onNode: (n) => {
        if (Deal.isType(n)) {
            offers.put({
                key: getKey(n.target),
                flights: store(Flight.isType(n.target) ? n.target : n.target.items),
                deals: store(n)
            },
                (offer) => { offer.deals.put(n) }
            )
        }
    }
})

const crawlDB = db({
    server: {
        set: (path, value) => {
            setDeep(path, value, serverDB)
        },
    },
})

export const offers = store<{ flights: Store<Type<typeof Flight.schema>>, deals: Store<Type<typeof Deal.schema>> }>()

const BER = Airport({ iata: 'BER' })
const SLP = Airport({ iata: 'SLP' })
const WAK = Airport({ iata: 'WAK' })

const AIRBERLIN = Airline({ name: 'AirBerlin' })

const flight1 = Flight({ flightNumber: 'BV1234', airline: AIRBERLIN, from: BER, to: SLP, date: '2025-02-04' })
const flight2 = Flight({ flightNumber: 'AB5678', airline: AIRBERLIN, from: SLP, to: BER, date: '2025-02-05' })

    ; (async () => {
        await myDB.push(flight1)
        await crawlDB.push(flight2)
        await crawlDB.push(WAK)
        await myDB.push(WAK)
        await myDB.pull()
        console.log('local: \n\n', inspect(localDB, { colors: true, depth: null }), '\n\n\nserver: \n\n', inspect(serverDB, { colors: true, depth: null }))
    })()
