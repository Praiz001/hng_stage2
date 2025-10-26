import { Country } from "../models/country";
import sharp from 'sharp';
import { createCanvas, loadImage } from 'canvas';


/**
 * Calculate the estimated GDP for country
 * @param population - The population of the country
 * @param exchange_rate - The exchange rate of the country
 * @returns The estimated GDP for the country
 */
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
        const canvas = createCanvas(800, 600);
        const ctx = canvas.getContext('2d');

        // Set background
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, 800, 600);

        // Add border
        ctx.strokeStyle = '#dee2e6';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, 780, 580);

        // Add title
        ctx.fillStyle = '#212529';
        ctx.font = 'bold 32px Arial';
        ctx.fillText('Country Data Summary', 50, 60);

        // Add divider line
        ctx.strokeStyle = '#6c757d';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(50, 80);
        ctx.lineTo(750, 80);
        ctx.stroke();

        let y = 120;

        // Add total countries
        ctx.fillStyle = '#495057';
        ctx.font = 'bold 20px Arial';
        ctx.fillText(`Total Countries: ${data.total_countries}`, 50, y);
        y += 40;

        // Add last refreshed time
        ctx.font = '16px Arial';
        ctx.fillText(`Last Refreshed: ${new Date(data.last_refreshed_at).toLocaleString()}`, 50, y);
        y += 50;

        // Add top 5 GDP countries header
        ctx.fillStyle = '#212529';
        ctx.font = 'bold 18px Arial';
        ctx.fillText('Top 5 GDP Countries:', 50, y);
        y += 30;

        // Add countries list
        ctx.fillStyle = '#495057';
        ctx.font = '16px Arial';
        data.top5_gdp_countries.forEach((country: any, index: number) => {
            const text = `${index + 1}. ${country.name} - $${country.estimated_gdp.toLocaleString()}`;
            ctx.fillText(text, 70, y);
            y += 25;
        });

        // Convert canvas to buffer
        const buffer = canvas.toBuffer('image/png');

        // Use Sharp to optimize the image
        const optimizedBuffer = await sharp(buffer)
            .png({ quality: 90, compressionLevel: 9 })
            .toBuffer();

        // check if cache directory exists
        const fs = require('fs');
        if (!fs.existsSync('cache')) {
            fs.mkdirSync('cache');
        }

        // Save the optimized image
        fs.writeFileSync('cache/summary.png', optimizedBuffer);
        return true;
    } catch (error) {
        console.error('Error generating image:', error);
        return false;
    }
};