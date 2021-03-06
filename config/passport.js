var LocalStrategy = require('passport-local').Strategy;

// including models
var User = require('../app/models/user');

// function defination for passport-config
function passportConfig(passport) {
    
    passport.serializeUser(function(user, done) {
			       done(null, user.id);
			   });
    
    passport.deserializeUser(function(id, done) {
				 User.findById(id, function(err, user) {
						   done(err, user);
					       });
			     });

    // signup Strategy for adding new admins
    passport.use('local-signup',new LocalStrategy(
		     {
			 usernameField : 'email',
			 passwordField : 'password',
			 passReqToCallback : true
		     },
		     function (req, email, password, done) {
	    
			 process.nextTick(
			     function () {
				 User.findOne(
				     {
					 'local.email' : email
				     },
				     function (err, user) {
					 if (err)
					     return done(err);
					 if (user)
					     return done(null, false, req, console.log('alredy taken'));
					 else {
					     var newUser = new User();
					     newUser.local.email    = email;
					     newUser.local.password = newUser.generateHash(password);
					     newUser.save(
						 function(err) {
						     if (err)
							 throw err;
						     return done(null, newUser);
						 });

					     return undefined;
					 }
						  
				     });
			     });
	    
		     }));
    
    // login Strategy for logging in an admin
    passport.use('local-login',
		 new LocalStrategy(
		     {			 
			 usernameField : 'email',
			 passwordField : 'password',
			 passReqToCallback : true 
		     },
		     function (req, email, password, done) {
			 
			 User.findOne(
			     {
				 'local.email' : email
			     },
			     function (err, user){
				 if (err)
				     return done(err);
				 if (!user)
				     return done(null, false, req.flash('loginMessage', 'No user found.'));
				 if (!user.validPassword(password))
				     return done(null, false, req.flash('loginMessage', 'wrong password'));
				 
				 return done(null, user);
			     } );			
			 
		     }));	   
		      
};

// exporting above defined function
module.exports = passportConfig;