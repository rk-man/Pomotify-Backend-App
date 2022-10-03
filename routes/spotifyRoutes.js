const router = require("express").Router();
const spotifyController = require("./../controllers/spotifyController");
const authController = require("./../controllers/authController");
router.use(authController.protect);

router.post("/request-access-token", spotifyController.requestAccessToken);

router.post("/refresh-token", spotifyController.refreshToken);

module.exports = router;
