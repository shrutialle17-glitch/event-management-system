const PDFDocument = require('pdfkit');

/**
 * Generates a Certificate of Attendance PDF and pipes it to the response.
 * @param {Object} attendance - The populated attendance record (must populate user, event, registration)
 * @param {Object} res - Express response object
 */
const generateCertificate = (attendance, res) => {
  return new Promise((resolve, reject) => {
    try {
      // Create landscape document
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margin: 50,
      });

      // Set headers before piping
      const filename = `Certificate-${attendance.registration.ticketId}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      doc.pipe(res);

      const width = doc.page.width;
      const height = doc.page.height;

      // Draw borders
      // Outer border
      doc.rect(20, 20, width - 40, height - 40).lineWidth(4).stroke('#2563eb'); // primary color
      // Inner border
      doc.rect(30, 30, width - 60, height - 60).lineWidth(1).stroke('#3b82f6');

      // Add Content
      doc.moveDown(3);
      doc.font('Helvetica-Bold').fontSize(40).fillColor('#1e40af').text('Certificate of Attendance', { align: 'center' });
      
      doc.moveDown(1.5);
      doc.font('Helvetica').fontSize(16).fillColor('#4b5563').text('This is to certify that', { align: 'center' });
      
      doc.moveDown(1);
      doc.font('Helvetica-Bold').fontSize(32).fillColor('#111827').text(attendance.user.name, { align: 'center' });
      
      doc.moveDown(1);
      doc.font('Helvetica').fontSize(16).fillColor('#4b5563').text('has successfully attended the event', { align: 'center' });
      
      doc.moveDown(1);
      doc.font('Helvetica-Bold').fontSize(24).fillColor('#2563eb').text(attendance.event.title, { align: 'center' });
      
      doc.moveDown(1.5);
      const eventDate = new Date(attendance.event.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      doc.font('Helvetica').fontSize(14).fillColor('#4b5563').text(`held on ${eventDate}`, { align: 'center' });

      // Bottom section
      const bottomY = height - 120;
      
      doc.fontSize(12).fillColor('#6b7280');
      
      // Left side: Ticket Info
      doc.text(`Ticket ID: ${attendance.registration.ticketId}`, 50, bottomY);
      doc.text(`Issued: ${new Date().toLocaleDateString()}`, 50, bottomY + 20);

      // Right side: Organizer Info
      doc.text('Authorized by Eventio Platform', width - 250, bottomY, { align: 'right' });
      doc.moveTo(width - 250, bottomY - 10).lineTo(width - 50, bottomY - 10).lineWidth(1).stroke('#d1d5db');

      doc.end();

      // Resolve when stream ends
      res.on('finish', () => {
        resolve();
      });
      res.on('error', reject);

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateCertificate };
