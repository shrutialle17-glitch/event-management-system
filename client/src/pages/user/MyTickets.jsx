import { useEffect, useState } from "react";
import axios from "axios";

function MyTickets() {
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/registrations/mine",
      );

      setRegistrations(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>My Tickets</h1>

      {registrations.map((registration) => (
        <div key={registration._id}>
          <h3>{registration.event.title}</h3>

          <p>Ticket ID: {registration.ticketId}</p>

          <img src={registration.qrImageUrl} alt="QR Code" width="200" />

          <a
            href={`http://localhost:5000/api/registrations/${registration._id}/pdf`}
            target="_blank"
            rel="noreferrer"
          >
            <button>Download Ticket PDF</button>
          </a>
        </div>
      ))}
    </div>
  );
}

export default MyTickets;
