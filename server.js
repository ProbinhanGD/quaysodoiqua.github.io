const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

const DATA_FILE = "users.json";

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

app.post("/send", async (req, res) => {
    try {
        const { username } = req.body;

        let users = JSON.parse(fs.readFileSync(DATA_FILE));

        if (users.find(u => u.username === username)) {
            return res.json({ success: false, message: "Chỉ một lần thôi cu" });
        }

let number = Math.floor(Math.random() * (1800130 - 1800100 + 1)) + 1800100;

        users.push({
            username,
            number,
            time: new Date().toLocaleString()
        });

        fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));

        // TRẢ KẾT QUẢ VỀ WEB TRƯỚC
        res.json({ success: true, number });

        // GỬI MAIL SAU (không làm treo server)
        try {
           let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // QUAN TRỌNG
    requireTLS: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

            await transporter.sendMail({
from: process.env.EMAIL_USER,
to: process.env.EMAIL_USER,
                subject: "New Random Number",
                text: `Username: ${username}\nNumber: ${number}`
            });

        } catch (mailError) {
            console.log("Mail error:", mailError.message);
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);

});






