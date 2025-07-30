const Asset = require("../models/asset.model");
const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Site Home Page");
});


exports.asset_list = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: asset list");
});


exports.asset_detail = asyncHandler(async (req, res, next) => {
  res.send(`NOT IMPLEMENTED: asset detail: ${req.params.id}`);
});


exports.asset_create = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: asset create");
});


exports.asset_delete = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: asset delete");
});


exports.asset_update = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: asset update");
});
