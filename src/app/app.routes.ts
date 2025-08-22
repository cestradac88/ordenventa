import { Routes } from '@angular/router';
// Importa el tipo Routes necesario para definir las rutas en Angular.

import { OV } from './ov/ov';
// Importa el componente OV, que será mostrado en la ruta principal.

export const routes: Routes = [
  {
    path: '',
    // Define la ruta raíz de la aplicación ("/").
    component: OV
    // Indica que al acceder a la raíz se debe mostrar el componente OV.
  },
  {
    path: 'cliente',
    // Ruta para el formulario de cliente
    loadComponent: () => import('./cliente/cliente').then(m => m.Cliente)
    // Muestra el formulario de cliente en /cliente
  }
];
// Exporta el arreglo de rutas para que Angular lo utilice en la configuración del router.
