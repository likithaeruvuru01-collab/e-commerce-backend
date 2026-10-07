const express = require("express");

const mutualFundController = require("../controllers/mutualfundcontroller");

const router = express.Router();

router.get("/search", mutualFundController.searchMutualFunds);
router.get("/stored", mutualFundController.getStoredMutualFunds);
router.get("/stored/:schemeCode", mutualFundController.getStoredMutualFundBySchemeCode);
router.get("/:schemeCode/latest", mutualFundController.getLatestNav);
router.get("/:schemeCode/history", mutualFundController.getNavHistory);
router.get("/:schemeCode", mutualFundController.getAndStoreMutualFundDetails);

module.exports = router;