const express = require("express");

const department_controller = require("../controllers/department.controller");

const router = express.Router();


router.post("/create", department_controller.department_create);

router.delete("/:id/delete", department_controller.department_delete);

router.post("/:id/update", department_controller.department_update);

router.get("/:id", department_controller.department_detail);

router.get("/", department_controller.department_list);

module.exports = router;
