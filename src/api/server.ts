import { createServer } from 'http';
import {
  generateInvoice,
  generateInvoiceXml,
  getP12FromLocalFile,
  signXml,
  documentReception,
  documentAuthorization,
  InvoiceInput,
} from '../index';

const port = parseInt(process.env.PORT || '3000');

function sendJson(res: any, status: number, body: any) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

const server = createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/invoice') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const invoiceData: InvoiceInput = data.invoiceData;
        const p12Path: string = data.p12Path;
        const p12Password: string = data.p12Password;
        if (!invoiceData || !p12Path || !p12Password) {
          sendJson(res, 400, { error: 'invoiceData, p12Path and p12Password are required' });
          return;
        }
        // Ensure "obligadoContabilidad" is always "SI" as required by accounting rules
        if (invoiceData.infoFactura) {
          invoiceData.infoFactura.obligadoContabilidad = 'SI';
        }
        const { invoice, accessKey } = generateInvoice(invoiceData);
        const invoiceXml = generateInvoiceXml(invoice);
        const p12 = getP12FromLocalFile(p12Path);
        const signed = await signXml(p12, p12Password, invoiceXml);
        const reception = await documentReception(
          signed,
          process.env.SRI_RECEPTION_URL || ''
        );
        const authorization = await documentAuthorization(
          accessKey,
          process.env.SRI_AUTHORIZATION_URL || ''
        );
        sendJson(res, 200, {
          invoice,
          invoiceXml,
          signedInvoice: signed,
          reception,
          authorization,
        });
      } catch (err: any) {
        sendJson(res, 500, { error: err.message });
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(port, () => {
  console.log(`Open Factura API listening on port ${port}`);
});
