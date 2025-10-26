import { Request, Response } from "express";
import { errorResponse, successResponse } from "../helpers/responseHandler";
import { HttpStatusCode } from "axios";
import { statusService } from "../services";


const statusController = {
    getGlobalRefreshStatus: async (req: Request, res: Response) => {
        try {
            const status = await statusService.getLastRefreshedAt();
            if (!status) {
                return res.status(HttpStatusCode.NotFound).json(errorResponse({
                    error: "Status not found",
                }));
            }

            return res.status(HttpStatusCode.Ok).json(successResponse({
                total_countries: status.total_countries,
                last_refreshed_at: status.last_refreshed_at,
            }));
        } catch (error) {
            console.error('Error getting global refresh status:', error);
            return res.status(HttpStatusCode.InternalServerError).json(errorResponse({
                error: "Internal server error",
            }));
        }
    }
}

export default statusController;