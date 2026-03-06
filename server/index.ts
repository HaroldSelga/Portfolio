import express from 'express';
import cors from 'cors';
import twilio from 'twilio';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Require Twilio variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const targetPhoneNumber = process.env.TARGET_PHONE_NUMBER;

// Initialize Twilio client
let client: twilio.Twilio | null = null;
if (accountSid && authToken) {
    client = twilio(accountSid, authToken);
} else {
    console.warn("WARNING: Twilio credentials not found in .env file. SMS will not be sent.");
}

app.post('/api/sms', async (req: express.Request, res: express.Response) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const formattedMessage = `New Portfolio Contact!\n\nFrom: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;

    if (!client || !twilioPhoneNumber || !targetPhoneNumber) {
        console.log("Mock SMS Sent (Twilio not configured):");
        console.log(formattedMessage);
        return res.status(200).json({ success: true, mock: true });
    }

    try {
        const twilioResponse = await client.messages.create({
            body: formattedMessage,
            from: twilioPhoneNumber,
            to: targetPhoneNumber,
        });
        console.log("Twilio SMS sent successfully. SID:", twilioResponse.sid);
        res.status(200).json({ success: true, sid: twilioResponse.sid });
    } catch (error) {
        console.error("Error sending SMS via Twilio:", error);
        res.status(500).json({ error: 'Failed to send SMS' });
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
