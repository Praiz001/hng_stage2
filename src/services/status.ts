import { Repository } from "../db/repository";
import { Refresh } from "../models/refresh";



const globalRefreshRepository = new Repository<Refresh>("refreshes");

const statusService = {
    getLastRefreshedAt: async () => {
        const last_refreshed_at = await globalRefreshRepository.findOneWhere({ name: 'global_refresh' })
        return last_refreshed_at ?? null
    },

    createLastRefreshedAt: async (total_countries: number) => {
        const createdLastRefreshedAt = await globalRefreshRepository.insert({
            name: 'global_refresh',
            total_countries: total_countries,
            last_refreshed_at: new Date().toISOString(),
        });
        return createdLastRefreshedAt ?? null;
    },

    updateLastRefreshedAt: async (total_countries: number) => {
        const updatedLastRefreshedAt = await globalRefreshRepository.updateDataWhere({ name: 'global_refresh' }, {
            total_countries: total_countries,
            last_refreshed_at: new Date().toISOString(),
        });
        return updatedLastRefreshedAt ?? null;
    }
};

export default statusService;