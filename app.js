let inventory = JSON.parse(localStorage.getItem("inventory")) || [];

const form = document.getElementById("productForm");
const table = document.getElementById("inventoryTable");

function renderInventory() {
    table.innerHTML = "";

    inventory.forEach((item, index) => {
        let total = item.qty * item.price;

        table.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>$${item.price.toLocaleString()}</td>
                <td>$${total.toLocaleString()}</td>
                <td><button onclick="removeItem(${index})">Eliminar</button></td>
            </tr>
        `;
    });
}

form.addEventListener("submit", (e) => {
    e.preventDefault();

    let name = document.getElementById("productName").value;
    let qty = parseInt(document.getElementById("productQty").value);
    let price = parseInt(document.getElementById("productPrice").value);

    inventory.push({ name, qty, price });
    localStorage.setItem("inventory", JSON.stringify(inventory));

    form.reset();
    renderInventory();
});

function removeItem(index) {
    inventory.splice(index, 1);
    localStorage.setItem("inventory", JSON.stringify(inventory));
    renderInventory();
}

renderInventory();

