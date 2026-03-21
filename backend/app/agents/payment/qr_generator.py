import qrcode
import base64
from io import BytesIO

def generate_qr(booking_id: str, user_name: str, show_name: str, date: str) -> str:
    """Returns QR code as base64 string"""
    
    qr_data = f"""
    MUSEUM TICKET
    Booking ID : {booking_id}
    Name       : {user_name}
    Show       : {show_name}
    Date       : {date}
    """

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4
    )
    qr.add_data(qr_data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    return base64.b64encode(buffer.read()).decode("utf-8")