const Asset = require('../models/asset.model.js'); // Adjust the path if needed

const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const updateExcelTrace = async (assetData) => {
const filePath = path.join(__dirname, 'traceability.xlsx');
  const headers = ['timestamp', 'person', 'asset_reference', 'action', 'date', 'status', 'site', 'team'];

  let workbook, worksheet;

  if (fs.existsSync(filePath)) {
    workbook = xlsx.readFile(filePath);
    worksheet = workbook.Sheets[workbook.SheetNames[0]];
  } else {
    workbook = xlsx.utils.book_new();
    worksheet = xlsx.utils.aoa_to_sheet([headers]);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Traceability');
  }

  const sheetData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
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
  const updatedSheet = xlsx.utils.aoa_to_sheet(sheetData);
  workbook.Sheets[workbook.SheetNames[0]] = updatedSheet;
  xlsx.writeFile(workbook, filePath);
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