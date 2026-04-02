import nodemailer from 'nodemailer';

export const onRequestPost = async (context: any) => {
  const { request, env } = context;
  const formData = await request.json();

  const getTransporter = () => {
    const service = env.EMAIL_SERVICE || 'gmail';
    const user = env.EMAIL_USER;
    const pass = env.EMAIL_PASS;
    const host = env.EMAIL_HOST;
    const port = parseInt(env.EMAIL_PORT || '465');

    if (host) {
      return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    }

    if (service === 'zoho') {
      const zohoHost = env.EMAIL_REGION === 'COM' ? 'smtp.zoho.com' : 'smtp.zoho.in';
      return nodemailer.createTransport({
        host: zohoHost,
        port: 465,
        secure: true,
        auth: { user, pass },
      });
    }

    return nodemailer.createTransport({
      service,
      auth: { user, pass },
    });
  };

  const mailOptions = {
    from: env.EMAIL_USER,
    to: 'contact@influxflow.com',
    subject: `🔥 New Lead: ${formData.businessName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #F5C518; text-transform: uppercase; letter-spacing: 2px;">New Client Inquiry</h2>
        <p>A new potential client has just submitted the intake form on <b>InfluxFlow</b>.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <h3 style="font-size: 14px; text-transform: uppercase; color: #888;">Contact Information</h3>
        <p><b>Name:</b> ${formData.fullName}</p>
        <p><b>Email:</b> ${formData.email}</p>
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
    if (!env.EMAIL_USER || !env.EMAIL_PASS) {
      return new Response(JSON.stringify({ 
        status: 'logged', 
        message: 'Inquiry received. Email not sent (credentials missing).' 
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    const transporter = getTransporter();
    await transporter.sendMail(mailOptions);
    
    return new Response(JSON.stringify({ status: 'success', message: 'Inquiry sent successfully.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ 
      status: 'error_logged', 
      message: 'Inquiry received but email failed to send.',
      details: error.message 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
