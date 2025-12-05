// ============ SISTEMA DE RECETAS AUTOMÁTICAS ============

// Lista inicial de recetas (puedes agregar más luego)
const recetas = [
  {
    nombre: "Helado de Chocolate",
    ingredientes: [
      "Leche",
      "Cacao",
      "Azúcar",
      "Base de helado"
    ],
    pasos: [
      "Mezclar la leche con el cacao.",
      "Agregar azúcar y batir.",
      "Añadir base de helado.",
      "Congelar por 6 horas."
    ],
    costo: 3500
  },

  {
    nombre: "Helado de Fresa",
    ingredientes: [
      "Leche",
      "Pulpa de fresa",
      "Azúcar",
      "Base de helado"
    ],
    pasos: [
      "Mezclar la leche con la pulpa de fresa.",
      "Agregar azúcar.",
      "Añadir base de helado.",
      "Congelar por 6 horas."
    ],
    costo: 3800
  },

  {
    nombre: "Helado Napolitano",
    ingredientes: [
      "Leche",
      "Chocolate",
      "Fresa",
      "Vainilla",
      "Azúcar",
      "Base de helado"
    ],
    pasos: [
      "Preparar mezcla de chocolate.",
      "Preparar mezcla de fresa.",
      "Preparar mezcla de vainilla.",
      "Unir las tres capas sin mezclar.",
      "Congelar 8 horas."
    ],
    costo: 4500
  }
];


// ============ FUNCIÓN PARA OBTENER UNA RECETA POR NOMBRE ============
export function obtenerReceta(nombre) {
  return recetas.find(r => r.nombre.toLowerCase() === nombre.toLowerCase());
}


// ============ FUNCIÓN PARA LISTAR TODAS LAS RECETAS ============
export function listarRecetas() {
  return recetas;
}


// ============ FUNCIÓN PARA AGREGAR NUEVAS RECETAS ============
export function agregarReceta(nuevaReceta) {
  recetas.push(nuevaReceta);
}
// Hacer la lista de recetas visible globalmente (para app.js)
window.RECIPES = {};

recetas.forEach(r => {
  window.RECIPES[r.nombre] = r;
});

