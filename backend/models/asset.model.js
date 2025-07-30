const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AssetSchema = new Schema({
  asset_reference: { type: String, required: true, unique: true }, // e.g., "ABC1234567"
  person: { type: String, required: true },                        // e.g., "James NEUTRON"
  action: { type: String, required: true },                        // e.g., "return"
  date: { type: Date, required: true },                            // e.g., "2025-05-16"
  status: { type: String, required: true },                        // e.g., "intercontrat"
  site: { type: String },                                          // e.g., "CDS-GRDF"
  team: { type: String }                                           // e.g., "BB"
});

module.exports = mongoose.model("Asset", AssetSchema);