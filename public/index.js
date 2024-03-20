"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cors_1 = __importDefault(require("cors"));
const mongodb_1 = require("mongodb");
const validation_1 = require("./services/validation");
// const DB_NAME = "sample_mflix";
const DB_NAME = "PoodiSabjiDotCom";
// const uri = `mongodb://0.0.0.0:27017/${DB_NAME}`;
// const uri =
//   "mongodb+srv://suditya:Suditya%40123@poodisabjidotcom.jjmenhc.mongodb.net/PoodiSabjiDotCom?retryWrites=true&w=majority&appName=PoodiSabjiDotCom";
const uri = "mongodb+srv://suditya:Suditya%40123@poodisabjidotcom.jjmenhc.mongodb.net/?retryWrites=true&w=majority&appName=PoodiSabjiDotCom";
const client = new mongodb_1.MongoClient(uri, {});
const db = client.db(DB_NAME);
const usersColl = db.collection("users");
const cartItemsColl = db.collection("cartItems");
const inventoryColl = db.collection("inventory");
const pdfkit_1 = __importDefault(require("pdfkit"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware to parse JSON bodies
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)());
// Middleware to parse URL-encoded bodies
app.use(express_1.default.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;
app.get("/test", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield db.collection("users").findOne({});
    console.log(users);
    res.status(200).send("testing the mongodb server");
}));
app.get("/", (_req, res) => {
    res.send("Hello World From Nodejs Server And Typescript");
});
app.post("/api/inventory", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const inventory = req.body.inventory;
        const response = yield inventoryColl.updateOne({}, { $set: { inventory: inventory } }, { upsert: true });
        return res.status(200).json({ message: "successuffy updated inventory" });
    }
    catch (error) {
        console.log(error);
        return res.send(`Internal Server Error: ${error}`).status(500);
    }
}));
app.get("/api/inventory", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const inventory = yield inventoryColl.findOne({});
        return res.send(inventory).status(200);
    }
    catch (error) {
        return res.send(`Internal error: ${error}`).status(500);
    }
}));
app.post("/api/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, adminLogin } = req.body;
    try {
        const user = yield usersColl.findOne({
            email: email,
        });
        console.log(user);
        if (user) {
            const isEqual = yield bcryptjs_1.default.compare(password, user.password);
            if (!isEqual) {
                return res.status(400).send({ message: "InvalidPassword" });
            }
            if (adminLogin && !user.adminLogin) {
                return res.status(400).send({ message: "You dont have admin access!" });
            }
            return res.status(200).send({
                message: `Successfully logged in! ${adminLogin ? " as a admin!" : ""}`,
            });
        }
        else {
            return res.status(401).send({ message: "User does not exists!" });
        }
    }
    catch (error) {
        return res.status(500).send({ message: "Something went wrong" });
    }
}));
app.post("/api/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("got the request", req.body);
    const { email, password, name } = req.body;
    const validationErrors = (0, validation_1.validateCredentials)(email, password);
    if (validationErrors) {
        return res
            .status(400)
            .send({ message: "Validation error : " + validationErrors });
    }
    else {
        try {
            const existingUser = yield usersColl.findOne({ email: email });
            if (existingUser) {
                // console.log(existingUser);
                // throw new Error("Email already exists");
                return res.status(400).json({ message: "Email already exists" });
            }
            const salt = 10;
            const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
            // const user = new User({ email, hashedPassword });
            // console.log(hashedPassword);
            const document = { email, password: hashedPassword, name: name };
            const result = yield usersColl.insertOne(document);
            // JWT token creation
            const token = jsonwebtoken_1.default.sign({ email, password }, "suditya_gupta", {
                expiresIn: "4h",
            });
            // Send back as a cookie
            return res
                .status(200)
                .cookie("token", token, { httpOnly: true })
                .json({ message: "User created successfully!", result: result });
        }
        catch (error) {
            // console.log(error);
            return res.status(500).json({
                message: "Internal Server Error due to: " + error,
            });
        }
    }
}));
function generateHeader(doc) {
    doc
        .image("/home/sudityagupta/Documents/Poodi-Sabji-dot-com/backend/src/assets/5528439.jpg", 50, 45, { width: 50 })
        .fillColor("#444444")
        .fontSize(20)
        .text("Poodi Sabji dot-com", 110, 57)
        .fontSize(10)
        .text("Lives in your heart and tummy", 200, 65, { align: "right" })
        .text("Tummy", 200, 80, { align: "right" })
        .moveDown();
}
function generateCustomerInformation(doc) {
    doc.fillColor("#444444").fontSize(20).text("Bill", 50, 160);
    generateHr(doc, 185);
    const customerInformationTop = 200;
    doc
        .fontSize(10)
        .text("Bill no:", 50, customerInformationTop)
        .font("Helvetica-Bold")
        .text("#INV123456", 150, customerInformationTop)
        .font("Helvetica")
        .text("Bill Date:", 50, customerInformationTop + 15)
        .text(formatDate(new Date()), 150, customerInformationTop + 15)
        .font("Helvetica-Bold")
        .moveDown();
    generateHr(doc, 252);
}
const generateInvoiceTable = (doc, bill) => {
    let i;
    const invoiceTableTop = 330;
    doc.font("Helvetica-Bold");
    generateTableRow(doc, invoiceTableTop, "Item", "Unit Cost", "Quantity", "Line Total");
    generateHr(doc, invoiceTableTop + 20);
    doc.font("Helvetica");
    let total = 0;
    for (i = 0; i < bill.items.length; i++) {
        const item = bill.items[i];
        const position = invoiceTableTop + (i + 1) * 30;
        const subTotal = item.price * item.quantity;
        total += subTotal;
        generateTableRow(doc, position, item.title, formatCurrency(item.price), item.quantity, formatCurrency(subTotal));
        generateHr(doc, position + 20);
    }
    const subtotalPosition = invoiceTableTop + (i + 1) * 30;
    generateTableRow(doc, subtotalPosition, "", "Subtotal", "", formatCurrency(total));
    const paidToDatePosition = subtotalPosition + 20;
    generateTableRow(doc, paidToDatePosition, "", "Paid To Date", "", formatCurrency(total));
    doc.font("Helvetica");
};
function generateTableRow(doc, y, item, unitCost, quantity, lineTotal) {
    doc
        .fontSize(10)
        .text(item, 50, y)
        // .text(description, 150, y)
        .text(unitCost, 280, y, { width: 90, align: "right" })
        .text(quantity.toString(), 370, y, { width: 90, align: "right" })
        .text(lineTotal, 0, y, { align: "right" });
}
function generateHr(doc, y) {
    doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}
