/**
 * Modelo de cliente basado en la tabla OCRD de SAP Business One
 * Nomenclatura y tipos de campo compatibles con SAP B1
 */
export interface ClienteSAP {
  CardCode: string;      // Código de cliente (PK)
  CardName: string;      // Nombre del cliente
  CardType: string;      // Tipo de socio ('C' para cliente)
  LicTradNum: string;    // Número de documento (RUC/DNI)
  Phone1?: string;       // Teléfono principal
  Cellular?: string;     // Celular
  E_Mail?: string;       // Correo electrónico
  Address?: string;      // Dirección
  U_SAPFiori?: string;   // Campo personalizado para interfaz Fiori
}
