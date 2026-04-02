import nodemailer from 'nodemailer';

export const onRequestGet = async (context: any) => {
  const { env } = context;

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

  try {
    if (!env.EMAIL_USER || !env.EMAIL_PASS) {
      return new Response(JSON.stringify({ 
        error: 'Missing credentials', 
        message: 'EMAIL_USER or EMAIL_PASS is not set in Cloudflare environment variables.' 
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const transporter = getTransporter();
    await transporter.sendMail({
      from: env.EMAIL_USER,
      to: 'contact@influxflow.com',
      subject: 'Test Email from InfluxFlow (Cloudflare)',
      text: 'If you are reading this, your email configuration is working correctly on Cloudflare!'
    });

    return new Response(JSON.stringify({ status: 'success', message: 'Test email sent successfully.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ 
      status: 'error', 
      message: 'Failed to send test email.',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
