const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

function extractProfile(profile) {
    let imageUrl ='';
    if (profile.photos && profile.photos.length) {
    imageUrl = profile.photos[0].value;
    }
    return {
    id: profile.id,
    displayName: profile.displayName,
    image: imageUrl,
    };
}