function formatCurrency(val) {
    return "₹" + val;
}
function formatDate(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return year + "/" + month + "/" + day;
}
// Generate dummy data
const dummyClient = {
    name: "John Doe",
    address: "123 Main St",
    city: "Anytown",
    state: "CA",
    country: "USA",
    pricePerSession: 50,
};
const dummyItems = [
    { item: "1", description: "Product A", quantity: 2, amountSum: 100 },
    { item: "2", description: "Product B", quantity: 1, amountSum: 50 },
];
// const dummyInvoice: Invoice = {
//   invoiceNumber: "INV-123456",
//   client: dummyClient,
//   items: dummyItems,
//   subtotal: 150,
//   paid: 150,
// };
app.get("/api/get-cart", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.query;
    // console.log(req.query);
    try {
        const cart = (yield cartItemsColl.findOne({ email: email }));
        return res.status(200).json({ cartItems: cart.cartItems });
    }
    catch (error) {
        return res.send(`Error: ${error}`).status(500);
    }
}));
app.post("/api/add-to-cart", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cartItems = req.body.cartItems;
    const email = req.body.email;
    const doc = {
        cartItems: cartItems,
        email: email,
    };
    console.log(doc);
    try {
        const response = yield cartItemsColl.updateOne({ email: email }, { $set: { cartItems: cartItems } }, { upsert: true });
        console.log(response);
        return res.send("Successfully Inserted Cart Items").status(200);
    }
    catch (error) {
        return res.send(`Failed to insert due to ${error}`).status(500);
    }
}));
app.get("/api/generate-pdf", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.query;
    const cart = (yield cartItemsColl.findOne({ email: email }));
    const cartItems = cart.cartItems;
    const bill = {
        invoiceNumber: "#INV123456",
        client: email,
        items: cartItems,
    };
    const doc = new pdfkit_1.default({ size: "A4", margin: 50 });
    generateHeader(doc);
    generateCustomerInformation(doc);
    generateInvoiceTable(doc, bill);
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);
    doc.end();
}));
// export { generateBillPdf, Invoice, InvoiceItem, Client };
app.listen(PORT, () => {
    console.log("backend listening on PORT : " + PORT);
});
