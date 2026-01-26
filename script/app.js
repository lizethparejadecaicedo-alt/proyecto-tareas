
/* ================== DATOS ================== */
let inventory = JSON.parse(localStorage.getItem("michi_inventory")) || [];
let sales = JSON.parse(localStorage.getItem("michi_sales")) || [];

/* ================== GUARDAR ================== */
function saveAll() {
  localStorage.setItem("michi_inventory", JSON.stringify(inventory));
  localStorage.setItem("michi_sales", JSON.stringify(sales));
}

/* ================== UTIL ================== */
function money(n) {
  return "$" + Number(n || 0).toLocaleString();
}

/* ================== DOM ================== */
const productForm = document.getElementById("productForm");
const saleForm = document.getElementById("saleForm");

const inventoryTbody = document.querySelector("#inventoryTable tbody");
const salesTbody = document.querySelector("#salesTable tbody");
const saleProductSelect = document.getElementById("saleProduct");

const summaryCount = document.getElementById("summaryCount");
const summaryValue = document.getElementById("summaryValue");

/* ================== INVENTARIO ================== */
function renderInventory() {
  inventoryTbody.innerHTML = "";

  let totalQty = 0;
  let totalValue = 0;

  inventory.forEach((p, i) => {
    const total = p.qty * p.price;
    totalQty += p.qty;
    totalValue += total;

    inventoryTbody.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>${p.category || ""}</td>
        <td>${p.qty}</td>
        <td>${money(p.price)}</td>
        <td>${money(total)}</td>
        <td>
          <button onclick="deleteProduct(${i})">Eliminar</button>
        </td>
      </tr>
    `;
  });

  summaryCount.textContent = totalQty;
  summaryValue.textContent = money(totalValue);

  renderSaleOptions();
}

function deleteProduct(i) {
  if (!confirm("¿Eliminar producto?")) return;
  inventory.splice(i, 1);
  saveAll();
  renderInventory();
}

/* ================== OPCIONES DE VENTA ================== */
function renderSaleOptions() {
  saleProductSelect.innerHTML = '<option value="">Seleccione...</option>';

  inventory.forEach((p, i) => {
    saleProductSelect.innerHTML += `
      <option value="${i}">${p.name}</option>
    `;
  });
}

/* ================== AGREGAR PRODUCTO ================== */
productForm.addEventListener("submit", e => {
  e.preventDefault();

  const name = productForm.productName.value.trim();
  const category = productForm.productCategory.value.trim();
  const qty = Number(productForm.productQty.value);
  const price = Number(productForm.productPrice.value);

  if (!name || qty < 0 || price < 0) {
    alert("Datos inválidos");
    return;
  }

  inventory.push({ name, category, qty, price });
  saveAll();
  renderInventory();
  productForm.reset();
});

/* ================== VENTAS ================== */
saleForm.addEventListener("submit", e => {
  e.preventDefault();

  const index = saleForm.saleProduct.value;
  const qty = Number(saleForm.saleQty.value);
  const price = Number(saleForm.salePrice.value);

  if (index === "" || qty <= 0 || price < 0) {
    alert("Venta inválida");
    return;
  }

  const product = inventory[index];

  if (product.qty < qty) {
    alert("Stock insuficiente");
    return;
  }

  product.qty -= qty;

  sales.push({
    date: new Date().toISOString(),
    product: product.name,
    qty,
    price
  });

  saveAll();
  renderInventory();
  renderSales();
  saleForm.reset();
});

/* ================== LISTAR VENTAS ================== */
function renderSales() {
  salesTbody.innerHTML = "";

  sales.forEach(s => {
    salesTbody.innerHTML += `
      <tr>
        <td>${new Date(s.date).toLocaleString()}</td>
        <td>${s.product}</td>
        <td>${s.qty}</td>
        <td>${money(s.price)}</td>
        <td>${money(s.qty * s.price)}</td>
      </tr>
    `;
  });
}

/* ================== INIT ================== */
renderInventory();
renderSales();
