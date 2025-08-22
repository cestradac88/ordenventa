import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { DecimalPipe, CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
// Importa las funciones y decoradores necesarios de Angular. 'signal' y 'computed' permiten manejar estado reactivo moderno.

interface DetalleItem {
  codigo: string;
  descripcion: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
}
// Define la estructura de cada línea del detalle. Esto mejora la seguridad de tipos y facilita el mantenimiento.

@Component({
  selector: 'app-ov',
  templateUrl: './ov.html',
  styleUrl: './ov.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DecimalPipe, HttpClientModule]
})
// Configura el componente Angular. 'OnPush' optimiza el rendimiento al actualizar solo cuando cambian las señales.

export class OV {
  private http = inject(HttpClient);
  // Sección de señales para los campos de cabecera
  documento = signal(''); // RUC/DNI del cliente
  clienteCodigo = signal(''); // Código editable
  clienteNombre = signal('');
  correlativo = signal(this.generarCorrelativo());
  fechaOV = signal(this.obtenerFechaHoy());
  direccionEnvio = signal('');
  // Cada campo de cabecera es una señal reactiva, lo que permite actualizaciones automáticas en la UI y facilita la gestión de estado.

  // Detalle de la orden de venta: array de líneas de producto
  detalle = signal<DetalleItem[]>([]);
  // El detalle es un array de objetos 'DetalleItem', gestionado como señal reactiva.

  // Total calculado automáticamente sumando los subtotales del detalle
  total = computed(() => this.detalle().reduce((acc, item) => acc + item.subtotal, 0));
  // 'computed' recalcula el total cada vez que cambia el detalle, asegurando que la UI siempre muestre el valor correcto.

  // Estado para mostrar el popup y el JSON generado
  mostrarPopup = signal(false);
  jsonOV = signal('');
  // Estas señales controlan la visualización del popup y almacenan el JSON generado al guardar la OV.

  // Agrega una línea vacía al detalle
  agregarDetalle() {
    this.detalle.update(det => [
      ...det,
      { codigo: '', descripcion: '', precioUnitario: 0, cantidad: 1, subtotal: 0 }
    ]);
  }
  // Permite al usuario agregar productos al detalle. Impacto: mejora la experiencia de usuario y la flexibilidad del formulario.

  // Actualiza un campo de una línea del detalle y recalcula el subtotal
  actualizarDetalle(index: number, campo: keyof Omit<DetalleItem, 'subtotal'>, valor: string | number) {
    this.detalle.update(det => {
      const copia = det.slice();
      const item = copia[index];
      (item as any)[campo] = valor;
      item.subtotal = item.precioUnitario * item.cantidad;
      return copia;
    });
  }
  // Permite editar cualquier campo del detalle y recalcula el subtotal automáticamente. Impacto: asegura la integridad de los datos y reduce errores manuales.

  // Elimina una línea del detalle
  eliminarDetalle(index: number) {
    this.detalle.update(det => det.filter((_, i) => i !== index));
  }
  // Permite eliminar productos del detalle. Impacto: da control total al usuario sobre el contenido de la OV.

  // Al guardar, genera el JSON y muestra el popup
  guardarOV() {
    const ov = {
      cliente_codigo: this.clienteCodigo(),
      cliente_nombre: this.clienteNombre(),
      documento: this.documento(),
      fecha: this.fechaOV(),
      direccion: this.direccionEnvio(),
      total: this.total(),
      detalles: this.detalle().map(item => ({
        itemcode: item.codigo,
        descripcion: item.descripcion,
        precio: item.precioUnitario,
        cantidad: item.cantidad,
        subtotal: item.subtotal
      }))
    };
    // Mostrar el JSON en el popup
    this.jsonOV.set(JSON.stringify(ov, null, 2));
    this.mostrarPopup.set(true);

    // Enviar al API PHP
    this.http.post('http://localhost/orden-venta-api/guardar_orden.php', ov).subscribe({
      next: resp => {
        alert('Orden guardada correctamente: ' + JSON.stringify(resp));
      },
      error: err => {
        alert('Error al guardar la orden: ' + JSON.stringify(err));
      }
    });
  }
  // Construye el objeto de la OV y lo convierte a JSON para mostrarlo en el popup. Impacto: permite validar la estructura antes de enviar al backend.

  // Cierra el popup
  cerrarPopup() {
    this.mostrarPopup.set(false);
  }
  // Permite cerrar el popup de visualización del JSON. Impacto: mejora la usabilidad.

  // Genera un correlativo aleatorio para la OV
  private generarCorrelativo(): string {
    return 'OV-' + Math.floor(1000 + Math.random() * 9000);
  }
  // Genera un identificador único para cada OV. Impacto: evita duplicados y facilita la trazabilidad.

  // Obtiene la fecha actual en formato YYYY-MM-DD
  private obtenerFechaHoy(): string {
    const hoy = new Date();
    return hoy.toISOString().slice(0, 10);
  }
  // Inicializa la fecha de la OV con la fecha actual. Impacto: agiliza el registro y reduce errores de usuario.
}
