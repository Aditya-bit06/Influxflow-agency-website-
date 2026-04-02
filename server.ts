import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const getTransporter = () => {
    const service = process.env.EMAIL_SERVICE || 'gmail';
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    const host = process.env.EMAIL_HOST;
    const port = parseInt(process.env.EMAIL_PORT || '465');

    if (host) {
      console.log(`Using custom SMTP host: ${host}:${port}`);
      return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    }

    if (service === 'zoho') {
      // Since your account is on zoho.in, we use the Indian SMTP server by default
      // unless EMAIL_REGION is set to 'COM'
      const zohoHost = process.env.EMAIL_REGION === 'COM' ? 'smtp.zoho.com' : 'smtp.zoho.in';
      console.log(`Using Zoho SMTP host: ${zohoHost}`);
      return nodemailer.createTransport({
        host: zohoHost,
        port: 465,
        secure: true,
        auth: { user, pass },
      });
    }

    console.log(`Using default service: ${service}`);
    return nodemailer.createTransport({
      service,
      auth: { user, pass },
    });
  };

  // API route for inquiry form
  app.post("/api/inquiry", async (req, res) => {
    const formData = req.body;

    const transporter = getTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'contact@influxflow.com',
      subject: `🔥 New Lead: ${formData.businessName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #F5C518; text-transform: uppercase; letter-spacing: 2px;">New Client Inquiry</h2>
          <p>A new potential client has just submitted the intake form on <b>InfluxFlow</b>.</p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          
          <h3 style="font-size: 14px; text-transform: uppercase; color: #888;">Contact Information</h3>
          <p><b>Name:</b> ${formData.fullName}</p>
          <p><b>Email:</b> <a href="mailto:${formData.email}">${formData.email}</a></p>
          <p><b>Phone:</b> ${formData.phone}</p>
          
          <h3 style="font-size: 14px; text-transform: uppercase; color: #888;">Business Details</h3>
          <p><b>Business:</b> ${formData.businessName}</p>
          <p><b>Location:</b> ${formData.businessLocation}</p>
          <p><b>Type:</b> ${formData.businessType}</p>
          <p><b>Size:</b> ${formData.businessSize}</p>
          <p><b>Revenue:</b> ${formData.revenueRange}</p>
          
          <h3 style="font-size: 14px; text-transform: uppercase; color: #888;">Project Scope</h3>
          <p><b>Services:</b> ${formData.services?.join(', ') || 'None selected'}</p>
          <p><b>Budget:</b> ${formData.marketingBudget}</p>
          <p><b>Challenges:</b> ${formData.marketingChallenge?.join(', ') || 'None selected'}</p>
          <p><b>Running Ads:</b> ${formData.paidAds}</p>
          
          <h3 style="font-size: 14px; text-transform: uppercase; color: #888;">Vision</h3>
          <p>${formData.successVision}</p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #aaa; text-align: center;">Sent from InfluxFlow Digital Growth Agency</p>
        </div>
      `,
    };

    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('EMAIL_USER or EMAIL_PASS not set in environment variables.');
        console.log('Lead Data (Logged to Console):', JSON.stringify(formData, null, 2));
        return res.status(200).json({ 
          status: 'logged', 
          message: 'Inquiry received. Email not sent (credentials missing).' 
        });
      }

      await transporter.sendMail(mailOptions);
      console.log('Inquiry email sent successfully to contact@influxflow.com');
      res.status(200).json({ status: 'success', message: 'Inquiry sent successfully.' });
    } catch (error) {
      console.error('Nodemailer Error:', error);
      // We return 200 even if email fails so the user's flow isn't interrupted
      // but we log the error on the server for the developer to see.
      res.status(200).json({ 
        status: 'error_logged', 
        message: 'Inquiry received but email failed to send.',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // API route for tracking meeting clicks
  app.post("/api/track-booking", async (req, res) => {
    const { email, businessName } = req.body;

    const transporter = getTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'contact@influxflow.com',
      subject: `📅 Meeting Link Clicked: ${businessName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #F5C518; text-transform: uppercase; letter-spacing: 2px;">Meeting Intent</h2>
          <p><b>${businessName}</b> (${email}) just clicked the Calendly booking link.</p>
          <p>Keep an eye on your calendar for a new booking!</p>
        </div>
      `,
    };

    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        await transporter.sendMail(mailOptions);
      }
      res.status(200).json({ status: 'success' });
    } catch (error) {
      console.error('Error tracking booking click:', error);
      res.status(200).json({ status: 'error' }); // Don't fail the client
    }
  });

  // API route for testing email configuration
  app.get("/api/test-email", async (req, res) => {
    const transporter = getTransporter();

    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return res.status(400).json({ 
          error: 'Missing credentials', 
          message: 'EMAIL_USER or EMAIL_PASS is not set in the Secrets panel.' 
        });
      }

      console.log('Attempting test email for user:', process.env.EMAIL_USER);
      console.log('Service:', process.env.EMAIL_SERVICE || 'gmail');

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: 'contact@influxflow.com',
        subject: 'Test Email from InfluxFlow',
        text: 'If you are reading this, your email configuration is working correctly!'
      });

      res.status(200).json({ status: 'success', message: 'Test email sent successfully to contact@influxflow.com' });
    } catch (error) {
      console.error('Test Email Failed:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to send test email.',
        details: error instanceof Error ? error.message : 'Unknown error',
        hint: 'Error 535 usually means your App Password or Email Address is incorrect. Double-check your Zoho App Password and ensure SMTP access is enabled in Zoho Mail settings.'
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
