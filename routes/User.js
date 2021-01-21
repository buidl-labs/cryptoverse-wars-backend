const express = require("express");
const router = express.Router();
const magic = require('../magic');
const { User } = require('../models');

router.post('/register', async (req, res) => {
    const {token} = req.body
    console.log(User)
    try {
    const { email } = await magic.users.getMetadataByToken(token);
        try{
            const u = await User.create({email});
            return res.json(u);
        } catch(err){
            console.log(err)
            return res.status(500).json(err);
        }

    } catch(err){
        return res.status(400).json({'error': 'MALFORMED_TOKEN'})
    }
    

    // await u.save();
    return res.json(email);

});


module.exports = router;