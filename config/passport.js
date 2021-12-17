const passport = require('passport');
const User = require('../models/User');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// load  user model


// used to serialize the user for the session
passport.serializeUser(function(user, done){
    done(null, user.id);
    
})
 // used to deserialize the user
passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
        done(err, user);
    })
})



passport.use(new GoogleStrategy({
    clientID:     '1030080015854-ausalqfs5llg00mlqeuqbkemrduse8ii.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: "http://localhost:5000/auth/google/callback",
    passReqToCallback   : true
  },
function(request, accessToken, refreshToken, profile, done) {

    User.findOne({
            'email': profile.emails[0].value, 
        }, function(err, user) {
        if (err) {
            return done(err);
        }
        //No user was found... so create a new user with values from Facebook (all the profile. stuff)
        if (!user) {
            // let regexEmail = "^[a-zA-Z0-9_.+-]+@(?:(?:[a-zA-Z0-9-]+\.)?[a-zA-Z]+\.)?(student.tdtu.edu)\.vn$";

            let email = profile.emails[0].value;
            // if (email.match(regexEmail)) {
                console.log(1)
                user = new User({
                    username: profile.displayName,
                    email: profile.emails[0].value,
                    avatar: profile.photos[0].value,
                    role: 0,
                });
                user.save(function(err) {
                    if (err) console.log(err);
                    return done(err, user);
                });

            // } else {
                // return done(null,false,{message:'Must use student email domain'})
            // }
            
        } else {
            //found user. Return
            return done(err, user);
        }
    });
}
));