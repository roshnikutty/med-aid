
//exports.DATABASE_URL = "mongodb://rk:rk@ds143141.mlab.com:43141/node-medical-assist";

exports.DATABASE_URL = process.env.DATABASE_URL ||
    global.DATABASE_URL || 'mongodb://localhost/node-medical-assist';

exports.PORT = process.env.PORT || 8080;

exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ||
    global.DATABASE_URL || 'mongodb://localhost/test-medical-assist';

exports.AUTH_DATABASE_URL = process.env.AUTH_DATABASE_URL ||
    global.DATABASE_URL || 'mongodb://localhost/auth-medical-assist';


exports.JWT = {  
  // Secret key for JWT signing and encryption
  jwtSecret: "MyS3cr3tK3Y",
    jwtSession: {
        session: false
    }
};