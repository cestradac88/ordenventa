// Importa utilidades de Angular para señales reactivas, computados y estrategia de cambio de detección
import { signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
// Importa el modelo de cliente compatible con SAP Business One
import { ClienteSAP } from './cliente.model';
// Importa la función inject para obtener servicios de Angular
import { inject } from '@angular/core';
// Importa el servicio HttpClient para realizar peticiones HTTP
import { HttpClient } from '@angular/common/http';
// Importa el decorador Component para definir el componente
import { Component } from '@angular/core';

/**
 * Componente para registrar un nuevo cliente.
 * Campos: código (autogenerado), documento (RUC/DNI), nombre.
 */
/**
 * Componente para registrar un nuevo cliente.
 * Utiliza nomenclatura y campos compatibles con SAP Business One (OCRD).
 * Permite mostrar la trama JSON antes de enviar y enviar los datos al API PHP.
 */
@Component({
  selector: 'app-cliente', // Selector para usar el componente en templates
  templateUrl: './cliente.html', // Ruta al archivo de template HTML
  styleUrls: ['./cliente.css'], // Ruta al archivo de estilos CSS
  changeDetection: ChangeDetectionStrategy.OnPush, // Estrategia de cambio de detección para optimizar el rendimiento
  imports: [CommonModule, HttpClientModule] // Importa CommonModule y HttpClientModule para habilitar @if, bindings y peticiones HTTP
})
export class Cliente {
  // Señal reactiva para controlar la visibilidad del popup de confirmación
  mostrarPopup = signal(false); // true si se debe mostrar el popup
  // Señal reactiva para almacenar la trama JSON a mostrar en el popup
  jsonCliente = signal(''); // Contiene el JSON generado antes de enviar
  // Inyecta el servicio HttpClient para realizar peticiones HTTP
  http = inject(HttpClient);
  // Señal para el número de documento (LicTradNum, RUC/DNI)
  LicTradNum = signal(''); // Almacena el valor del documento ingresado por el usuario
  // Señal para el nombre del cliente (CardName)
  CardName = signal(''); // Almacena el nombre del cliente ingresado
  // Computed para el código autogenerado (CardCode): 'C' + LicTradNum
  CardCode = computed(() => this.LicTradNum() ? 'C' + this.LicTradNum() : ''); // Genera el código automáticamente
  // Tipo de socio (CardType), fijo 'C' para cliente
  CardType = 'C'; // Indica que el registro es de tipo cliente

  /**
   * Método que prepara la trama JSON y muestra el popup antes de enviar.
   * Se ejecuta al hacer clic en el botón Registrar.
   */
  registrarCliente() {
    // Construye el objeto cliente con los datos actuales
    const cliente: ClienteSAP = {
      CardCode: this.CardCode(), // Código autogenerado
      CardName: this.CardName(), // Nombre del cliente
      CardType: this.CardType,   // Tipo de socio
      LicTradNum: this.LicTradNum() // Número de documento
    };
    // Convierte el objeto cliente a JSON y lo almacena en la señal
    this.jsonCliente.set(JSON.stringify(cliente, null, 2));
    // Muestra el popup para confirmar el envío
    this.mostrarPopup.set(true);
  }

  /**
   * Método que envía los datos del cliente al API PHP cuando el usuario confirma.
   * Realiza una petición POST y muestra el resultado en un alert.
   */
  enviarCliente() {
    // Recupera el objeto cliente desde el JSON almacenado
    const cliente = JSON.parse(this.jsonCliente());
    // Realiza la petición POST al API PHP para guardar el cliente
        this.http.post('http://localhost/orden-venta-api/guardar_cliente.php', cliente).subscribe({
          next: resp => {
            alert('Cliente registrado correctamente');
            this.mostrarPopup.set(false);
          },
          error: err => {
            // Muestra el error exacto devuelto por el API
            let msg = 'Error al registrar el cliente';
            if (err && err.error) {
              if (typeof err.error === 'string') {
                msg += ': ' + err.error;
              } else if (err.error.error) {
                msg += ': ' + err.error.error;
              }
            }
            alert(msg);
            this.mostrarPopup.set(false);
          }
        });
  }

  /**
   * Método para cerrar el popup sin enviar los datos.
   * Limpia la trama JSON y oculta el popup.
   */
  cerrarPopup() {
    this.mostrarPopup.set(false); // Oculta el popup
    this.jsonCliente.set('');     // Limpia el JSON mostrado
  }
}
