import shortHash from "short-hash";
import { z } from "zod/v4";
import { makeType } from "any-db"

export const Airport = makeType('Airport', {
    shape: {
        iata: z.string().length(3),
        country: z.string().length(2),
        city: z.string(),
        name: z.string(),
        timezone: z.string(),
    },
    id: ({ iata }) => iata,
})

export const Airline = makeType('Airline', {
    shape: {
        name: z.string()
    },
    id: ({ name }) => name,
})

export const Flight = makeType('Flight', {
    shape: {
        flightNumber: z.string(),
        airline: Airline.schema,
        from: Airport.schema,
        to: Airport.schema,
        departure: z.string(),
        arrival: z.string(),
    },
    id: ({ flightNumber, date, from, to }) => `${flightNumber}-${date}-${from.iata}-${to.iata}`
})

export const Bundle = makeType('Bundle', {
    shape: {
        items: z.array(Flight.schema)
    },
    id: ({ items }) => shortHash(items.flat().map((i: any) => i.id).join(',')),
})

export const Deal = makeType('Deal', {
    shape: {
        price: z.number(),
        dealer: z.string(),
        source: z.string(),
        target: z.union([Flight.schema, Bundle.schema]),
        link: z.string(),
        date: z.iso.date(),
    },
    id: ({ target, price, dealer, source }) => `${target.type}-${target.id}-${price}-${dealer}-${source}`
})