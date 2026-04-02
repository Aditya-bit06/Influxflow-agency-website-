import nodemailer from 'nodemailer';

export const onRequestPost = async (context: any) => {
  const { request, env } = context;
  const { email, businessName } = await request.json();

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
    if (env.EMAIL_USER && env.EMAIL_PASS) {
      const transporter = getTransporter();
      await transporter.sendMail(mailOptions);
    }
    return new Response(JSON.stringify({ status: 'success' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ status: 'error' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
