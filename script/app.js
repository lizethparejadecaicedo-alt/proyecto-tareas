/* ================== DATOS ================== */
let inventory = JSON.parse(localStorage.getItem("michi_inventory")) || [];
let sales = JSON.parse(localStorage.getItem("michi_sales")) || [];
let recipes = JSON.parse(localStorage.getItem("michi_recipes")) || [];

/* ================== GUARDAR ================== */
function saveAll() {
  localStorage.setItem("michi_inventory", JSON.stringify(inventory));
  localStorage.setItem("michi_sales", JSON.stringify(sales));
  localStorage.setItem("michi_recipes", JSON.stringify(recipes));
}

/* ================== UTIL ================== */
function money(n) {
  return "$" + Number(n).toLocaleString();
}

/* ================== DOM ================== */
const productForm = document.getElementById("productForm");
const saleForm = document.getElementById("saleForm");
const inventoryTbody = document.querySelector("#inventoryTable tbody");
const salesTbody = document.querySelector("#salesTable tbody");
const saleProductSelect = document.getElementById("saleProduct");
const summaryCount = document.getElementById("summaryCount");
const summaryValue = document.getElementById("summaryValue");

const recipeForm = document.getElementById("recipeForm");
const recipesList = document.getElementById("recipesList");

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
          <button type="button" onclick="deleteProduct(${i})">Eliminar</button>
        </td>
      </tr>
    `;
  });

  summaryCount.textContent = totalQty;
  summaryValue.textContent = money(totalValue);

  renderSaleOptions();
}

function deleteProduct(i) {
  if (!confirm("Eliminar producto?")) return;
  inventory.splice(i, 1);
  saveAll();
  renderInventory();
}

/* ================== OPCIONES DE VENTA ================== */
function renderSaleOptions() {
  saleProductSelect.innerHTML = '<option value="">Seleccione...</option>';

  inventory.forEach((p, i) => {
    saleProductSelect.innerHTML += `
      <option value="product-${i}">🧾 ${p.name}</option>
    `;
  });

  recipes.forEach((r, i) => {
    saleProductSelect.innerHTML += `
      <option value="recipe-${i}">🍨 ${r.name}</option>
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

/* ================== RECETAS ================== */
function renderRecipes() {
  if (!recipesList) return;

  recipesList.innerHTML = "";

  if (recipes.length === 0) {
    recipesList.innerHTML = "<p>No hay recetas creadas.</p>";
    return;
  }

  recipes.forEach((recipe, index) => {
    recipesList.innerHTML += `
      <div class="recipe-card">
        <strong>${recipe.name}</strong>
        <ul>
          ${recipe.items
            .map(i => `<li>${i.insumo}: ${i.qty}</li>`)
            .join("")}
        </ul>
        <button type="button" onclick="deleteRecipe(${index})">Eliminar</button>
      </div>
    `;
  });
}

function deleteRecipe(index) {
  if (!confirm("Eliminar receta?")) return;
  recipes.splice(index, 1);
  saveAll();
  renderRecipes();
  renderSaleOptions();
}

if (recipeForm) {
  recipeForm.addEventListener("submit", e => {
    e.preventDefault();

    const name = document.getElementById("recipeName").value.trim();
    const itemsText = document.getElementById("recipeItems").value.trim();

    if (!name || !itemsText) {
      alert("Completa todos los campos");
      return;
    }

    // FORMATO: Leche:2, Azúcar:1
    const items = itemsText.split(",").map(item => {
      const [insumo, qty] = item.split(":").map(p => p.trim());
      return {
        insumo,
        qty: Number(qty)
      };
    });

    recipes.push({ name, items });
    saveAll();
    renderRecipes();
    renderSaleOptions();
    recipeForm.reset();
  });
}

/* ================== APLICAR RECETA ================== */
function applyRecipe(recipeIndex, saleQty) {
  const recipe = recipes[recipeIndex];

  // Verificar stock
  for (let item of recipe.items) {
    const prod = inventory.find(
      p =>
        p.name.trim().toLowerCase() ===
        item.insumo.trim().toLowerCase()
    );

    if (!prod) {
      alert(`El insumo "${item.insumo}" no existe en inventario`);
      return false;
    }

    if (prod.qty < item.qty * saleQty) {
      alert(`Stock insuficiente de ${prod.name}`);
      return false;
    }
  }

  // Descontar
  recipe.items.forEach(item => {
    const prod = inventory.find(
      p =>
        p.name.trim().toLowerCase() ===
        item.insumo.trim().toLowerCase()
    );
    prod.qty -= item.qty * saleQty;
  });

  return true;
}

/* ================== VENTAS ================== */
saleForm.addEventListener("submit", e => {
  e.preventDefault();

  const value = saleForm.saleProduct.value;
  const qty = Number(saleForm.saleQty.value);
  const price = Number(saleForm.salePrice.value) || 0;

  if (!value || qty <= 0) {
    alert("Venta inválida");
    return;
  }

  const [type, index] = value.split("-");
  let productName = "";

  if (type === "product") {
    const prod = inventory[index];
    if (prod.qty < qty) {
      alert("Stock insuficiente");
      return;
    }
    prod.qty -= qty;
    productName = prod.name;
  }

  if (type === "recipe") {
    const ok = applyRecipe(index, qty);
    if (!ok) return;
    productName = recipes[index].name;
  }

  sales.push({
    date: new Date().toISOString(),
    product: productName,
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
renderRecipes();
renderSaleOptions();
