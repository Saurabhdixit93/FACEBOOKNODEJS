const mongoose = require('mongoose');

module.exports.CONNECTDB = async () => {
    try 
    {
        const conn = await mongoose.connect(process.env.MONGO_URL,{
          useNewUrlParser: true,
          useUnifiedTopology: true,
          
        });
        console.log(`MongoDB Databse connected : ${conn.connection.host} Successfully`);
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
};