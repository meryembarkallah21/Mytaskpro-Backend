var User = require('../models/user');


let mapUserInfos = function(user){
    return {
        _id: user.id,
        email: user.email,
        role: user.role,
        active: user.active
    }
}

exports.loging = async (req, res, next) => {

    var email = req.body.email;
    
        const user = await User.findOne({email});
        if(!user){
            return next(new Error('User not found'));
        }else{
            return res.send(mapUserInfos(user));
        }
}

