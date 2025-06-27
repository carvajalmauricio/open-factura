# open-factura

![Facturación electrónica SRI Ecuador](https://github.com/miguelangarano/open-factura/assets/26367577/75a941b0-dace-4047-91e4-6d0d433dfd39)

Open Factura es un proyecto opensource de facturación electrónica para Ecuador compatible con la ficha técnica para comprobantes electrónicos emitido por el SRI.

Está publicada como [librería en npm](https://www.npmjs.com/package/open-factura) y la puedes utilizar simplemente instalandola como dependencia en tu proyecto de Node o Bun.

### Funciones

La librería cuenta actualmente con las siguientes funciones:

- Tipado de campos para factura electrónica de acuerdo a las especificaciones del SRI.
- Generación de archivo JSON con formato de factura electrónica.
- Generación de XML con formato de factura electrónica.
- Firmado de XML con archivo .p12 (Compatible con Security Data y Banco Central)
- Envío de documento a endpoint de recepción del SRI
- Autorización de documento en endpoint del SRI
- Cargar Firma electrónica desde archivo local o URL
- Cargar XML desde archivo local o URL

### Ejemplo

Aquí puedes ver un ejemplo de cómo utilizar las funciones principales:

```
import {
  generateInvoice,
  generateInvoiceXml,
  getP12FromUrl,
  signXml,
} from "open-factura";

const { invoice, accessKey }  = generateInvoice({
  infoTributaria: {
    ...
  },
  infoFactura: {
    ...
  },
  detalles: {
    ...
  },
  reembolsos: {
    ...
  },
  retenciones: {
    ...
  },
  infoSustitutivaGuiaRemision: {
    ...
  },
  otrosRubrosTerceros: {
    ...
  },
  tipoNegociable: { correo: "correo0" },
  maquinaFiscal: {
    ...
  },
  infoAdicional: {
    ...
  },
});

const invoiceXml = generateInvoiceXml(invoice);

const signature: ArrayBuffer = await getP12FromUrl("yoururl");
const password = "yourpassword";

const signedInvoice = await signXml(sign, password, invoiceXml);

const receptionResult = await documentReception(
  signedInvoice,
  process.env.SRI_RECEPTION_URL!
);

const authorizationResult = await documentAuthorization(
  accessKey,
  process.env.SRI_AUTHORIZATION_URL!
);
```

Un ejemplo completo lo puedes encontrar en la carpeta `tests`
Ejemplos de los archivos generados los encuentras en `src/example`

### API

El repositorio incluye un peque\u00f1o servidor HTTP que expone las funciones de
facturaci\u00f3n como una API. Para usarlo define las variables de entorno
`SRI_RECEPTION_URL` y `SRI_AUTHORIZATION_URL` y ejecuta:

```bash
npm run start:api
```

El servidor se inicia en el puerto `3000` (o el que especifiques en `PORT`).
Env\u00eda una petici\u00f3n `POST` a `/invoice` con el siguiente formato:

```json
{
  "invoiceData": { /* datos de la factura */ },
  "p12Path": "./firma.p12",
  "p12Password": "contraseña"
}
```

El campo `obligadoContabilidad` se establece autom\u00e1ticamente en `"SI"` para
cumplir con la obligaci\u00f3n de llevar contabilidad. La respuesta contiene la
factura generada, el XML firmado y los resultados de recepci\u00f3n y
autorizaci\u00f3n.

### Endpoints del SRI

El SRI ha habilitado dos endpoints para cada ambiente (pruebas, producción).

**Producción**

```
SRI_RECEPTION_URL="https://cel.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl"
SRI_AUTHORIZATION_URL="https://cel.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl"
```

**Pruebas**

```
SRI_RECEPTION_URL="https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl"
SRI_AUTHORIZATION_URL="https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl"
```

**Ten en cuenta que para poder utilizar estos endpoints con tu RUC debes activar el ambiente de pruebas/producción en tu cuenta del SRI. [Aquí un tutorial de cómo hacerlo](https://www.factureromovil.com/pasos-para-habilitar-el-ambiente-de-produccion-en-sri)**

### Contribuir

Si deseas contribuir a este proyecto puedes [comprarme un café](https://payp.page.link/SAvm) o Crea un Pull Request con los cambios que pienses que pueden aportar para que el proyecto siga creciendo.
