const userName = document.querySelector(".user-name");
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
const itemsBox = document.querySelector(".items");
const paginationBox = document.querySelector(".pagination");
const logoutBtn = document.getElementById("logout-btn");
const showLikedProduct = document.querySelector('#showLikedProductBtn');
const showCartButton = document.querySelector('#showCartButton');

if (!loggedInUser || loggedInUser.isAdmin) {
    window.location.href = "index.html";
}
userName.textContent = loggedInUser.username;

let items = [];
let currentPage = 1;
const itemsPerPage = 6;
let totalFetchedItems = 0;
let showingLikedProducts = false;

document.addEventListener("DOMContentLoaded", initUI);

showCartButton.addEventListener("click", () => {
    window.location.href = "cart.html";
});

async function initUI() {
    setupPagination();
    await fetchProductsFromApi(30, 0);
    await checkLikedProducts();
    renderItems();
}

async function fetchProductsFromApi(limit, skip) {
    try {
        const res = await fetch(`http://localhost:6565/api/products?limit=${limit}&skip=${skip}`);
        const data = await res.json();
        console.log(data);
        const newItems = data.products.map(product => ({
            id: product.id,
            name: product.title,
            price: product.price,
            description: product.description,
            quantity: product.stock,
            thumbnail: product.thumbnail,
            isLiked: false
        }));
        
        items = [...items, ...newItems];
        totalFetchedItems += newItems.length;
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

function renderItems() {
    itemsBox.innerHTML = '';
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, items.length);
    const itemsToDisplay = items.slice(startIndex, endIndex);

    if(itemsToDisplay.length === 0) {
        const noItemsMsg = document.createElement("div");
        noItemsMsg.className = "no-items";
        noItemsMsg.textContent = showingLikedProducts 
            ? "No liked products available" 
            : "No items available";
        itemsBox.appendChild(noItemsMsg);
    } else {
        itemsToDisplay.forEach(item => {
            addToDom(item);
        });
    }

    updatePaginationButtons();
}

function setupPagination() {
    if (!paginationBox) return;
    
    paginationBox.innerHTML = '';
    
    const prevBtn = document.createElement("button");
    prevBtn.innerText = "Prev";
    prevBtn.classList.add('button');
    prevBtn.setAttribute("id", "prevBtn");
    prevBtn.addEventListener("click", goToPrevPage);
    
    const nextBtn = document.createElement("button");
    nextBtn.innerText = "Next";
    nextBtn.classList.add('button')
    nextBtn.setAttribute("id", "nextBtn");
    nextBtn.addEventListener("click", goToNextPage);
    
    const pageInfo = document.createElement("span");
    pageInfo.setAttribute("id", "pageInfo");
    pageInfo.textContent = "Page 1 of 1";
    
    paginationBox.appendChild(prevBtn);
    paginationBox.appendChild(pageInfo);
    paginationBox.appendChild(nextBtn);
}

function updatePaginationButtons() {
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const pageInfo = document.getElementById("pageInfo");
    
    if (!prevBtn || !nextBtn || !pageInfo) return;
    
    const totalPages = Math.ceil(items.length / itemsPerPage);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages && (showingLikedProducts || items.length >= totalFetchedItems);
}

async function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderItems();
    }
}

async function goToNextPage() {
    const totalPages = Math.ceil(items.length / itemsPerPage);
    
    if (!showingLikedProducts && currentPage === totalPages - 1 && items.length >= totalFetchedItems) {
        await fetchProductsFromApi(30, totalFetchedItems);
    }
    
    const newTotalPages = Math.ceil(items.length / itemsPerPage);
    if (currentPage < newTotalPages) {
        currentPage++;
        renderItems();
    }
}

async function addToCart(itemId) {
    const item = items.find(i => i.id === itemId);
    
    if (!item || item.quantity <= 0) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:6565/api/cart/${loggedInUser.id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ productId: itemId })
        });
        
        const result = await response.json();
        if (result.success) {
            // Update local state
            if (!loggedInUser.cart) loggedInUser.cart = [];
            
            const existingItem = loggedInUser.cart.find(ci => ci.id === itemId);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                loggedInUser.cart.push({ id: itemId, quantity: 1 });
            }
            
            item.quantity -= 1;
            localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
            renderItems();
        } else {
            alert(result.error || "Failed to add to cart");
        }
    } catch (error) {
        console.error("Error adding to cart:", error);
        alert("Error adding to cart");
    }
}

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
});

