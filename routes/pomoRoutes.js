const router = require("express").Router({ mergeParams: true });
const pomoController = require("./../controllers/pomoController");
const authController = require("./../controllers/authController");
const adminController = require("./../controllers/adminController");

router.use(authController.protect);

router
    .route("/")
    .post(pomoController.createPomo)
    .get(pomoController.getUserPomos);

router
    .route("/:pomoSlug")
    .get(pomoController.checkIfUserCreatedPomo, pomoController.getOneUserPomo)
    .patch(
        pomoController.checkIfUserCreatedPomo,
        pomoController.updateOneUserPomo
    )
    .delete(
        pomoController.checkIfUserCreatedPomo,
        pomoController.deleteOneUserPomo
    );

//admin routes
router.use(authController.restrict("admin"));
router.route("/admin").get(adminController.getAllPomos);

module.exports = router;
