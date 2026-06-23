import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useState } from "react";
import axios from "axios";

function QRScanner() {
const [registration, setRegistration] = useState(null);
const [qrToken, setQrToken] = useState("");

useEffect(() => {
const scanner = new Html5QrcodeScanner(
"reader",
{ fps: 10, qrbox: 250 },
false
);

scanner.render(
  async (decodedText) => {
    setQrToken(decodedText);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/qr/validate",
        {
          qrToken: decodedText,
        }
      );

      setRegistration(res.data.data.registration);
    } catch (err) {
      alert(err.response?.data?.message);
    }
  },
  () => {}
);

return () => scanner.clear();


}, []);

const handleCheckIn = async () => {
try {
await axios.post(
"http://localhost:5000/api/qr/checkin",
{
qrToken,
}
);

  alert("Check-in successful");
  setRegistration(null);
} catch (err) {
  alert(err.response?.data?.message);
}


};

return ( <div> <h1>QR Scanner</h1>


  <div id="reader"></div>

  {registration && (
    <div>
      <h3>{registration.user.name}</h3>
      <p>{registration.user.email}</p>
      <p>{registration.event.title}</p>

      <button onClick={handleCheckIn}>
        Confirm Check-In
      </button>
    </div>
  )}
</div>

);
}

export default QRScanner;
