const MutualFund = require("../model/mutualfund");

const MFAPI_BASE_URL = "https://api.mfapi.in";

const searchMutualFunds = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        status: false,
        message: "Search keyword q is required"
      });
    }

    const response = await fetch(
      `${MFAPI_BASE_URL}/mf/search?q=${encodeURIComponent(q)}`
    );

    if (!response.ok) {
      return res.status(response.status).json({
        status: false,
        message: "Failed to fetch mutual funds from MFAPI"
      });
    }

    const data = await response.json();

    return res.status(200).json({
      status: true,
      message: "Mutual funds fetched successfully",
      data
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Error while calling MFAPI",
      error: error.message
    });
  }
};

const getAndStoreMutualFundDetails = async (req, res) => {
  try {
    const { schemeCode } = req.params;

    if (!schemeCode || isNaN(schemeCode)) {
      return res.status(400).json({
        status: false,
        message: "Valid scheme code is required"
      });
    }

    const response = await fetch(`${MFAPI_BASE_URL}/mf/${schemeCode}`);

    if (!response.ok) {
      return res.status(response.status).json({
        status: false,
        message: "Failed to fetch mutual fund details from MFAPI"
      });
    }

    const data = await response.json();

    if (!data || !data.meta) {
      return res.status(404).json({
        status: false,
        message: "Mutual fund details not found"
      });
    }

    const meta = data.meta;
    const latestNavEntry = data.data && data.data.length > 0 ? data.data[0] : null;

    const mutualFund = await MutualFund.findOneAndUpdate(
      { schemeCode: Number(schemeCode) },
      {
        schemeCode: Number(schemeCode),
        schemeName: meta.scheme_name,
        fundHouse: meta.fund_house,
        schemeType: meta.scheme_type,
        schemeCategory: meta.scheme_category,
        isinGrowth: meta.isin_growth,
        isinDivReinvestment: meta.isin_div_reinvestment,
        latestNav: latestNavEntry ? Number(latestNavEntry.nav) : null,
        latestNavDate: latestNavEntry ? latestNavEntry.date : ""
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    return res.status(200).json({
      status: true,
      message: "Mutual fund details fetched and stored successfully",
      data: mutualFund
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Error while fetching or storing mutual fund details",
      error: error.message
    });
  }
};

const getLatestNav = async (req, res) => {
  try {
    const { schemeCode } = req.params;

    if (!schemeCode || isNaN(schemeCode)) {
      return res.status(400).json({
        status: false,
        message: "Valid scheme code is required"
      });
    }

    const response = await fetch(`${MFAPI_BASE_URL}/mf/${schemeCode}/latest`);

    if (!response.ok) {
      return res.status(response.status).json({
        status: false,
        message: "Failed to fetch latest NAV from MFAPI"
      });
    }

    const data = await response.json();
    const latestNav = data.data && data.data.length > 0 ? data.data[0] : null;

    if (!latestNav) {
      return res.status(404).json({
        status: false,
        message: "Latest NAV not found"
      });
    }

    await MutualFund.findOneAndUpdate(
      { schemeCode: Number(schemeCode) },
      {
        latestNav: Number(latestNav.nav),
        latestNavDate: latestNav.date
      },
      { upsert: true }
    );

    return res.status(200).json({
      status: true,
      message: "Latest NAV fetched successfully",
      data: latestNav
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Error while fetching latest NAV",
      error: error.message
    });
  }
};

const getNavHistory = async (req, res) => {
  try {
    const { schemeCode } = req.params;

    if (!schemeCode || isNaN(schemeCode)) {
      return res.status(400).json({
        status: false,
        message: "Valid scheme code is required"
      });
    }

    const response = await fetch(`${MFAPI_BASE_URL}/mf/${schemeCode}`);

    if (!response.ok) {
      return res.status(response.status).json({
        status: false,
        message: "Failed to fetch NAV history from MFAPI"
      });
    }

    const data = await response.json();

    return res.status(200).json({
      status: true,
      message: "NAV history fetched successfully",
      data
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Error while fetching NAV history",
      error: error.message
    });
  }
};

const getStoredMutualFunds = async (req, res) => {
  try {
    const mutualFunds = await MutualFund.find().sort({ createdAt: -1 });

    return res.status(200).json({
      status: true,
      message: "Stored mutual funds fetched successfully",
      data: mutualFunds
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
};

const getStoredMutualFundBySchemeCode = async (req, res) => {
  try {
    const { schemeCode } = req.params;

    const mutualFund = await MutualFund.findOne({
      schemeCode: Number(schemeCode)
    });

    if (!mutualFund) {
      return res.status(404).json({
        status: false,
        message: "Mutual fund not found in database"
      });
    }

    return res.status(200).json({
      status: true,
      message: "Stored mutual fund fetched successfully",
      data: mutualFund
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
};

module.exports = {
  searchMutualFunds,
  getAndStoreMutualFundDetails,
  getLatestNav,
  getNavHistory,
  getStoredMutualFunds,
  getStoredMutualFundBySchemeCode
};