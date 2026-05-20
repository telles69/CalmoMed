const express = require('express');
const occupancyReportController = require('../controllers/occupancyReportController');
const router = express.Router();

router.get('/occupancy-reports', occupancyReportController.get);
router.get('/occupancy-reports/stats', occupancyReportController.getOccupancyStats);
router.get('/occupancy-reports/general-stats', occupancyReportController.getGeneralStats);
router.get('/occupancy-reports/posto/:postoId', occupancyReportController.getByPosto);
router.post('/occupancy-reports', occupancyReportController.create);
router.patch('/occupancy-reports/:id', occupancyReportController.update);
router.delete('/occupancy-reports/:id', occupancyReportController.destroy);

module.exports = router;
