const mongoose = require('mongoose');

const productListSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    bookingId: {
        type: Number,
        required: true
    },
    homeProducts: {
        lamp: { type: String, default: "" },
        tray: { type: String, default: "" },
        smallPlate: { type: String, default: "" },
        stackedVessel: { type: String, default: "" },
        ladle: { type: String, default: "" },
        tumbler: { type: String, default: "" },
        bell: { type: String, default: "" },
        sandalBowl: { type: String, default: "" },
        sickle: { type: String, default: "" },
        knife: { type: String, default: "" },
        woodenBoard: { type: String, default: "" },
        fullPotOfWater: { type: String, default: "" },
        milk: { type: String, default: "" },
        curd: { type: String, default: "" },
        homium: { type: String, default: "" },
        cowDung: { type: String, default: "" },
        deityPicture: { type: String, default: "" },
        mangoLeaf: { type: String, default: "" },
        brick: { type: String, default: "" },
        sand: { type: String, default: "" },
        firewood: { type: String, default: "" },
        hayDoll: { type: String, default: "" },
        oldPaper: { type: String, default: "" },
        homaKundam: { type: String, default: "" },
        oneRupeeCoin: { type: String, default: "" }
    },
    marketProducts: {
        coconut: { type: String, default: "" },
        guava: { type: String, default: "" },
        lotusFlower: { type: String, default: "" },
        pumpkin: { type: String, default: "" },
        sapota: { type: String, default: "" },
        tulsi: { type: String, default: "" },
        banana: { type: String, default: "" },
        pomegranate: { type: String, default: "" },
        oleander: { type: String, default: "" },
        betelLeaf: { type: String, default: "" },
        grapes: { type: String, default: "" },
        looseFlowers: { type: String, default: "" },
        bananaLeaf: { type: String, default: "" },
        neckGarland: { type: String, default: "" },
        maruguHerb: { type: String, default: "" },
        lemon: { type: String, default: "" },
        moonGarland: { type: String, default: "" },
        bermudaGrass: { type: String, default: "" },
        apple: { type: String, default: "" },
        deityGarland: { type: String, default: "" },
        orange: { type: String, default: "" },
        flowerString: { type: String, default: "" },
        sweetLime: { type: String, default: "" },
        jasmineString: { type: String, default: "" }
    }
}, { collection: 'productlists' });

productListSchema.index({ bookingId: 1 });
const ProductList = mongoose.model('ProductList', productListSchema);

module.exports = ProductList;
