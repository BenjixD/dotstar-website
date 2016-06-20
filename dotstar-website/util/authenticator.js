// Define a middleware function to be used for every secured routes
module.exports = function(req, res, next){
	if(!req.isAuthenticated()){
		res.status(401).send();
	}

	else{
		next();
	}
}