import { Country } from "../models/country";
import sharp from 'sharp';
import path from "path";
import fs from 'fs';


export const calculateCountryGdp = (population: number, exchange_rate: number) => {
    const randomValue = Math.floor(Math.random() * 1001) + 1000;
    return population * randomValue / exchange_rate;
}

export const getTop5GdpCountries = (countries: Country[]) => {
    const top5GdpCountries = countries.sort((a, b) => (b.estimated_gdp || 0) - (a.estimated_gdp || 0)).slice(0, 5);
    return top5GdpCountries;
}

// generate summary image
export const generateSummaryImage = async (data: { total_countries: number, last_refreshed_at: string, top5_gdp_countries: Country[] }) => {
    try {

        const svg = `
            <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
                <!-- Background -->
                <rect width="800" height="600" fill="#f8f9fa"/>
                
                <!-- Border -->
                <rect x="10" y="10" width="780" height="580" fill="none" stroke="#dee2e6" stroke-width="2"/>
                
                <!-- Title -->
                <text x="50" y="60" font-family="Arial" font-size="32" font-weight="bold" fill="#212529">Country Data Summary</text>
                
                <!-- Divider line -->
                <line x1="50" y1="80" x2="750" y2="80" stroke="#6c757d" stroke-width="1"/>
                
                <!-- Total Countries -->
                <text x="50" y="120" font-family="Arial" font-size="20" font-weight="bold" fill="#495057">Total Countries: ${data.total_countries}</text>
                
                <!-- Last Refreshed -->
                <text x="50" y="160" font-family="Arial" font-size="16" fill="#495057">Last Refreshed: ${new Date(data.last_refreshed_at).toLocaleString()}</text>
                
                <!-- Top 5 GDP Header -->
                <text x="50" y="210" font-family="Arial" font-size="18" font-weight="bold" fill="#212529">Top 5 GDP Countries:</text>
                
                <!-- Top 5 Countries List -->
                ${data.top5_gdp_countries.map((country: Country, index: number) =>
            `<text x="70" y="${240 + index * 25}" font-family="Arial" font-size="16" fill="#495057">
                    ${index + 1}. ${country.name} - $${country.estimated_gdp?.toLocaleString() ?? '0.00'}</text>`
        ).join('')}
            </svg>
        `;

        // Convert SVG to PNG using Sharp
        const buffer = await sharp(Buffer.from(svg))
            .png()
            .toBuffer();

        // check if cache directory exists
        const cacheDir = path.join(process.cwd(), 'cache');
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
        }

        // Save the image
        fs.writeFileSync(path.join(cacheDir, 'summary.png'), buffer);
        return true;

    } catch (error) {
        console.error('Error generating image:', error);
        return false;
    }
};