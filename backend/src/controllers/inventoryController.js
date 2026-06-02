const inventoryService = require('../services/inventoryService');

async function getData(req, res, next) {
  try {
    res.json(await inventoryService.getData());
  } catch (error) {
    next(error);
  }
}

async function handleAction(req, res, next) {
  const { action } = req.body;

  try {
    if (action === 'addBarang') return res.json(await inventoryService.addBarang(req.body));
    if (action === 'updateBarang') return res.json(await inventoryService.updateBarang(req.body));
    if (action === 'deleteBarang') return res.json(await inventoryService.deleteBarang(req.body.idBarang));
    if (action === 'addLog') return res.json(await inventoryService.addLog(req.body));

    return res.status(400).json({ success: false, error: `Unknown action: ${action}` });
  } catch (error) {
    next(error);
  }
}

module.exports = { getData, handleAction };
