// Mock Mail Service
export const sendEmail = async (to: string, subject: string, body: string) => {
  console.log(`Sending Email to ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
  return true;
};

export const sendInvoiceEmail = async (to: string, invoiceId: string, pdfData: any) => {
  console.log(`Sending Invoice ${invoiceId} to ${to}`);
  // In a real implementation, this would use Nodemailer or SendGrid
  return true;
};