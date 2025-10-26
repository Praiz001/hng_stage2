export interface ICountry {
    name: string;
    capital: string;
    region: string,
    population: number,
    currencies: { //not sure yet
        code: string;
        name: string;
        symbol: string;
    }[],
    flag: string,
    independent: boolean
}
export interface ICountryInsert {
    name: string;
    capital: string;
    region: string,
    population: number,
    currency_code: string,
    flag_url: string,
    last_refreshed_at: string
}