export interface CountryGraphql {
    code:       string;
    name:       string;
    continent:  Continent;
    capital:    string;
    languages:  Language[];
    currencies: string[];
    states:     Language[];
}

export interface Country extends CountryGraphql {
    flags:Flags,
    webformatURL:string;
}

export interface Continent {
    code: string;
    name: string;
}

export interface Language {
    name: string;
}
export interface Flags {
    alt:string;
    png:string;
    svg:string;
}

