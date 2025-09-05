const mongoose = require("mongoose");
const Product = require("../models/Product");
require("dotenv").config();

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB connected");

        const products = await Product.find({});
        for (const p of products) {
            if (p.productCode) {
                const match = p.productCode.match(/\d+/); // ดึงตัวเลขจากรหัส
                p.numericCode = match ? parseInt(match[0], 10) : null;
                await p.save();
                console.log(`✔ ${p.productCode} → ${p.numericCode}`);
            }
        }

        console.log("🎉 Finished updating numericCode");
        process.exit();
    } catch (err) {
        console.error("❌ Error:", err);
        process.exit(1);
    }
})();
