import { Router } from "express";
import { countriesDataController, statusController } from "../controllers";

const router = Router();

router.post("/countries/refresh", countriesDataController.refreshCountriesData);
router.get("/countries", countriesDataController.getCountries);
router.get("/countries/image", countriesDataController.getCountriesSummaryImage);
router.get("/countries/:name", countriesDataController.getCountryByName);
router.delete("/countries/:name", countriesDataController.deleteCountryByName);
router.get("/status", statusController.getGlobalRefreshStatus);

export default router;