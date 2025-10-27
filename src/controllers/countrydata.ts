import { Request, Response } from "express";
import { errorResponse, successResponse } from "../helpers/responseHandler";
import { HttpStatusCode } from "axios";
import countriesDataService from "../services/countrydata";
import { Country } from "../models/country";
import { calculateCountryGdp, generateSummaryImage, getTop5GdpCountries } from "../utils/country";
import globalRefreshService from "../services/status";
import Joi from "joi";
import { validateSchema } from "../helpers/validation";
import path from "path";
import fs from "fs";


const countriesDataController = {

    refreshCountriesData: async (req: Request, res: Response) => {
        let refreshedCountries: Country[] = [];

        let successCount = 0;
        let errorCount = 0;
        const errors: string[] = [];

        try {
            //get countries data from ext API
            const countriesExtData = await countriesDataService.getCountriesData();
            if (!countriesExtData) {
                return res
                    .status(HttpStatusCode.ServiceUnavailable)
                    .json(errorResponse({
                        error: "External data source unavailable",
                        details: "Could not fetch data from countries API"
                    }));
            }

            //process each country data
            for (const country of countriesExtData) {
                try {
                    let currency_code: string | null = null;
                    let exchange_rate: number | null = null;
                    let estimated_gdp: number | null = 0;

                    //set currency code and exchange rate
                    if (!country.currencies || country.currencies.length === 0) {
                        // No currencies
                        currency_code = null;
                        exchange_rate = null;
                        estimated_gdp = 0;

                    } else {
                        currency_code = country.currencies[0].code;

                        //get exchange rate for the country
                        const exchangeRateResp = await countriesDataService.getCountryExchangeRate(currency_code);

                        if (!exchangeRateResp) {
                            estimated_gdp = null;
                            exchange_rate = null;
                        } else {
                            //set exchange rate
                            exchange_rate = exchangeRateResp;

                            //calculate estimated gdp for the country
                            estimated_gdp = calculateCountryGdp(country.population, exchange_rate);
                        }
                    }

                    // Create country data for insert/update
                    const countryDataForInsert: Country = {
                        name: country.name,
                        capital: country.capital || null,
                        region: country.region,
                        population: country.population,
                        currency_code: currency_code,
                        exchange_rate: exchange_rate,
                        estimated_gdp: estimated_gdp,
                        flag_url: country.flag,
                        last_refreshed_at: new Date().toISOString(),
                    }

                    //add to countries array
                    refreshedCountries.push(countryDataForInsert);

                    //check if country already exists in database
                    const countryExists = await countriesDataService.checkIfCountryExists(countryDataForInsert.name);
                    if (countryExists) { //update country data
                        await countriesDataService.updateCountryData(countryDataForInsert);
                    } else { //insert country data
                        await countriesDataService.insertCountryData(countryDataForInsert);
                    }

                    successCount++;
                } catch (countryError: any) {
                    errorCount++;
                    errors.push(`Failed to process ${country.name}: ${countryError?.message ?? 'Unknown error'}`);
                    console.error(`Error processing country ${country.name}:`, countryError);

                    // Continue processing other countries
                    continue;
                }
            }

            // Update global refresh timestamp
            try {
                const lastRefreshedAt = await globalRefreshService.getLastRefreshedAt();
                if (!lastRefreshedAt) {
                    await globalRefreshService.createLastRefreshedAt(countriesExtData.length);
                } else {
                    await globalRefreshService.updateLastRefreshedAt(countriesExtData.length);
                }
            } catch (refreshError) {
                console.error('Error updating global refresh timestamp:', refreshError);
                errors.push('Failed to update global refresh timestamp');
            }

            // Generate summary image
            try {
                const generatedImage = await generateSummaryImage({
                    total_countries: countriesExtData.length,
                    top5_gdp_countries: getTop5GdpCountries(refreshedCountries),
                    last_refreshed_at: new Date().toISOString(),
                });

                if (!generatedImage) {
                    throw new Error('Error generating summary image');
                }
            } catch (imageError) {
                console.error('Error generating summary image:', imageError);
                errors.push('Failed to generate summary image');
            }

            console.log('successCount', successCount);
            console.log('errorCount', errorCount);
            console.log('errors', errors);

            //success response
            return res
                .status(HttpStatusCode.Created)
                .json(successResponse({
                    message: "Countries data refreshed successfully"
                }));

        } catch (error) {
            console.error('Critical error in refresh process:', error); //log specific error
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse({ //generic error to client
                error: "Internal server error",
            }));
        }
    },

    getCountries: async (req: Request, res: Response) => {
        try {
            const { region, currency, sort } = req.query;

            // Check for invalid query parameters
            const allowedParams = ['region', 'currency', 'sort'];
            const invalidParams = Object.keys(req.query).filter(param => !allowedParams.includes(param));

            if (invalidParams.length > 0) {
                return res.status(HttpStatusCode.BadRequest).json(errorResponse({
                    error: "Validation failed",
                }));
            }

            const querySchema = Joi.object({
                region: Joi.string().messages({
                    'string.base': 'Invalid data type for "region" (must be string)'
                }
                ).optional(),
                currency: Joi.string().messages({
                    'string.base': 'Invalid data type for "currency" (must be string)'
                }).optional(),
                sort: Joi.string().valid('gdp_desc').messages({
                    'string.base': 'Invalid data type for "sort" (must be "gdp_desc")'
                }).optional(),
            });

            const queryValidationError = await validateSchema(querySchema, { region, currency, sort }); //validate query
            if (queryValidationError) {
                return res.status(HttpStatusCode.BadRequest).json(errorResponse({
                    error: "Validation failed",
                }));
            }

            //build query object
            const query: Record<string, string> = {};
            if (region) query.region = region as string;
            if (currency) query.currency = currency as string;
            if (sort) query.sort = sort as string;

            const countries = await countriesDataService.getCountries(query);

            return res.status(HttpStatusCode.Ok).json(countries);

        } catch (error) {
            console.error('Error getting countries data:', error);
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse({
                error: "Internal server error",
            }));
        }
    },

    getCountryByName: async (req: Request, res: Response) => {
        try {
            const { name } = req.params;

            const country = await countriesDataService.getCountryByName(name);
            if (!country) {
                return res.status(HttpStatusCode.NotFound).json(errorResponse({
                    error: "Country not found"
                }));
            }

            return res.status(HttpStatusCode.Ok).json(country);
        } catch (error) {
            console.error('Error getting country by name:', error);
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse({
                error: "Internal server error",
            }));
        }
    },
    deleteCountryByName: async (req: Request, res: Response) => {
        try {
            const { name } = req.params;

            const country = await countriesDataService.getCountryByName(name);
            if (!country) {
                return res.status(HttpStatusCode.NotFound).json(errorResponse({
                    error: "Country not found"
                }));
            }

            await countriesDataService.deleteCountryByName(name);

            return res.status(HttpStatusCode.Ok).json(successResponse({
                message: "Country deleted successfully"
            }));
        } catch (error) {
            console.error('Error getting country by name:', error);
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse({
                error: "Internal server error",
            }));
        }
    },

    getCountriesSummaryImage: async (req: Request, res: Response) => {
        try {
            const imagePath = path.join(process.cwd(), 'cache', 'summary.png');

            // if image does not exist
            if (!fs.existsSync(imagePath)) {
                return res.status(HttpStatusCode.NotFound).json(errorResponse({
                    error: "Summary image not found"
                }));
            }

            // send image file
            return res.sendFile(imagePath);

        } catch (error) {
            console.error('Error getting countries summary image:', error);
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse({
                error: "Internal server error",
            }));
        }
    }
}

export default countriesDataController;