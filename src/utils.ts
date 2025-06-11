import { isNode } from "any-db"

export function getKey(obj: Record<string, any>): string {
    if ('key' in obj) return obj.key
    if (isNode(obj)) return `${obj.type}:${obj.id}`
    throw 'cannot get key'
}

export type Store<Type> = {
    put: (create: Type & { key?: string }, update?: (item: Type & { key?: string }) => void) => void,
    list: () => (Type & { key?: string })[]
}
export function store<Type extends {}>(...initialItems: ((Type & { key?: string }) | (Type & { key?: string })[])[]): Store<Type> {
    const memo: Record<string, any> = {}
    initialItems.flat().forEach(it => memo[getKey(it)] = it)
    function put(create: Type & { key?: string }, update?: (item: Type & { key?: string }) => void) {
        if (getKey(create) in memo && update) {
            update(memo[getKey(create)])
        } else {
            memo[getKey(create)] = create
        }
    }
    function list() {
        return Object.values(memo) as (Type & { key: string })[]
    }
    return { put, list }
}

export function hextime(date?: number) {
    if (date === undefined) return Date.now().toString(36);
    return date.toString(36);
};

export function setDeep(path: string[], value: any, obj: Record<string, any>) {
    if (path[0] === undefined) throw 'path must contain at least 1 string'
    if (path.length > 1) {
        if (!(path[0] in obj)) obj[path[0]] = {}
        setDeep(path.slice(1), value, obj[path[0]])
    } else {
        obj[path[0]] = value
    }
}

export function getDeep(path: string[], obj: Record<string, any>) {
    if (path[0] === undefined) return obj
    if (!(path[0] in obj)) return undefined
    return getDeep(path.slice(1), obj[path[0]])
}

export function flatObject(obj: any, checkContinue: (obj: Record<string, any>) => boolean, path: string[] = []): any[] {
    if (typeof obj === 'object' && obj !== null && checkContinue(obj)) {
        return Object.entries(obj).flatMap(([k, v]) => flatObject(v, checkContinue, [...path, k]))
    }
    return [{ path, value: obj }]
}
