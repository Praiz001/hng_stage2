import { Repository } from "../db/repository";
import { Refresh } from "../models/refresh";



const globalRefreshRepository = new Repository<Refresh>("refreshes");

const statusService = {
    getLastRefreshedAt: async () => {
        const last_refreshed_at = await globalRefreshRepository.findOneWhere({ name: 'global_refresh' })
        return last_refreshed_at ?? null
    },

    createLastRefreshedAt: async (data: { total_countries: number, last_refreshed_at: string }) => {
        const createdLastRefreshedAt = await globalRefreshRepository.insert({
            name: 'global_refresh',
            total_countries: data.total_countries,
            last_refreshed_at: data.last_refreshed_at,
        });
        return createdLastRefreshedAt ?? null;
    },

    updateLastRefreshedAt: async (data: { total_countries: number, last_refreshed_at: string }) => {
        const updatedLastRefreshedAt = await globalRefreshRepository.updateDataWhere({ name: 'global_refresh'}, {
            total_countries: data.total_countries,
            last_refreshed_at: data.last_refreshed_at,
            name: 'global_refresh',
        });
        return updatedLastRefreshedAt ?? null;
    }
};

export default statusService;