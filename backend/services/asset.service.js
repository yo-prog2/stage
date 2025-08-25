const Asset = require('../models/asset.model.js');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const os = require('os');

const updateExcelTrace = async (assetData) => {
  // Example path: C:\Users\<User>\AppData\Roaming\MyApp\logs
  const baseDir = path.join(os.homedir(), 'AppData', 'Roaming', 'AssetManagement', 'logs');

  // Ensure directory exists
  fs.mkdirSync(baseDir, { recursive: true });

  const oldFilePath = path.join(baseDir, 'asset_logs.xlsx');
  const headers = ['timestamp', 'person', 'asset_reference', 'action', 'date', 'status', 'site', 'team'];

  let workbook, worksheet, sheetData;

  if (fs.existsSync(oldFilePath)) {
    workbook = xlsx.readFile(oldFilePath);
    worksheet = workbook.Sheets[workbook.SheetNames[0]];
    sheetData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  } else {
    sheetData = [headers];
  }

  const newRow = [
    new Date().toISOString(),
    assetData.person || '',
    assetData.asset_reference || '',
    assetData.action || '',
    assetData.date || '',
    assetData.status || '',
    assetData.site || '',
    assetData.team || ''
  ];
  sheetData.push(newRow);

  const newWorkbook = xlsx.utils.book_new();
  const newWorksheet = xlsx.utils.aoa_to_sheet(sheetData);
  xlsx.utils.book_append_sheet(newWorkbook, newWorksheet, 'asset_log');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const newFilePath = path.join(baseDir, `asset_log_${timestamp}.xlsx`);
  xlsx.writeFile(newWorkbook, newFilePath);

  fs.copyFileSync(newFilePath, oldFilePath);
};



const updateOrCreateAsset = async (assetData) => {
  try {
    await Asset.updateOne(
      { asset_reference: assetData.asset_reference }, // match by unique asset ID
      { $set: assetData },              // update with new data
      { upsert: true }                  // insert if not found
    );
    console.log("Asset updated or created successfully.");
  } catch (error) {
    console.error("Failed to update/create asset:", error);
    throw error;
  }
};


const deleteAsset = async (reference) => {
  try {
    const deleted = await Asset.findOneAndDelete({ reference });
    if (!deleted) throw new Error('Asset not found');
    return deleted;
  } catch (error) {
    throw new Error(`Failed to delete asset: ${error.message}`);
  }
};

const getAssetByReference = async (reference) => {
  try {
    const asset = await Asset.findOne({ reference });
    if (!asset) throw new Error('Asset not found');
    return asset;
  } catch (error) {
    throw new Error(`Failed to get asset: ${error.message}`);
  }
};
module.exports = {
  updateOrCreateAsset,
  updateExcelTrace,
  deleteAsset,
  getAssetByReference
};