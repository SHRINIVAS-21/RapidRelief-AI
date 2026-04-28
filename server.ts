import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Placeholder for Incident APIs
  app.get("/api/incidents", (req, res) => {
    res.json([]);
  });

  app.post("/api/verify", (req, res) => {
    const { videoId, confidenceScore } = req.body;
    // logic to update firestore status
    res.json({ success: true, status: 'verified' });
  });

  app.post("/api/alert", (req, res) => {
    const { incidentId, type, location } = req.body;
    
    console.log(`[ALERT] Automated emergency alert for ${type} at ${location}`);
    
    // In production, these would use the keys in .env
    const hasTwilio = !!process.env.TWILIO_ACCOUNT_SID;
    const hasSendGrid = !!process.env.SENDGRID_API_KEY;

    if (hasTwilio) {
      console.log("Sending SMS via Twilio...");
    }
    
    if (hasSendGrid) {
      console.log("Sending Email via SendGrid...");
    }

    res.json({ 
      success: true, 
      notificationsSent: {
        sms: hasTwilio,
        email: hasSendGrid
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
