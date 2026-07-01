const aiService = require("../services/aiService");

exports.health = async (req, res) => {

    try {

        const data = await aiService.healthCheck();

        res.json(data);

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

};

exports.detect = async (req, res) => {

    try {

        const data = await aiService.testDetect();

        res.json(data);

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

};