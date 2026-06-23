const PDFDocument = require('pdfkit');
const axios = require('axios');

/**
 * Generates a premium Event Ticket PDF and pipes it to the Express response.
 *
 * @param {Object} options
 * @param {Object} options.registration - Populated registration (must have .event, .ticketId, .qrImageUrl, .status)
 * @param {Object} options.user         - The attendee user object (name, email)
 * @param {Object} options.res          - Express response object
 */
const generateTicket = async ({ registration, user, res }) => {
  const event = registration.event;

  // ── Fetch QR code image ──────────────────────────────────────────────────
  const imageResponse = await axios.get(registration.qrImageUrl, { responseType: 'arraybuffer' });
  const qrBuffer = Buffer.from(imageResponse.data, 'binary');

  // ── Create document ──────────────────────────────────────────────────────
  const doc = new PDFDocument({ size: 'A4', margin: 0 });

  const filename = `Ticket-${registration.ticketId}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  doc.pipe(res);

  const W = doc.page.width;   // 595
  const H = doc.page.height;  // 842

  const TEAL    = '#10b981';
  const CYAN    = '#06b6d4';
  const DARK    = '#0f172a';
  const MUTED   = '#64748b';
  const WHITE   = '#ffffff';
  const LIGHT   = '#f1fdf9';
  const ACCENT  = '#134e4a';

  // ── Background ───────────────────────────────────────────────────────────
  doc.rect(0, 0, W, H).fill('#f8fafc');

  // ── Header band (gradient-like: solid teal with a cyan overlay strip) ────
  doc.rect(0, 0, W, 180).fill(ACCENT);
  doc.rect(0, 0, W, 180).fill(TEAL).opacity(0.85);
  doc.opacity(1);

  // Decorative circle - top right
  doc.circle(W - 30, -30, 120).fill(CYAN).opacity(0.18);
  doc.opacity(1);
  // Decorative circle - bottom left of header
  doc.circle(40, 200, 80).fill(TEAL).opacity(0.12);
  doc.opacity(1);

  // ── EVENTIO branding ─────────────────────────────────────────────────────
  doc
    .fontSize(11)
    .font('Helvetica')
    .fillColor('rgba(255,255,255,0.6)')
    .text('EVENTIO • EVENT TICKET', 50, 28, { characterSpacing: 3 });

  // ── Event Title ──────────────────────────────────────────────────────────
  doc
    .fontSize(28)
    .font('Helvetica-Bold')
    .fillColor(WHITE)
    .text(event.title, 50, 55, { width: W - 120, lineGap: 4 });

  // ── Category badge ───────────────────────────────────────────────────────
  if (event.category) {
    const badge = event.category.toUpperCase();
    const badgeX = 50;
    const badgeY = 140;
    doc.roundedRect(badgeX, badgeY, badge.length * 7.5 + 20, 22, 11).fill('rgba(255,255,255,0.2)');
    doc.fontSize(9).font('Helvetica-Bold').fillColor(WHITE).text(badge, badgeX + 10, badgeY + 6, { characterSpacing: 1.5 });
  }

  // ── Ticket type label (top-right corner of header) ───────────────────────
  doc.rotate(-90, { origin: [W - 30, 90] });
  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor('rgba(255,255,255,0.45)')
    .text('ADMIT ONE', W - 30, 90, { characterSpacing: 2 });
  doc.rotate(90, { origin: [W - 30, 90] });

  // ── Dashed tear line ─────────────────────────────────────────────────────
  doc
    .moveTo(0, 200)
    .lineTo(W, 200)
    .dash(6, { space: 5 })
    .lineWidth(1)
    .stroke('#cbd5e1');
  doc.undash();

  // Small circles at tear line edges
  doc.circle(0, 200, 12).fill('#f8fafc');
  doc.circle(W, 200, 12).fill('#f8fafc');

  // ── Main content area ─────────────────────────────────────────────────────
  const contentY = 220;

  // Left column: event details
  const colLeft = 50;
  const colRight = 350;
  const rowH = 56;

  const detailRows = [
    {
      icon: '📅',
      label: 'DATE',
      value: new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    },
    {
      icon: '🕐',
      label: 'TIME',
      value: event.time || 'TBD',
    },
    {
      icon: '📍',
      label: event.isOnline ? 'FORMAT' : 'VENUE',
      value: event.isOnline ? 'Online Event' : event.venue,
    },
    {
      icon: '🎫',
      label: 'TICKET ID',
      value: registration.ticketId,
      mono: true,
    },
    {
      icon: '👤',
      label: 'ATTENDEE',
      value: user.name,
    },
    {
      icon: '✉️',
      label: 'EMAIL',
      value: user.email,
    },
    {
      icon: '💳',
      label: 'PAYMENT',
      value: registration.paymentStatus === 'free' ? 'Free Entry' : `Paid — ₹${event.price}`,
    },
  ];

  detailRows.forEach((row, i) => {
    const y = contentY + i * rowH;

    // Row background (alternating)
    if (i % 2 === 0) {
      doc.roundedRect(colLeft - 10, y - 6, colRight - colLeft + 10, rowH - 4, 8).fill(LIGHT);
    }

    // Label
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor(MUTED)
      .text(`${row.icon}  ${row.label}`, colLeft, y + 2, { characterSpacing: 1 });

    // Value
    doc
      .fontSize(13)
      .font(row.mono ? 'Courier-Bold' : 'Helvetica-Bold')
      .fillColor(DARK)
      .text(row.value, colLeft, y + 16, { width: colRight - colLeft - 10 });
  });

  // ── Right column: QR code box ────────────────────────────────────────────
  const qrBoxX = colRight + 20;
  const qrBoxY = contentY;
  const qrBoxW = W - qrBoxX - 40;
  const qrSize  = qrBoxW - 20;

  // QR box card
  doc
    .roundedRect(qrBoxX - 10, qrBoxY - 10, qrBoxW + 20, qrSize + 80, 16)
    .fillAndStroke(WHITE, '#e2e8f0');

  // QR Image
  doc.image(qrBuffer, qrBoxX, qrBoxY + 10, { width: qrSize, height: qrSize });

  // "Scan to check in" text
  doc
    .fontSize(8.5)
    .font('Helvetica')
    .fillColor(MUTED)
    .text('Scan at entry for check-in', qrBoxX - 10, qrBoxY + qrSize + 18, {
      width: qrBoxW + 20,
      align: 'center',
      characterSpacing: 0.5,
    });

  // Status badge below QR
  const statusColor = registration.status === 'checked-in' ? '#22c55e' :
                      registration.status === 'waitlisted' ? '#f59e0b' : TEAL;
  const statusLabel = registration.status === 'checked-in' ? '✓ CHECKED IN' :
                      registration.status === 'waitlisted'  ? '⏳ WAITLISTED' : '✓ REGISTERED';

  const badgeWidth = 130;
  const badgeXpos  = qrBoxX + (qrBoxW - badgeWidth) / 2 - 5;
  doc
    .roundedRect(badgeXpos, qrBoxY + qrSize + 38, badgeWidth, 22, 11)
    .fill(statusColor);
  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .fillColor(WHITE)
    .text(statusLabel, badgeXpos, qrBoxY + qrSize + 44, { width: badgeWidth, align: 'center', characterSpacing: 1 });

  // ── Bottom footer strip ───────────────────────────────────────────────────
  const footerY = H - 80;
  doc.rect(0, footerY, W, 80).fill(DARK);

  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor('rgba(255,255,255,0.5)')
    .text(
      `This ticket was issued by Eventio. Ticket ID: ${registration.ticketId} • Present this QR code at the event entrance.`,
      40, footerY + 20,
      { width: W - 80, align: 'center' }
    );

  doc
    .fontSize(8)
    .fillColor('rgba(255,255,255,0.3)')
    .text('eventio.app  •  Non-transferable  •  Valid for one-time use', 40, footerY + 42, {
      width: W - 80,
      align: 'center',
      characterSpacing: 1,
    });

  // ── Finish ────────────────────────────────────────────────────────────────
  doc.end();
};

module.exports = generateTicket;
