exports.isLoggedIn = function(req, res, next) { 
    if (req.session && req.session.user && req.session.user.phone && req.session.user.role === 'admin') {
        return next();
    } else {
        return res.redirect('/auth/login');
    }   
};

