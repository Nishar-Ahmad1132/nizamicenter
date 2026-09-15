const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const classes = await db.collection('classes').find({}).toArray();
  for (const c of classes) {
    let fee = 500;
    if (c.numericValue >= 1 && c.numericValue <= 3) fee = 500;
    else if (c.numericValue >= 4 && c.numericValue <= 5) fee = 600;
    else if (c.numericValue >= 6 && c.numericValue <= 8) fee = 700;
    const finalFee = c.fee != null ? c.fee : fee;
    await db.collection('classes').updateOne({ _id: c._id }, { $set: { fee: finalFee } });
    console.log('Updated', c.name?.en, 'fee:', finalFee);
  }
  process.exit(0);
}
run();
