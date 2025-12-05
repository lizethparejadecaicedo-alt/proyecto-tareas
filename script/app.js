import { obtenerReceta, listarRecetas } from "./recipes.js";


/* ========== Datos persistentes ========== */
let inventory = JSON.parse(localStorage.getItem("michi_inventory")) || [];
let sales = JSON.parse(localStorage.getItem("michi_sales")) || [];

/* ========== Referencias DOM ========== */
const productForm = document.getElementById("productForm");
const saleForm = document.getElementById("saleForm");
const inventoryTbody = document.querySelector("#inventoryTable tbody");
const salesTbody = document.querySelector("#salesTable tbody");
const saleProductSelect = document.getElementById("saleProduct");
const summaryCount = document.getElementById("summaryCount");
const summaryValue = document.getElementById("summaryValue");
const searchInv = document.getElementById("searchInv");
const filterCategory = document.getElementById("filterCategory");
const exportInvCsv = document.getElementById("exportInvCsv");
const exportSalesCsv = document.getElementById("exportSalesCsv");
const fromDate = document.getElementById("fromDate");
const toDate = document.getElementById("toDate");
const quickRange = document.getElementById("quickRange");
const applyFilter = document.getElementById("applyFilter");
const clearFilter = document.getElementById("clearFilter");
const salesTotalEl = document.getElementById("salesTotal");
const salesChartCtx = document.getElementById("salesChart").getContext("2d");

let salesChart = null;

/* ========== Utils ========== */
function saveAll() {
  localStorage.setItem("michi_inventory", JSON.stringify(inventory));
  localStorage.setItem("michi_sales", JSON.stringify(sales));
}

function money(n) {
  return "$" + Number(n).toLocaleString();
}

/* ========== INVENTORY FUNCTIONS ========== */
function renderProductOptions() {
  saleProductSelect.innerHTML = '<option value="">Seleccione...</option>';
  inventory.forEach((p, i) => {
    saleProductSelect.innerHTML += `<option value="${i}">${p.name} — ${p.qty} u</option>`;
  });
}

function renderCategories() {
  const cats = [...new Set(inventory.map(i => (i.category || "Sin categoría").trim()))];
  filterCategory.innerHTML = '<option value="">Todas las categorías</option>';
  cats.forEach(c => filterCategory.innerHTML += `<option value="${c}">${c}</option>`);
}

