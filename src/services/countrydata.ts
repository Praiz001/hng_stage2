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
            // console.error('Error getting countries data:', error);
            return null;
        }
    },

    getCountryExchangeRate: async (countryCode: string) => {

        try {
            const url = `https://open.er-api.com/v6/latest/${countryCode}`
            const response = await axios.get(url);

            const exchangeRateData: number | undefined = response.data.rates[countryCode];
            if (!exchangeRateData) {
                return null
            }

            return exchangeRateData;
        } catch (error) {
            // console.error('Error getting country exchange rate:', error);
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

    updateCountryData: async (country: Country) => {
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
                last_refreshed_at: new Date().toISOString(),
            });
            return updatedCountry;
        } catch (error) {
            console.error('Error updating country data');
            throw error;
        }
    },

    insertCountryData: async (country: Country) => {
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
                last_refreshed_at: new Date().toISOString(),
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