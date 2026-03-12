require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'db.json');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const DataStore = mongoose.models.DataStore || mongoose.model('DataStore', new mongoose.Schema({ data: Object }, { strict: false }));
        let doc = await DataStore.findOne({});
        const initialData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

        // Preserve users from existing document so login isn't lost
        if (doc && doc.data && doc.data.users) {
            initialData.users = doc.data.users;
        }

        if (doc) {
            doc.data = initialData;
            await DataStore.updateOne({}, { data: doc.data });
            console.log('✅ Remote MongoDB Updated successfully with Ecommerce products!');
        } else {
            await DataStore.create({ data: initialData });
            console.log('✅ Remote MongoDB Created & Updated successfully!');
        }
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
