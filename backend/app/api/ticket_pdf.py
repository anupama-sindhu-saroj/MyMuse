import io
import qrcode
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

WHITE     = colors.white
BLACK     = colors.HexColor("#111111")
GRAY_TEXT = colors.HexColor("#888888")
GRAY_LINE = colors.HexColor("#E5E5E5")
GREEN     = colors.HexColor("#22C55E")

def _qr(data: str) -> io.BytesIO:
    qr = qrcode.QRCode(version=1, box_size=10, border=2)
    qr.add_data(data)
    qr.make(fit=True)
    buf = io.BytesIO()
    qr.make_image(fill_color="black", back_color="white").save(buf, format="PNG")
    buf.seek(0)
    return buf

def _check(c, cx, cy, r):
    c.setFillColor(GREEN)
    c.circle(cx, cy, r, fill=1, stroke=0)
    c.setStrokeColor(WHITE)
    c.setLineWidth(2.2)
    c.setLineCap(1)
    c.line(cx - r*0.38, cy, cx - r*0.05, cy - r*0.38)
    c.line(cx - r*0.05, cy - r*0.38, cx + r*0.42, cy + r*0.30)

def generate_ticket_pdf(booking: dict) -> bytes:
    buf = io.BytesIO()
    pw, ph = A4
    c = canvas.Canvas(buf, pagesize=A4)

    # Background
    c.setFillColor(colors.HexColor("#F4F4F4"))
    c.rect(0, 0, pw, ph, fill=1, stroke=0)

    # Card
    cm = 18*mm
    cw = pw - 2*cm
    ch = 220*mm
    cx = cm
    cy = ph - cm - ch
    c.setFillColor(WHITE)
    c.setStrokeColor(GRAY_LINE)
    c.setLineWidth(0.8)
    c.roundRect(cx, cy, cw, ch, 10, fill=1, stroke=1)

    # MUSEO wordmark
    c.setFillColor(BLACK)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(cx + 10*mm, cy + ch - 12*mm, "MUSEO.")

    # Check + heading
    ccx = cx + 14*mm
    ccy = cy + ch - 30*mm
    _check(c, ccx, ccy, 5*mm)
    c.setFillColor(BLACK)
    c.setFont("Helvetica-Bold", 22)
    c.drawString(cx + 22*mm, ccy - 3.5*mm, "Booking Confirmed")
    c.setFillColor(GRAY_TEXT)
    c.setFont("Helvetica", 10)
    c.drawString(cx + 22*mm, ccy - 11*mm, "Your ticket has been created — keep this ready at entry")

    # Separator 1
    s1 = cy + ch - 50*mm
    c.setStrokeColor(GRAY_LINE); c.setLineWidth(0.6)
    c.line(cx + 8*mm, s1, cx + cw - 8*mm, s1)

    # Show & museum
    c.setFillColor(BLACK); c.setFont("Helvetica-Bold", 18)
    c.drawString(cx + 10*mm, s1 - 14*mm, booking.get("show_name", "General Admission")[:45])
    c.setFillColor(GRAY_TEXT); c.setFont("Helvetica", 11)
    c.drawString(cx + 10*mm, s1 - 23*mm, booking.get("museum_name", ""))

    # Info grid
    gt  = s1 - 36*mm
    c1  = cx + 10*mm
    c2  = cx + cw/2 + 2*mm
    rg  = 18*mm

    def info(x, y, label, value):
        c.setFillColor(GRAY_TEXT); c.setFont("Helvetica", 8)
        c.drawString(x, y + 10, label.upper())
        c.setFillColor(BLACK); c.setFont("Helvetica-Bold", 13)
        c.drawString(x, y, str(value))

    # Build ticket count string from tickets dict
    tickets = booking.get("tickets", {})
    if tickets:
        ticket_str = ", ".join(f"{v} {k}" for k, v in tickets.items())
    else:
        ticket_str = f"{booking.get('num_tickets', 1)} Adult"

    info(c1, gt,       "Tickets",   ticket_str)
    info(c2, gt,       "Date",      booking.get("visit_date", ""))
    info(c1, gt - rg,  "Time",      booking.get("time_slot", ""))
    info(c2, gt - rg,  "Ticket ID", booking.get("ticket_id", ""))

    # Separator 2
    s2 = gt - rg - 14*mm
    c.setStrokeColor(GRAY_LINE); c.setLineWidth(0.6)
    c.line(cx + 8*mm, s2, cx + cw - 8*mm, s2)

    # QR Code
    qr_buf  = _qr(f"https://museo.app/verify?ticket_id={booking.get('ticket_id','')}")
    qr_size = 52*mm
    qx = cx + (cw - qr_size) / 2
    qy = s2 - qr_size - 8*mm
    c.drawImage(ImageReader(qr_buf), qx, qy, width=qr_size, height=qr_size)

    c.setFillColor(GRAY_TEXT); c.setFont("Helvetica", 9)
    c.drawCentredString(cx + cw/2, qy - 7*mm,
        "Present this QR code at the entrance. Valid for the selected date and time.")

    c.setFillColor(BLACK); c.setFont("Helvetica-Bold", 10)
    c.drawCentredString(cx + cw/2, qy - 18*mm, "D O W N L O A D   T I C K E T")

    # Footer
    c.setFillColor(GRAY_TEXT); c.setFont("Helvetica", 8)
    c.drawCentredString(pw/2, cy - 8*mm,
        "museo.app  ·  support@museo.app  ·  Non-transferable · Valid for one visit")

    c.save()
    return buf.getvalue()