import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = os.getenv("EMAIL_USER")   # anushkawanve28@gmail.com
SMTP_PASS = os.getenv("EMAIL_PASS")   # app password from .env

def send_ticket_email(to_email: str, user_name: str, booking: dict, pdf_bytes: bytes) -> bool:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Your MUSEO Ticket – {booking.get('show_name', 'Your Visit')}"
    msg["From"]    = f"MUSEO Tickets <{SMTP_USER}>"
    msg["To"]      = to_email

    tickets = booking.get("tickets", {})
    ticket_str = ", ".join(f"{v} {k}" for k, v in tickets.items()) if tickets else "1 Adult"

    plain = f"""
Hi {user_name},

Your booking is confirmed!

  Museum   : {booking.get('museum_name', '')}
  Show     : {booking.get('show_name', '')}
  Date     : {booking.get('visit_date', '')}
  Slot     : {booking.get('time_slot', '')}
  Tickets  : {ticket_str}
  Ticket ID: {booking.get('ticket_id', '')}

Your e-ticket PDF is attached. Show it at the entrance.

— The MUSEO Team
""".strip()

    html = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
body{{font-family:Georgia,serif;background:#F5F0E8;margin:0;padding:0}}
.w{{max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.1)}}
.h{{background:#1A1A2E;padding:32px 40px}}.h h1{{color:#C9A84C;font-size:30px;margin:0 0 4px;letter-spacing:3px}}
.h p{{color:#aaa;font-size:13px;margin:0}}.b{{padding:32px 40px}}.b h2{{color:#1A1A2E;font-size:20px;margin-bottom:8px}}
.g{{display:grid;grid-template-columns:1fr 1fr;gap:16px;background:#F5F0E8;border-radius:8px;padding:20px;margin:20px 0}}
.gi label{{display:block;font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1px}}
.gi span{{font-size:14px;font-weight:bold;color:#1A1A2E}}
.tid{{background:#1A1A2E;color:#C9A84C;font-family:monospace;font-size:15px;padding:10px 16px;border-radius:6px;display:inline-block;margin:12px 0;letter-spacing:2px}}
.f{{background:#1A1A2E;padding:20px 40px;text-align:center}}.f p{{color:#777;font-size:11px;margin:4px 0}}
.f a{{color:#C9A84C;text-decoration:none}}
</style></head><body>
<div class="w">
  <div class="h"><h1>MUSEO</h1><p>Your cultural journey begins here</p></div>
  <div class="b">
    <h2>Booking Confirmed! 🎉</h2>
    <p>Hi <strong>{user_name}</strong>, your e-ticket PDF is attached to this email.</p>
    <div class="g">
      <div class="gi"><label>Museum</label><span>{booking.get('museum_name','')}</span></div>
      <div class="gi"><label>Show</label><span>{booking.get('show_name','')}</span></div>
      <div class="gi"><label>Date</label><span>{booking.get('visit_date','')}</span></div>
      <div class="gi"><label>Time</label><span>{booking.get('time_slot','')}</span></div>
      <div class="gi"><label>Tickets</label><span>{ticket_str}</span></div>
      <div class="gi"><label>Amount</label><span>₹{booking.get('total_amount',0)}</span></div>
    </div>
    <p style="font-size:12px;color:#888;margin-bottom:4px">Ticket ID</p>
    <div class="tid">{booking.get('ticket_id','')}</div>
    <p style="font-size:13px;color:#888;margin-top:20px">Present the attached PDF at the entrance. Valid for one visit only.</p>
  </div>
  <div class="f">
    <p>Questions? <a href="mailto:{SMTP_USER}">{SMTP_USER}</a></p>
    <p>© MUSEO — Bringing culture closer to you</p>
  </div>
</div>
</body></html>"""

    msg.attach(MIMEText(plain, "plain"))
    msg.attach(MIMEText(html, "html"))

    pdf_part = MIMEApplication(pdf_bytes, _subtype="pdf")
    pdf_part.add_header("Content-Disposition", "attachment",
                        filename=f"MUSEO_Ticket_{booking.get('ticket_id','ticket')}.pdf")
    msg.attach(pdf_part)

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_USER, [to_email], msg.as_string())
        print(f"[email] ✅ Ticket sent to {to_email}")
        return True
    except Exception as e:
        print(f"[email] ❌ Failed to send to {to_email}: {e}")
        return False