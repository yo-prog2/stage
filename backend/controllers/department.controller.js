const Department = require("../models/department.model");
const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Site Home Page");
});


exports.department_list = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: department list");
});


exports.department_detail = asyncHandler(async (req, res, next) => {
  res.send(`NOT IMPLEMENTED: department detail: ${req.params.id}`);
});


exports.department_create = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: department create");
});


exports.department_delete = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: department delete");
});


exports.department_update = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: department update");
});
