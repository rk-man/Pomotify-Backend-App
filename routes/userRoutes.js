const router = require("express").Router();

const authController = require("./../controllers/authController");
const userController = require("./../controllers/userController");

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.use(authController.protect);
router.get("/me", userController.getMe);
router.get(
    "/:userSlug",
    userController.checkIfLoggedInAndRequestingUserAreSame,
    userController.getSingleUser
);

router.patch(
    "/:userSlug/upload-profile-image",
    userController.uploadImageCloudinary,
    userController.updateUserProfileImage
);

router.patch("/update-account", userController.updateUserAcccount);

router.patch("/update-password", userController.updateUserPassword);

module.exports = router;
