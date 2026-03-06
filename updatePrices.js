const mongoose = require('mongoose');
require('dotenv').config();

const DB_URI = process.env.MONGO_URI;

mongoose.connect(DB_URI).then(async () => {
    const DataStoreSchema = new mongoose.Schema({ data: Object }, { strict: false });
    const DataStore = mongoose.models.DataStore || mongoose.model('DataStore', DataStoreSchema);

    const doc = await DataStore.findOne({});
    if (doc) {
        const db = doc.data;
        const adjustPrice = () => Math.floor(Math.random() * 9000 + 1000).toString();

        if (db.nfts) {
            db.nfts.forEach(n => {
                n.price = adjustPrice();
            });
        }
        if (db.collections) {
            db.collections.forEach(c => {
                c.price = adjustPrice();
            });
        }
        if (db.users) {
            db.users.forEach(u => {
                u.balance = (Math.floor(Math.random() * 90000 + 10000)).toString();
            });
        }
        await DataStore.updateOne({}, { data: db });
        console.log("DB UPDATED");
    }
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});