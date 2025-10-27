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

        try {
            //get countries data from ext API
            const countriesExtData = await countriesDataService.getCountriesData();
            if (!countriesExtData) {
                return res
                    .status(HttpStatusCode.ServiceUnavailable)
                    .json(errorResponse({
                        error: "External data source unavailable",
                        details: `Could not fetch data from countries API`
                    }));
            }

            //get exchange rate data from ext API
            const exchangeRateResp = await countriesDataService.getCountryExchangeRate();
            if (!exchangeRateResp) {
                return res
                    .status(HttpStatusCode.ServiceUnavailable)
                    .json(errorResponse({
                        error: "External data source unavailable",
                        details: `Could not fetch data from exchange rate API`
                    }));
            }


            //process each country data
            const processedCountries = [];
            for (const country of countriesExtData) {

                //get country data
                const countryName = country.name || 'country';
                const currencies = country.currencies || [];
                const population = country.population || 0;
                const region = country.region || null;
                const capital = country.capital || null;
                const flag_url = country.flag || null;
                const refreshedAt = new Date().toISOString()

                // derived country data
                let currencyCode: string | null = null;
                let exchangeRate: number | null = null;
                let estimatedGdp: number | null = null;

                if (currencies.length > 0) {
                    currencyCode = currencies[0].code;

                    // check if currency exist in exchange rates
                    if (exchangeRateResp[currencyCode]) {
                        exchangeRate = exchangeRateResp[currencyCode];
                        //calc estimated gdp for the country
                        estimatedGdp = calculateCountryGdp(population, exchangeRate);
                    } else { // currency not found in exchange rates
                        exchangeRate = null;
                        estimatedGdp = null;
                    }
                }

                //country record to insert
                const countryRecord: Country = {
                    name: countryName,
                    currency_code: currencyCode,
                    exchange_rate: exchangeRate,
                    population,
                    region,
                    capital,
                    estimated_gdp: estimatedGdp,
                    flag_url,
                    last_refreshed_at: refreshedAt
                };

                //store processed
                processedCountries.push(countryRecord);

                //insert/update country record
                const countryExists = await countriesDataService.checkIfCountryExists(countryRecord.name);
                if (countryExists) {
                    await countriesDataService.updateCountryRecord(countryRecord);
                } else {
                    await countriesDataService.insertCountryRecord(countryRecord);
                }
            }

            // Update global refresh timestamp
            try {
                const lastRefreshedAt = await globalRefreshService.getLastRefreshedAt();
                const currentTimestamp = new Date().toISOString();
                let updatedTimestamp;
                if (!lastRefreshedAt) {
                    await globalRefreshService.createLastRefreshedAt({
                        total_countries: processedCountries.length,
                        last_refreshed_at: currentTimestamp
                    });
                    updatedTimestamp = await globalRefreshService.getLastRefreshedAt();
                } else {
                    await globalRefreshService.updateLastRefreshedAt({
                        total_countries: processedCountries.length,
                        last_refreshed_at: currentTimestamp
                    });
                    updatedTimestamp = await globalRefreshService.getLastRefreshedAt();
                }

                // Generate summary image
                if (updatedTimestamp) {
                    try {
                        const generatedImage = await generateSummaryImage({
                            total_countries: processedCountries.length,
                            top5_gdp_countries: getTop5GdpCountries(processedCountries),
                            last_refreshed_at: updatedTimestamp.last_refreshed_at,
                        });

                        if (!generatedImage) {
                            throw new Error('Failed to generate image');
                        }
                    } catch (imageError) {
                        console.error('Error generating summary image:', imageError);
                    }
                }
            } catch (refreshError) {
                console.error('Error updating global refresh timestamp:', refreshError);
            }

            //success response
            return res
                .status(HttpStatusCode.Created)
                .json(successResponse({
                    message: "Countries data refreshed successfully"
                }));

        } catch (error) {
            console.error('Critical error in refresh process:', error);
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse({
                error: "Internal server error",
            }));
        }
    },

    getCountries: async (req: Request, res: Response) => {
        console.log(new Date().toISOString());
        console.log(new Date().toLocaleString());
        console.log(new Date().toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
        try {
            const { region, currency, sort } = req.query;

            // validate query params
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