showLikedProduct.addEventListener("click", async function() {
    if (showingLikedProducts) {
        await showAllProducts();
    } else {
        await showLikedProducts();
    }
});

async function showLikedProducts() {
    try {
        const response = await fetch(`http://localhost:6565/api/wishlist/${loggedInUser.id}`);
        const data = await response.json();
        
        if (data.success) {
            items = data.wishlist.products.map(product => ({
                id: product.id,
                name: product.title,
                price: product.price,
                description: product.description,
                quantity: product.stock,
                thumbnail: product.thumbnail,
                isLiked: true 
            }));
            
            currentPage = 1;
            showingLikedProducts = true;
            showLikedProduct.textContent = "Show All Products";
            renderItems();
        } else {
            alert("No liked products found or error fetching wishlist");
        }
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        alert("Error fetching liked products");
    }
}

async function showAllProducts() {
    items = [];
    totalFetchedItems = 0;
    currentPage = 1;
    showingLikedProducts = false;
    
    await fetchProductsFromApi(30, 0);
    await checkLikedProducts();
    showLikedProduct.innerHTML = "Show Liked Products <i class='fa-solid fa-heart'></i>";
    renderItems();
}

function addToDom(item) {
    const div = document.createElement("div");
    div.setAttribute("id", item.id);
    div.classList.add("item");
    
    if (item.quantity <= 0) {
        div.classList.add("out-of-stock");
    }
    
    const imageBox = document.createElement("div");
    imageBox.classList.add("image-box");
    const img = document.createElement("img");
    img.src = item.thumbnail || 'https://www.shutterstock.com/image-vector/default-image-icon-vector-missing-600nw-2079504220.jpg';
    img.alt = item.name || "Product image";
    imageBox.appendChild(img);

    const productInfo = document.createElement("div");
    productInfo.classList.add("product-info");

    const titleRow = document.createElement("div");
    titleRow.classList.add("title-row");
    const title = document.createElement("h3");
    title.textContent = item.name || "Unnamed Item";
    const price = document.createElement("span");
    price.classList.add("price");
    price.textContent = `₹${(item.price || 0).toFixed(2)}`;
    titleRow.appendChild(title);
    titleRow.appendChild(price);

    const stock = document.createElement("p");
    stock.classList.add("stock");
    stock.textContent = `Stock: ${item.quantity || 0}`;

    const description = document.createElement("p");
    description.classList.add("description");
    description.textContent = item.description || "No description available";

    const btnBox = document.createElement("div");
    btnBox.classList.add("button-box");

    // Check if item is in cart
    const cartItem = loggedInUser.cart?.find(ci => ci.id === item.id);
    const quantityInCart = cartItem?.quantity || 0;

    if (quantityInCart > 0) {
        // Create quantity controls
        const quantityControls = document.createElement("div");
        quantityControls.className = "quantity-controls";
        
        const decrementBtn = document.createElement("button");
        decrementBtn.className = "quantity-btn";
        decrementBtn.innerHTML = '<i class="fa-solid fa-minus"></i>';
        decrementBtn.disabled = quantityInCart <= 1;
        
        const quantityDisplay = document.createElement("span");
        quantityDisplay.className = "quantity-display";
        quantityDisplay.textContent = quantityInCart;
        
        const incrementBtn = document.createElement("button");
        incrementBtn.className = "quantity-btn";
        incrementBtn.innerHTML = '<i class="fa-solid fa-plus"></i>';
        incrementBtn.disabled = item.quantity <= 0;
        
        // Add event listeners
        decrementBtn.addEventListener("click", async () => {
            try {
                const response = await fetch(`http://localhost:6565/api/cart/${loggedInUser.id}/${item.id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ operation: "decrement" })
                });
                
                const result = await response.json();
                if (result.success) {
                    // Update local state
                    if (cartItem.quantity <= 1) {
                        loggedInUser.cart = loggedInUser.cart.filter(ci => ci.id !== item.id);
                    } else {
                        cartItem.quantity -= 1;
                    }
                    item.quantity += 1;
                    localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
                    renderItems();
                } else {
                    alert(result.error || "Failed to update cart");
                }
            } catch (error) {
                console.error("Error updating cart:", error);
                alert("Error updating cart");
            }
        });
        
        incrementBtn.addEventListener("click", async () => {
            try {
                if (item.quantity <= 0) {
                    alert("No more stock available");
                    return;
                }
                
                const response = await fetch(`http://localhost:6565/api/cart/${loggedInUser.id}/${item.id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ operation: "increment" })
                });
                
                const result = await response.json();
                if (result.success) {
                    // Update local state
                    if (cartItem) {
                        cartItem.quantity += 1;
                    } else {
                        loggedInUser.cart.push({
                            id: item.id,
                            quantity: 1
                        });
                    }
                    item.quantity -= 1;
                    localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
                    renderItems();
                } else {
                    alert(result.error || "Failed to update cart");
                }
            } catch (error) {
                console.error("Error updating cart:", error);
                alert("Error updating cart");
            }
        });
        
        quantityControls.appendChild(decrementBtn);
        quantityControls.appendChild(quantityDisplay);
        quantityControls.appendChild(incrementBtn);
        btnBox.appendChild(quantityControls);
        
        // Add view cart button
        const viewCartBtn = document.createElement("button");
        viewCartBtn.className = "view-cart-btn button";
        viewCartBtn.innerHTML = '<i class="fa-solid fa-cart-shopping"></i> View Cart';
        viewCartBtn.addEventListener("click", () => {
            window.location.href = "cart.html";
        });
        btnBox.appendChild(viewCartBtn);
    } else {
        // Regular add to cart button
        const cartBtn = document.createElement("button");
        cartBtn.className = "addToCart button";
        cartBtn.textContent = "Add to Cart";
        
        if (item.quantity <= 0) {
            cartBtn.disabled = true;
            cartBtn.classList.add("disabled");
        } else {
            cartBtn.addEventListener("click", () => addToCart(item.id));
        }
        
        btnBox.appendChild(cartBtn);
    }

    const productDetails = document.createElement('div');
    productDetails.classList.add('product-details');

    productDetails.appendChild(titleRow);
    productDetails.appendChild(stock);
    productDetails.appendChild(description);
    productInfo.appendChild(productDetails);
    productInfo.appendChild(btnBox);

    const heartIcon = document.createElement('span');
    heartIcon.classList.add('heart-box');
    heartIcon.innerHTML = `
        <label class="wishlist-toggle">
            <input type="checkbox" class="wishlist-checkbox" ${item.isLiked ? 'checked' : ''}>
            <i class="heart-icon fa-solid fa-heart"></i>
        </label>
    `;

    const checkbox = heartIcon.querySelector('.wishlist-checkbox');
    checkbox.addEventListener('change', async (e) => {
        try {
            if (e.target.checked) {
                const response = await fetch(`http://localhost:6565/api/wishlist/${loggedInUser.id}/${item.id}`, {
                    method: 'POST'
                });
                const result = await response.json();
                if (!result.success) {
                    e.target.checked = false;
                    alert(result.error || "Failed to add to wishlist");
                } else {
                    item.isLiked = true;
                }
            } else {
                const response = await fetch(`http://localhost:6565/api/wishlist/${loggedInUser.id}/${item.id}`, {
                    method: 'DELETE'
                });
                const result = await response.json();
                if (!result.success) {
                    e.target.checked = true;
                    alert(result.error || "Failed to remove from wishlist");
                } else {
                    item.isLiked = false;
                    if (showingLikedProducts) {
                        items = items.filter(i => i.id !== item.id);
                        renderItems();
                    }
                }
            }
        } catch (error) {
            console.error("Error updating wishlist:", error);
            e.target.checked = !e.target.checked;
            alert("Error updating wishlist");
        }
    });

    div.appendChild(heartIcon);
    div.appendChild(imageBox);
    div.appendChild(productInfo);

    itemsBox.appendChild(div);
}

async function checkLikedProducts() {
    try {
        const response = await fetch(`http://localhost:6565/api/wishlist/${loggedInUser.id}`);
        const data = await response.json();
        
        if (data.success && data.wishlist) {
            const likedProductIds = data.wishlist.products.map(p => p.id);
            items.forEach(item => {
                item.isLiked = likedProductIds.includes(item.id);
            });
        }
    } catch (error) {
        console.error("Error checking liked products:", error);
    }
}