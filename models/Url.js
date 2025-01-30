const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
    longUrl: { type: String, required: true },
    shortId: { type: String, required: true, unique: true },
    clicks: { type: Number, default: 0 },
    referrers: { type: Map, of: Number, default: {} },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    customAlias: { type: String, unique: true, sparse: true }
});

module.exports = mongoose.model('Url', urlSchema);