/* Render inventario */
function renderInventory(filterText = "", category = "") {
  inventoryTbody.innerHTML = "";
  let totalValue = 0;
  let totalCount = 0;

  inventory.forEach((p, idx) => {
    if (filterText && !p.name.toLowerCase().includes(filterText.toLowerCase())) return;
    if (category && (p.category || "").trim() !== category) return;

    const rowTotal = p.qty * p.price;
    totalValue += rowTotal;
    totalCount += p.qty;

    inventoryTbody.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>${p.category || ""}</td>
        <td>${p.qty}</td>
        <td>${money(p.price)}</td>
        <td>${money(rowTotal)}</td>
        <td>
          <button onclick="editProduct(${idx})" class="btn ghost">Editar</button>
          <button onclick="deleteProduct(${idx})" class="btn">Eliminar</button>
        </td>
      </tr>
    `;
  });

  summaryCount.textContent = totalCount;
  summaryValue.textContent = money(totalValue);

  renderProductOptions();
  renderCategories();
}

/* Add / Edit / Delete product */
productForm.addEventListener("submit", function(e){
  e.preventDefault();
  const idEl = document.getElementById("productId");
  const name = document.getElementById("productName").value.trim();
  const category = document.getElementById("productCategory").value.trim();
  const qty = Number(document.getElementById("productQty").value);
  const price = Number(document.getElementById("productPrice").value);

  if(!name || qty < 0 || price < 0) { alert("Verifica los datos"); return; }

  if(idEl.value) {
    const idx = Number(idEl.value);
    inventory[idx] = { name, category, qty, price };
    idEl.value = "";
  } else {
    inventory.push({ name, category, qty, price });
  }

  productForm.reset();
  saveAll();
  renderInventory();
});

function editProduct(idx) {
  const p = inventory[idx];
  document.getElementById("productId").value = idx;
  document.getElementById("productName").value = p.name;
  document.getElementById("productCategory").value = p.category;
  document.getElementById("productQty").value = p.qty;
  document.getElementById("productPrice").value = p.price;
  window.scrollTo({top:0,behavior:"smooth"});
}

function deleteProduct(idx) {
  if(!confirm("Eliminar producto?")) return;
  inventory.splice(idx,1);
  saveAll();
  renderInventory();
}

/* ===== INVENTORY SEARCH FILTERS ===== */
searchInv && searchInv.addEventListener("input", (e) => {
  renderInventory(e.target.value, filterCategory.value);
});
filterCategory && filterCategory.addEventListener("change", (e) => {
  renderInventory(searchInv.value, e.target.value);
});

/* Export CSV simple */
function exportCsv(filename, rows) {
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

exportInvCsv && exportInvCsv.addEventListener("click", () => {
  const rows = [["Nombre","Categoría","Cantidad","Precio","Total"]];
  inventory.forEach(p => rows.push([p.name, p.category || "", p.qty, p.price, p.qty * p.price]));
  exportCsv("inventario_michi.csv", rows);
});

/* ===========================================================
   ==========  RECETAS AUTOMÁTICAS  ==========================
   =========================================================== */

function applyRecipe(productName, saleQty) {
  const recipe = window.RECIPES?.[productName];
  if (!recipe) return;

  recipe.forEach(item => {
    const ingredient = inventory.find(p => p.name === item.insumo);
    if (ingredient) {
      ingredient.qty -= item.qty * saleQty;
      if (ingredient.qty < 0) ingredient.qty = 0;
    }
  });

  saveAll();
  renderInventory();
}
function mostrarReceta(nombre) {
    const receta = obtenerReceta(nombre);

    if (!receta) {
        alert("❌ No existe una receta con ese nombre.");
        return;
    }

    let texto = `📌 Receta: ${receta.nombre}\n\n`;
    
    texto += "🍨 Ingredientes:\n";
    receta.ingredientes.forEach(i => {
        texto += `- ${i}\n`;
    });

    texto += "\n🧾 Pasos:\n";
    receta.pasos.forEach((p, index) => {
        texto += `${index + 1}. ${p}\n`;
    });

    texto += `\n💰 Costo estimado: $${receta.costo}`;

    alert(texto);
}

/* ========== SALES FUNCTIONS ========== */
saleForm.addEventListener("submit", function(e){
  e.preventDefault();
  const prodIndex = Number(document.getElementById("saleProduct").value);
  if (isNaN(prodIndex) || prodIndex < 0 || !inventory[prodIndex]) { alert("Seleccione producto"); return; }

  const qty = Number(document.getElementById("saleQty").value);
  if (qty <= 0) { alert("Cantidad incorrecta"); return; }

  const manualPrice = Number(document.getElementById("salePrice").value);
  const unitPrice = manualPrice > 0 ? manualPrice : inventory[prodIndex].price;

  if (inventory[prodIndex].qty < qty) { alert("Stock insuficiente"); return; }

  const sale = {
    date: new Date().toISOString(),
    productName: inventory[prodIndex].name,
    productIndex: prodIndex,
    qty,
    unitPrice
  };

  // DESC. NORMAL
  inventory[prodIndex].qty -= qty;

  // 🔥 NUEVO: APLICAR RECETA
  applyRecipe(sale.productName, qty);

  sales.push(sale);
  saveAll();
  renderInventory();
  renderSales();
  saleForm.reset();
});

/* Render ventas */
function renderSales(filtered = null) {
  const rows = filtered || sales;
  salesTbody.innerHTML = "";
  let totalAmount = 0;

  rows.forEach((s, idx) => {
    const date = new Date(s.date);
    const total = s.qty * s.unitPrice;
    totalAmount += total;
    salesTbody.innerHTML += `
      <tr>
        <td>${date.toLocaleString()}</td>
        <td>${s.productName}</td>
        <td>${s.qty}</td>
        <td>${money(s.unitPrice)}</td>
        <td>${money(total)}</td>
        <td>
          <button onclick="deleteSale(${idx})" class="btn">Eliminar</button>
        </td>
      </tr>
    `;
  });

  salesTotalEl.textContent = money(totalAmount);
  renderSalesChart(rows);
}

/* Eliminar venta (devuelve stock, pero NO devuelve receta) */
function deleteSale(idx) {
  if(!confirm("Eliminar venta y devolver stock?")) return;
  const s = sales[idx];
  if (inventory[s.productIndex]) inventory[s.productIndex].qty += s.qty;
  sales.splice(idx,1);
  saveAll();
  renderInventory();
  renderSales();
}

/* Filtrar ventas */
function filterSalesByDates(from, to) {
  if(!from && !to) return sales.slice().reverse();
  const fromT = from ? new Date(from).setHours(0,0,0,0) : -Infinity;
  const toT = to ? new Date(to).setHours(23,59,59,999) : Infinity;
  return sales.filter(s => {
    const t = new Date(s.date).getTime();
    return t >= fromT && t <= toT;
  }).reverse();
}

/* Quick range */
applyFilter.addEventListener("click", () => {
  const fr = fromDate.value;
  const to = toDate.value;
  const quick = quickRange.value;
  if (quick) {
    const now = new Date();
    if (quick === "today") {
      const d = now.toISOString().slice(0,10);
      fromDate.value = d; toDate.value = d;
    } else {
      const days = Number(quick);
      const start = new Date(); start.setDate(start.getDate() - (days-1));
      fromDate.value = start.toISOString().slice(0,10);
      toDate.value = new Date().toISOString().slice(0,10);
    }
  }
  const filtered = filterSalesByDates(fromDate.value, toDate.value);
  renderSales(filtered);
});

clearFilter.addEventListener("click", () => {
  fromDate.value = ""; toDate.value = ""; quickRange.value = "";
  renderSales();
});

/* Export ventas */
exportSalesCsv && exportSalesCsv.addEventListener("click", () => {
  const rows = [["Fecha","Producto","Cantidad","Unitario","Total"]];
  const filtered = filterSalesByDates(fromDate.value, toDate.value);
  filtered.forEach(s => rows.push([new Date(s.date).toLocaleString(), s.productName, s.qty, s.unitPrice, s.qty * s.unitPrice]));
  exportCsv("ventas_michi.csv", rows);
});

/* ========== GRÁFICA ========== */
function renderSalesChart(rows) {
  const sums = {};
  rows.forEach(s => {
    const d = new Date(s.date);
    const day = d.toISOString().slice(0,10);
    sums[day] = (sums[day] || 0) + s.qty * s.unitPrice;
  });

  const labels = Object.keys(sums).sort();
  const data = labels.map(l => sums[l]);

  if (salesChart) salesChart.destroy();
  salesChart = new Chart(salesChartCtx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Ventas (COP)',
        data,
        backgroundColor: 'rgba(255,45,166,0.8)'
      }]
    },
    options: {
      responsive:true,
      scales: { y: { beginAtZero:true } }
    }
  });
}

/* Init render */
renderInventory();
renderSales();
renderProductOptions();
renderCategories();

/* ========= Botón para buscar receta ========= */
document.getElementById("btnBuscarReceta").addEventListener("click", () => {
    const nombre = document.getElementById("inputReceta").value.trim();
    mostrarReceta(nombre);
});

/*******************************
 *  BÚSQUEDA DE RECETAS (IA)  *
 *******************************/
document.getElementById("btnBuscarReceta").addEventListener("click", async () => {
  const nombre = document.getElementById("inputReceta").value.trim();

  if (!nombre) {
    alert("Escribe el nombre de una receta.");
    return;
  }

  // 🔥 Llamada a la API gratuita ThemealDB
  const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${nombre}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.meals) {
      alert("No encontré una receta con ese nombre.");
      return;
    }

    const receta = data.meals[0];

    // Construir texto bonito
    let ingredientes = "";
    for (let i = 1; i <= 20; i++) {
      const ing = receta[`strIngredient${i}`];
      const cant = receta[`strMeasure${i}`];
      if (ing && ing.trim() !== "") {
        ingredientes += `• ${ing} - ${cant}\n`;
      }
    }

    const resultado = 
      `🍨 *${receta.strMeal}*\n\n` +
      `📌 *Categoría:* ${receta.strCategory}\n` +
      `🌍 *Origen:* ${receta.strArea}\n\n` +
      `🥄 *Ingredientes:*\n${ingredientes}\n` +
      `📖 *Instrucciones:*\n${receta.strInstructions}`;

    alert(resultado);

  } catch (err) {
    console.error(err);
    alert("Error buscando la receta.");
  }
});
