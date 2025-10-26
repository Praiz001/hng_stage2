export interface Country {
    id?: string;
    name: string;
    capital: string | null;
    region: string,
    population: number,
    currency_code: string | null,
    exchange_rate: number | null,
    estimated_gdp: number | null,
    flag_url: string,
    last_refreshed_at: string
}