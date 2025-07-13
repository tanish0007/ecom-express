// admin.js
const itemsBox = document.querySelector(".items");
const adminName = document.querySelector(".admin-name");
const logoutBtn = document.querySelector("#logout-btn");
const addBtn = document.querySelector("#addBtn");

const titleInput = document.querySelector("#title");
const priceInput = document.querySelector("#price");
const stockInput = document.querySelector("#stock");
const descInput = document.querySelector("#description");
const thumbInput = document.querySelector("#thumbnail");

const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
if (!loggedInUser || !loggedInUser.isAdmin) {
    window.location.href = "index.html";
}
adminName.textContent = loggedInUser.username;

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
});

async function fetchProducts() {
    try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.success) {
            renderItems(data.products);
        } else {
            itemsBox.innerHTML = "<p>Failed to fetch products</p>";
        }
    } catch (err) {
        console.error(err);
        itemsBox.innerHTML = "<p>Error fetching products</p>";
    }
}

function renderItems(items) {
    itemsBox.innerHTML = "";
    if (items.length === 0) {
        itemsBox.innerHTML = "<p>No products found</p>";
        return;
    }

    items.forEach(product => {
        const div = document.createElement("div");
        div.className = "item";
        div.innerHTML = `
            <img src="${product.thumbnail || 'https://via.placeholder.com/100'}" alt="${product.title}" />
            <h3>${product.title}</h3>
            <p><strong>Price:</strong> ₹${product.price}</p>
            <p><strong>Stock:</strong> ${product.stock}</p>
            <p><strong>Description:</strong> ${product.description}</p>
            <div class="button-box">
                <button class="button updateBtn">Update</button>
                <button class="button button-danger deleteBtn">Delete</button>
            </div>
        `;

        div.querySelector(".deleteBtn").addEventListener("click", () => handleDelete(product.id));
        div.querySelector(".updateBtn").addEventListener("click", () => fillFormForUpdate(product));

        itemsBox.appendChild(div);
    });
}

let editingProductId = null;

addBtn.addEventListener("click", async () => {
    const title = titleInput.value.trim();
    const price = parseFloat(priceInput.value);
    const stock = parseInt(stockInput.value);
    const description = descInput.value.trim();
    const thumbnail = thumbInput.value.trim();

    if (!title || !price || !stock || !description) {
        alert("Please fill all required fields");
        return;
    }

    const payload = { title, price, stock, description, thumbnail };

    try {
        let res, data;
        if (editingProductId) {
            res = await fetch(`/api/products/${editingProductId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        } else {
            res = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        }

        data = await res.json();

        if (data.success) {
            alert(editingProductId ? "Product updated" : "Product added");
            clearForm();
            fetchProducts();
        } else {
            alert(data.error || "Failed to submit");
        }
    } catch (err) {
        console.error(err);
        alert("Server error");
    }
});

function fillFormForUpdate(product) {
    titleInput.value = product.title;
    priceInput.value = product.price;
    stockInput.value = product.stock;
    descInput.value = product.description;
    thumbInput.value = product.thumbnail || "";

    editingProductId = product.id;
    addBtn.innerHTML = '<i class="fa-solid fa-save"></i> Save Changes';
}

async function handleDelete(productId) {
    const confirmDelete = confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;

    try {
        const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) {
            alert("Product deleted");
            fetchProducts();
        } else {
            alert(data.error || "Failed to delete");
        }
    } catch (err) {
        console.error(err);
        alert("Server error");
    }
}

function clearForm() {
    titleInput.value = "";
    priceInput.value = "";
    stockInput.value = "";
    descInput.value = "";
    thumbInput.value = "";
    editingProductId = null;
    addBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add Item';
}

fetchProducts();
