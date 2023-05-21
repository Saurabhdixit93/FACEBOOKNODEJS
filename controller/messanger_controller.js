;
module.exports.messanger = (req , res) =>{
    
    return res.render('messanger',{
        title: 'Messanger | My-Book',
        user: req.user
    });
};