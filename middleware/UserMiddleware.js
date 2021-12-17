

class UserMiddleware {
    checkAuthenticated (req, res, next) {
        
        if (req.isAuthenticated()) {
   
            return next();
        }
            
        
        res.redirect('/login');
    }

    checkNotAuthenticated (req, res, next) {
        if (req.isAuthenticated())
           
                
            res.redirect('/');
           
            // res.redirect('/admin/index');
        return next();
    }
}

module.exports = new UserMiddleware;