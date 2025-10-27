import axios from "axios";
import { ICountry } from "../types/countrydata";
import { Repository } from "../db/repository";
import { Country } from "../models/country";


const countryRepository = new Repository<Country>("countries");

const countriesDataService = {
    getCountriesData: async () => {
        try {
            const url = "https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies"
            const response = await axios.get(url);

            const countriesData: ICountry[] = response.data;
            if (!countriesData || countriesData.length === 0) {
                return null;
            }

            return countriesData;
        } catch (error) {
            console.error('Countries API error:', error);
            return null;
        }
    },

    getCountryExchangeRate: async () => {

        try {
            const url = `https://open.er-api.com/v6/latest/USD`
            const response = await axios.get(url);

            const exchangeRateData: Record<string, number> = response.data.rates;

            return exchangeRateData;
        } catch (error) {
            console.error('Exchange rate API error:', error);
            return null;
        }
    },

    checkIfCountryExists: async (name: string) => {
        try {
            const countryExists = await countryRepository.findOneWhere({ name });
            return countryExists ?? false;
        } catch (error) {
            console.error('Error checking if country exists');
            throw error;
        }
    },

    updateCountryRecord: async (country: Country) => {
        try {
            const updatedCountry = await countryRepository.updateDataWhere({ name: country.name }, {
                name: country.name,
                capital: country.capital,
                region: country.region,
                population: country.population,
                currency_code: country.currency_code,
                exchange_rate: country.exchange_rate,
                estimated_gdp: country.estimated_gdp,
                flag_url: country.flag_url,
                last_refreshed_at: country.last_refreshed_at,
            });
            return updatedCountry;
        } catch (error) {
            console.error('Error updating country data');
            throw error;
        }
    },

    insertCountryRecord: async (country: Country) => {
        try {
            const insertedCountry = await countryRepository.insert({
                name: country.name,
                capital: country.capital,
                region: country.region,
                population: country.population,
                currency_code: country.currency_code,
                exchange_rate: country.exchange_rate,
                estimated_gdp: country.estimated_gdp,
                flag_url: country.flag_url,
                last_refreshed_at: country.last_refreshed_at,
            });

            return insertedCountry;
        } catch (error) {
            console.error('Error inserting country data');
            throw error;
        }
    },
    getCountries: async (query?: Record<string, string>) => {
        try {
            let dbQuery = countryRepository.buildQuery().select('*');

            // Apply region filter
            if (query?.region) {
                dbQuery = dbQuery.where('region', query.region);
            }

            // Apply currency filter
            if (query?.currency) {
                dbQuery = dbQuery.where('currency_code', query.currency);
            }

            // Apply sorting
            if (query?.sort === 'gdp_desc') {
                dbQuery = dbQuery.orderBy('estimated_gdp', 'desc');
            }

            const countries = await dbQuery;
            return countries;
        } catch (error) {
            console.error('Error getting countries data');
            throw error;
        }
    },
    getCountryByName: async (name: string) => {
        try {
            const country = await countryRepository.findOneWhere({ name });
            return country ?? null;
        } catch (error) {
            console.error('Error getting country by name');
            throw error;
        }
    },
    deleteCountryByName: async (name: string) => {
        try {
            const deletedCountryId = await countryRepository.delete({ name });
            return deletedCountryId ?? null;
        } catch (error) {
            console.error('Error deleting country by name');
            throw error;
        }
    },
}


export default countriesDataService;