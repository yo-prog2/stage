const express = require("express");

// Require controller modules.
const asset_controller = require("../controllers/asset.controller");

const router = express.Router();


router.post("/create", asset_controller.asset_create);

router.delete("/:id/delete", asset_controller.asset_delete);

router.post("/:id/update", asset_controller.asset_update);

router.get("/:id", asset_controller.asset_detail);

router.get("/", asset_controller.asset_list);

module.exports = router;

