const itemsBox = document.querySelector(".items");
const adminName = document.querySelector(".admin-name");
const logoutBtn = document.querySelector("#logout-btn");
const addBtn = document.querySelector("#addBtn");
const buttons = document.querySelector(".buttons");

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

// -------------------- Fetch Products --------------------
async function fetchProducts() {
    try {
        const res = await fetch("http://localhost:6565/api/products");
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

// -------------------- Render Items --------------------
function renderItems(items) {
    itemsBox.innerHTML = "";
    if (items.length === 0) {
        itemsBox.innerHTML = "<p>No products found</p>";
        return;
    }

    items.forEach(product => {
        const div = document.createElement("div");
        div.className = "item";
        div.dataset.id = product.id;
        div.innerHTML = `
            <div class="image-box">
                <img src="${product.thumbnail || 'https://www.shutterstock.com/image-vector/default-image-icon-vector-missing-600nw-2079504220.jpg'}" alt="${product.title}">
            </div>
            <div class="product-info">
                <div class="title-row">
                    <h3>${product.title}</h3>
                    <span class="price">₹${product.price}</span>
                </div>
                <p class="stock">Stock: ${product.stock}</p>
                <p class="description">${truncateDescription(product.description)}</p>
                <div class="button-box">
                    <button class="button update-btn">Update</button>
                    <button class="button button-danger delete-btn">Delete</button>
                </div>
            </div>
        `;

        div.querySelector(".delete-btn").addEventListener("click", () => handleDelete(product.id));
        div.querySelector(".update-btn").addEventListener("click", () => populateFormForUpdate(product));
        
        itemsBox.appendChild(div);
    });
}

// Helper function to truncate long descriptions
function truncateDescription(desc, maxLength = 100) {
    return desc.length > maxLength ? `${desc.substring(0, maxLength)}...` : desc;
}

// -------------------- Form Handling --------------------
let currentEditingId = null;

addBtn.addEventListener("click", async () => {
    const productData = {
        title: titleInput.value.trim(),
        price: parseFloat(priceInput.value),
        stock: parseInt(stockInput.value),
        description: descInput.value.trim(),
        thumbnail: thumbInput.value.trim() || "default-image.jpg"
    };

    // Validation
    if (!productData.title || isNaN(productData.price) || isNaN(productData.stock) || !productData.description) {
        alert("Please fill all fields with valid values");
        return;
    }

    try {
        const url = currentEditingId 
            ? `http://localhost:6565/api/products/${currentEditingId}`
            : "http://localhost:6565/api/products";
            
        const method = currentEditingId ? "PATCH" : "POST";
        
        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productData)
        });
        
        const data = await res.json();
        
        if (data.success) {
            alert(currentEditingId ? "Product updated!" : "Product added!");
            clearForm();
            fetchProducts();
        } else {
            alert(data.error || "Operation failed");
        }
    } catch (err) {
        console.error(err);
        alert("Server error");
    }
});

// Populate form for editing
function populateFormForUpdate(product) {
    // Fill form
    titleInput.value = product.title;
    priceInput.value = product.price;
    stockInput.value = product.stock;
    descInput.value = product.description;
    thumbInput.value = product.thumbnail;
    currentEditingId = product.id;
    
    // Update UI state
    addBtn.textContent = "Update Product";
    disableAllActionButtons();
    
    // Add cancel button if not exists
    if (!document.querySelector(".cancel-btn")) {
        const cancelBtn = document.createElement("button");
        cancelBtn.className = "button cancel-btn";
        cancelBtn.textContent = "Cancel";
        buttons.appendChild(cancelBtn);
        
        cancelBtn.addEventListener("click", () => {
            clearForm();
            cancelBtn.remove();
            enableAllActionButtons();
        });
    }
}

// -------------------- Delete Product --------------------
async function handleDelete(productId) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    try {
        const res = await fetch(`http://localhost:6565/api/products/${productId}`, {
            method: "DELETE"
        });
        
        const data = await res.json();
        
        if (data.success) {
            alert("Product deleted");
            fetchProducts();
        } else {
            alert(data.error || "Delete failed");
        }
    } catch (err) {
        console.error(err);
        alert("Server error");
    }
}

// -------------------- Helper Functions --------------------
function clearForm() {
    titleInput.value = "";
    priceInput.value = "";
    stockInput.value = "";
    descInput.value = "";
    thumbInput.value = "";
    currentEditingId = null;
    addBtn.textContent = "Add Product";
    
    // Remove cancel button if exists
    const cancelBtn = document.querySelector(".cancel-btn");
    if (cancelBtn) cancelBtn.remove();
}

function disableAllActionButtons() {
    document.querySelectorAll(".update-btn, .delete-btn").forEach(btn => {
        btn.disabled = true;
        btn.classList.add("disabled");
    });
}

function enableAllActionButtons() {
    document.querySelectorAll(".update-btn, .delete-btn").forEach(btn => {
        btn.disabled = false;
        btn.classList.remove("disabled");
    });
}

// Initialize
fetchProducts();