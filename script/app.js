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
  renderProductOptions();
}

function renderProductOptions() {
  saleProductSelect.innerHTML = '<option value="">Seleccione...</option>';
  inventory.forEach((p, i) => {
    saleProductSelect.innerHTML += `<option value="${i}">${p.name}</option>`;
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

function deleteProduct(i) {
  if (!confirm("Eliminar producto?")) return;
  inventory.splice(i, 1);
  saveAll();
  renderInventory();
}

/* ================== RECETAS (REALES) ================== */
/*
Ejemplo receta:
Helado de fresa
- Leche 200
- Azúcar 50
- Fresa 100
*/

if (recipes.length === 0) {
  recipes.push({
    name: "Helado de fresa",
    items: [
      { insumo: "Leche", qty: 200 },
      { insumo: "Azúcar", qty: 50 },
      { insumo: "Fresa", qty: 100 }
    ]
  });
  saveAll();
}

/* ================== APLICAR RECETA ================== */
function applyRecipe(productName, saleQty) {
  const recipe = recipes.find(r => r.name === productName);
  if (!recipe) return;

  recipe.items.forEach(item => {
    const prod = inventory.find(p => p.name === item.insumo);
    if (prod) {
      prod.qty -= item.qty * saleQty;
      if (prod.qty < 0) prod.qty = 0;
    }
  });
}

/* ================== VENTAS ================== */
saleForm.addEventListener("submit", e => {
  e.preventDefault();

  const idx = Number(saleForm.saleProduct.value);
  const qty = Number(saleForm.saleQty.value);
  const price = Number(saleForm.salePrice.value) || inventory[idx].price;

  if (!inventory[idx] || qty <= 0) {
    alert("Venta inválida");
    return;
  }

  if (inventory[idx].qty < qty) {
    alert("Stock insuficiente");
    return;
  }

  inventory[idx].qty -= qty;
  applyRecipe(inventory[idx].name, qty);

  sales.push({
    date: new Date().toISOString(),
    product: inventory[idx].name,
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
  sales.forEach((s, i) => {
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

// Función para agregar receta
document.getElementById("recipeForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const recipeName = document.getElementById("recipeName").value.trim();
  const recipeItems = document.getElementById("recipeItems").value.trim().split(",").map(item => {
    const [insumo, qty] = item.split(" ");
    return { insumo, qty: Number(qty) };
  });

  if (!recipeName || recipeItems.length === 0) {
    alert("Por favor ingrese todos los datos correctamente.");
    return;
  }

  // Guardar receta
  recipes.push({ name: recipeName, items: recipeItems });
  saveRecipes();  // Guarda en localStorage

  // Limpiar formulario
  document.getElementById("recipeForm").reset();
  alert("Receta guardada correctamente");

  // Mostrar la receta (opcional)
  renderRecipes();
});

// Función para renderizar las recetas (mostrar las recetas creadas)
function renderRecipes() {
  const recipeList = document.getElementById("recipesList");
  recipeList.innerHTML = "";

  recipes.forEach(recipe => {
    recipeList.innerHTML += `
      <div class="recipe">
        <h4>${recipe.name}</h4>
        <ul>
          ${recipe.items.map(item => `<li>${item.insumo}: ${item.qty} unidades</li>`).join('')}
        </ul>
      </div>
    `;
  });
}

// Llamar a la función de renderizado al cargar la página
renderRecipes();

/* ================== RECETAS ================== */

// Guardar recetas
function saveRecipes() {
  localStorage.setItem("michi_recipes", JSON.stringify(recipes));
}

// Renderizar recetas
function renderRecipes() {
  const list = document.getElementById("recipesList");
  if (!list) return;

  list.innerHTML = "";

  if (recipes.length === 0) {
    list.innerHTML = "<p>No hay recetas creadas.</p>";
    return;
  }

  recipes.forEach((recipe, index) => {
    const div = document.createElement("div");
    div.className = "recipe-card";
    div.innerHTML = `
      <strong>${recipe.name}</strong>
      <ul>
        ${recipe.items.map(i => `<li>${i.insumo}: ${i.qty}</li>`).join("")}
      </ul>
      <button class="btn ghost" onclick="deleteRecipe(${index})">Eliminar</button>
    `;
    list.appendChild(div);
  });
}

// Eliminar receta
function deleteRecipe(index) {
  if (!confirm("Eliminar receta?")) return;
  recipes.splice(index, 1);
  saveRecipes();
  renderRecipes();
}

// Guardar receta desde formulario
const recipeForm = document.getElementById("recipeForm");

if (recipeForm) {
  recipeForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("recipeName").value.trim();
    const itemsText = document.getElementById("recipeItems").value.trim();

    if (!name || !itemsText) {
      alert("Completa todos los campos");
      return;
    }

    const items = itemsText.split(",").map(item => {
      const parts = item.trim().split(" ");
      return {
        insumo: parts.slice(0, -1).join(" "),
        qty: Number(parts[parts.length - 1])
      };
    });

    recipes.push({ name, items });
    saveRecipes();
    renderRecipes();

    recipeForm.reset();
    alert("Receta guardada correctamente ✅");
  });
}

// Cargar recetas al iniciar
renderRecipes();
