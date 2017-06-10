
var passport = require("passport");  
var passportJWT = require("passport-jwt");  
var users = require("./users.js");  
var cfg = require("../config.js");  
var ExtractJwt = passportJWT.ExtractJwt;  
var Strategy = passportJWT.Strategy;  
var params = {  
    secretOrKey: cfg.JWT.jwtSecret,
    jwtFromRequest: ExtractJwt.fromAuthHeader()
};

module.exports = function() {  
    var strategy = new Strategy(params, function(payload, done) {
        var user = users[payload.id] || null;
        if (user) {
            return done(null, {
                id: user.id
            });
        } else {
            return done(new Error("User not found"), null);
        }
    });
    passport.use(strategy);
    return {
        initialize: function() {
            return passport.initialize();
        },
        authenticate: function() {
            return passport.authenticate("jwt", cfg.jwtSession);
        }
    };
};

// module.exports.authenticate = function(req, res) {
//     var user = {
//         username: "test",
//         firstName: "firstNameTest",
//         lastName: "lastNameTest"
//     }
//     var token = jwt.sign(user, process.env.SECRET_KEYSECRET_KEY, {
//         espiresIn: 9000
//     });
//     res.json({
//         success: true,
//         token: token
//     })
// }
