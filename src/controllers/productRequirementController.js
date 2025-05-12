"use strict";

const ProductList = require("../models/productRequirement");
const user = require("../models/user");
const nodemailer = require("nodemailer");


const sendEmail = async (email, subject, home, market) => {
    console.log(home, market)
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465, // or 587, depending on your provider
            service: "gmail", // true for 465, false for 587
            secure: true,
            auth: {
                user: process.env.AUTH_EMAIL,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject,
            html: `
            <h4>Dear Customer,</h4>
            <p> Please ensure this requirement is collect, before the Homam Pooja.</p>

            <p><b>வீட்டு சாமான்கள்</b><p>
           
            <p>குத்துவிளக்கு: ${home.lamp}</p>
            <p>தாம்பாளம்: ${home.tray}</p>
            <p>சிறியதட்டம்: ${home.smallPlate}</p>
            <p>அடுக்கு பாத்திரம்: ${home.stackedVessel}</p>
            <p>கரண்டி: ${home.ladle}</p>
            <p>டம்ளர்: ${home.tumbler}</p>
            <p>மணி: ${home.bell}</p>
            <p>சந்தணக் கிண்ணம்: ${home.sandalBowl}</p>
            <p>கொடுவாள்: ${home.sickle}</p>
            <p>கத்தி: ${home.knife}</p>
            <p>ஆசனப் பலகை: ${home.woodenBoard}</p>
            <p>நிறைகுடம் தண்ணீர்: ${home.fullPotOfWater}</p>
            <p>பால்: ${home.milk}</p>
            <p>தயிர்: ${home.curd}</p>
            <p>ஹோமியம்: ${home.homium}</p>
            <p>சாணம்: ${home.cowDung}</p>
            <p>சுவாமி படம்: ${home.deityPicture}</p>
            <p>மா இலை: ${home.mangoLeaf}</p>
            <p>செங்கல்: ${home.brick}</p>
            <p>மணல்: ${home.sand}</p>
            <p>சவுக்கு விறகு: ${home.firewood}</p>
            <p>வைக்கோல் பொம்மை: ${home.hayDoll}</p>
            <p>பழைய பேப்பர்: ${home.oldPaper}</p>
            <p>ஹோம குண்டம்: ${home.homaKundam}</p>
            <p>1 ரூபாய் நாணயம்: ${home.oneRupeeCoin}</p>
            <br/>
            <br/>

            <p><b>மார்க்கெட் சாமான்கள்</b></p>
            <p>தேங்காய்: ${market.coconut}</p>
            <p>கொய்யா: ${market.guava}</p>
            <p>தாமரைப் பூ: ${market.lotusFlower}</p>
            <p>பூசணிக்காய்: ${market.pumpkin}</p>
            <p>சப்போட்டா: ${market.sapota}</p>
            <p>துளசி: ${market.tulsi}</p>
            <p>வாழைப்பழம்: ${market.banana}</p>
            <p>மாதுளை: ${market.pomegranate}</p>
            <p>அரளி: ${market.oleander}</p>
            <p>வெற்றிலை: ${market.betelLeaf}</p>
            <p>திராட்சை: ${market.grapes}</p>
            <p>உதிரி பூ: ${market.looseFlowers}</p>
            <p>வாழை இலை: ${market.bananaLeaf}</p>
            <p>கழுத்து மாலை: ${market.neckGarland}</p>
            <p>மருகு: ${market.maruguHerb}</p>
            <p>எலுமிச்சம்பழம்: ${market.lemon}</p>
            <p>நிலவு மாலை: ${market.moonGarland}</p>
            <p>அருகம்புல்: ${market.bermudaGrass}</p>
            <p>ஆப்பிள்: ${market.apple}</p>
            <p>சாமிபட மாலை: ${market.deityGarland}</p>
            <p>ஆரஞ்சு: ${market.orange}</p>
            <p>தொடர் பூ: ${market.flowerString}</p>
            <p>சாத்துக்குடி: ${market.sweetLime}</p>
            <p>மல்லித்தொடர்: ${market.jasmineString}</p>
            <br/><br/>
            <p><b>Best regards,</b></p>
            <p>Mahalakshmi Astrology Team</p>
            `
        };
        await transporter.sendMail(mailOptions);

    } catch (error) {
        console.error("Email send error:", error);
        return false;
    }
};

exports.createProductList = async (req, res) => {
    try {

        const {
            userId,
            bookingId,
            homeProducts = {},
            marketProducts = {}
        } = req.body;

        console.log(req.body);

        // Validate required field
        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        // Create a new ProductList document
        const productList = new ProductList({
            userId,
            bookingId,
            homeProducts,
            marketProducts
        });

        // Save to the database
        const newProduct = await productList.save();
        if (newProduct) {
            const customer = await user.findById(newProduct.userId);
            console.log(customer)
            const subject = "Homam product Details"
            await sendEmail(customer.email, subject, newProduct.homeProducts, newProduct.marketProducts);
            return res.status(201).json({
                message: "Product list created successfully",
                data: productList
            });
        }


    } catch (error) {
        console.error("Error creating product list:", error);
        return res.status(500).json({ message: "Server error" });
    }
};


exports.getAllProductLists = async (req, res) => {
    try {
        const productLists = await ProductList.find(); // Fetches all documents
        return res.status(200).json({
            message: "Product lists fetched successfully",
            data: productLists
        });
    } catch (error) {
        console.error("Error fetching product lists:", error);
        return res.status(500).json({ message: "Server error" });
    }
};