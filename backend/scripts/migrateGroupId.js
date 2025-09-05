const mongoose = require("mongoose");
const Product = require("../models/Product");

const uri = "mongodb://localhost:27017/your_database_name"; // 🔹 แก้เป็นของคุณ

async function migrate() {
    await mongoose.connect(uri);

    const products = await Product.find({});
    for (const p of products) {
        if (p.groupId && typeof p.groupId === "string") {
            if (mongoose.Types.ObjectId.isValid(p.groupId)) {
                const newId = new mongoose.Types.ObjectId(p.groupId);
                await Product.updateOne({ _id: p._id }, { $set: { groupId: newId } });
                console.log(`✅ Updated ${p._id}: groupId → ${newId}`);
            } else {
                console.log(`⚠️ Invalid groupId string: ${p.groupId} in product ${p._id}`);
            }
        }
    }

    await mongoose.disconnect();
    console.log("Migration finished!");
}

migrate().catch(err => {
    console.error("Migration error:", err);
    mongoose.disconnect();
});
