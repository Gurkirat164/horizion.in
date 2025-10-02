import express from "express";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import crypto from "crypto";
import { sendPaymentNotification, sendCustomMessage } from "./bot.js";

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure dotenv with explicit path to .env file
// In production, use .env.production if it exists
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: join(__dirname, envFile) });

// Use environment variables for API keys
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const app = express();
app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET
});

app.post("/create-order", async (req, res) => {
  try {
    const amount = parseInt(req.body.amount);
    const order = await razorpay.orders.create({
      amount: amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

// Payment verification endpoint
app.post("/verify-payment", express.json(), async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, serviceData } = req.body;
    
    // Check that we have all required data
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        message: "Payment verification failed - missing required fields"
      });
    }

    const hmac = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET); 
    const data = `${razorpay_order_id}|${razorpay_payment_id}`;
    hmac.update(data);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature === razorpay_signature) {
      // Payment is successful - send Discord notification
      try {
        await sendPaymentNotification({
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          serviceName: serviceData?.service_name || 'Unknown Service',
          amount: serviceData?.price || 0,
          minecraftUsername: serviceData?.minecraft_username || null,
          isBedrockUser: serviceData?.is_bedrock_user || false
        });
      } catch (discordError) {
        console.error('Discord notification failed:', discordError);
        // Don't fail the payment verification if Discord fails
      }
      
      res.json({ success: true, message: "Payment has been verified" });
    } else {
      // Payment verification failed
      res.status(400).json({ 
        success: false, 
        message: "Payment verification failed - signature mismatch"
      });
    }
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: process.env.NODE_ENV === 'production' ? 'Payment processing error' : err.message
    });
  }
});


// Route to fetch service data (secure server-side handling)
app.post('/get-service-data', (req, res) => {
    const { serviceId } = req.body;
    let serviceData = {};

    switch (serviceId) {
        case 'VIPRank':
            serviceData = { 
                service_name : "VIP Rank",
                description: "Detailed description for Service 101929309390", 
                price: 8900, // Price in paisa (₹89)
                service_id: 1, 
            };
            break;
        case 'MVPRank':
            serviceData = { 
                service_name : "MVP Rank",
                description: "Detailed description for Service 2", 
                price: 16900, // Price in paisa (₹169)
                service_id: 2, 
            };
            break;
        case 'EliteRank':
            serviceData = { 
                service_name : "Elite Rank",
                description: "Detailed description for Service 3", 
                price: 27900, // Price in paisa (₹279)
                service_id: 3, 
            };
            break;
        case 'ImmortalRank':
            serviceData = { 
                service_name : "Immortal Rank",
                description: "Detailed description for Service 4", 
                price: 39900, // Price in paisa (₹399)
                service_id: 4, 
            };
            break;
        case 'VoidKey':
            serviceData = { 
                service_name : "Void Key",
                description: "Detailed description for Service 5", 
                price: 1900, // Price in paisa (₹19)
                service_id: 5, 
            };
            break;
        case 'CelestialKey':
            serviceData = { 
                service_name : "Celestial Key",
                description: "Detailed description for Service 6", 
                price: 3900, // Price in paisa (₹39)
                service_id: 6, 
            };
            break;
        case 'EternalKey':
            serviceData = { 
                service_name : "Eternal Key",
                description: "Detailed description for Service 6", 
                price: 6900, // Price in paisa (₹69)
                service_id: 7, 
            };
            break;
        case 'OmegaKey':
            serviceData = { 
                service_name : "Omega Key",
                description: "Detailed description for Service 6", 
                price: 7900, // Price in paisa (₹79)
                service_id: 8, 
            };
            break;


        default:
            return res.status(400).json({ error: 'Invalid service' });
    }

    res.json(serviceData); // Send service data securely
});

// (Optional) Razorpay Webhook endpoint for automated events
app.post("/webhook", express.raw({ type: 'application/json' }), (req, res) => {
  const shasum = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET);
  const webhookSignature = req.headers['x-razorpay-signature'];
  
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');
  
  if (digest === webhookSignature) {
    // Process the event
    res.json({ status: 'ok' });
  } else {
    // Invalid webhook
    res.status(400).json({ status: 'invalid signature' });
  }
});

// Add a route to get Razorpay key for frontend
app.get("/get-razorpay-key", (req, res) => {
  res.json({ key: RAZORPAY_KEY_ID }); // Use constant instead of env variable
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Get payment details by ID
app.get("/payment/:paymentId", async (req, res) => {
  try {
    const payment = await razorpay.payments.fetch(req.params.paymentId);
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: "An unexpected error occurred",
    error: process.env.NODE_ENV === "production" ? null : err.message
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
