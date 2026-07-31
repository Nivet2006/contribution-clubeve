export function generateOTPEmailHTML(contributorName: string, otp: string): string {
  const name = contributorName.trim() || 'Contributor';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Club-Eve Verification OTP Code</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0D0D0F;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #ffffff;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #0D0D0F;
      padding: 40px 10px;
    }
    .container {
      max-width: 560px;
      margin: 0 auto;
      background-color: #15171A;
      border: 2px solid #22252A;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .header {
      background: linear-gradient(135deg, #003C5E 0%, #007F6E 100%);
      padding: 28px 32px;
      text-align: center;
      border-bottom: 2px solid #007F6E;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 900;
      letter-spacing: -0.03em;
      color: #ffffff;
      margin: 0;
      text-transform: uppercase;
    }
    .brand-mark {
      font-family: monospace;
      font-size: 20px;
      font-weight: bold;
      letter-spacing: 4px;
      color: #FFB703;
      margin-top: 6px;
      display: inline-block;
    }
    .body-content {
      padding: 36px 32px;
    }
    .greeting {
      font-size: 16px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 12px;
    }
    .text {
      font-size: 14px;
      line-height: 1.6;
      color: #cbd5e1;
      margin-bottom: 24px;
    }
    .otp-box {
      background-color: #1A1D22;
      border: 2px dashed #007F6E;
      border-radius: 16px;
      padding: 20px;
      text-align: center;
      margin: 24px 0;
    }
    .otp-code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 38px;
      font-weight: 900;
      letter-spacing: 10px;
      color: #FFB703;
      margin: 0;
    }
    .otp-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #007F6E;
      margin-top: 8px;
    }
    .warning-box {
      background-color: rgba(232, 93, 4, 0.1);
      border-left: 4px solid #E85D04;
      padding: 14px 16px;
      border-radius: 8px;
      margin-bottom: 24px;
    }
    .warning-text {
      font-size: 12px;
      color: #f87171;
      margin: 0;
    }
    .footer {
      background-color: #0D0D0F;
      padding: 20px 32px;
      text-align: center;
      border-top: 1px solid #22252A;
      font-size: 11px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      
      <!-- Header with Brand Mark -->
      <div class="header">
        <h1 class="brand-title">CLUB-EVE 1% CLUB</h1>
        <div class="brand-mark">|||··||</div>
      </div>

      <!-- Main Body -->
      <div class="body-content">
        <div class="greeting">Hello ${name},</div>
        <p class="text">
          You have requested to authenticate your email address for the active <strong>Club-Eve Focus Mode Evaluation Round</strong>.
        </p>

        <p class="text">
          Use the 6-digit verification code below to verify your email identity and unlock full screen evaluation access:
        </p>

        <!-- OTP Display Box -->
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
          <div class="otp-label">Verification OTP Code</div>
        </div>

        <div class="warning-box">
          <p class="warning-text">
            <strong>Security Notice:</strong> This OTP is valid for <strong>10 minutes</strong>. Never share this code with anyone.
          </p>
        </div>

        <p class="text" style="font-size: 12px; color: #94a3b8;">
          If you did not initiate this authentication request, please ignore this message.
        </p>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div>Sent securely from <strong>help@clubeve.nivet2006.in</strong></div>
        <div style="margin-top: 4px;">Club-Eve Secure Focus & Integrity Platform • 1% Club</div>
      </div>

    </div>
  </div>
</body>
</html>
  `;
}
