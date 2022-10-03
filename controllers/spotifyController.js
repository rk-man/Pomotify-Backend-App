const axios = require("axios");
const catchAsync = require("express-async-handler");
const appError = require("./../utils/appError");
const qs = require("qs");
const SpotifyWebApi = require("spotify-web-api-node");

//request authorization
exports.requestAccessToken = catchAsync(async (req, res, next) => {
    const { code } = req.body;
    console.log(`CODE :: ${code}`);

    const spotifyApi = new SpotifyWebApi({
        redirectUri: process.env.REDIRECT_URI,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
    });

    spotifyApi
        .authorizationCodeGrant(code)
        .then((data) => {
            res.status(200).json({
                accessToken: data.body.access_token,
                refreshToken: data.body.refresh_token,
                expiresIn: data.body.expires_in,
            });
        })
        .catch((err) => {
            return res.status(400).json({
                status: "fail",
                err,
            });
        });
});

exports.refreshToken = catchAsync(async (req, res, next) => {
    const refreshToken = req.body.refreshToken;

    const spotifyApi = new SpotifyWebApi({
        redirectUri: process.env.REDIRECT_URI,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: refreshToken,
    });

    spotifyApi
        .refreshAccessToken()
        .then((data) => {
            console.log("The access token has been refreshed!");
            console.log(data.body);

            return res.status(200).json({
                accessToken: data.body.access_token,
                refreshToken: data.body.refresh_token,
                expiresIn: data.body.expires_in,
            });
        })
        .catch((err) => {
            return res.status(400).json({
                status: "fail",
                err,
            });
        });
});
