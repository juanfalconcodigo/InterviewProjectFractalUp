export interface IContinent {
    code: ContinentType;
    name: string;
    urlImg: string
}

export type ContinentType =
    | 'AF'
    | 'AN'
    | 'AS'
    | 'EU'
    | 'NA'
    | 'OC'
    | 'SA';