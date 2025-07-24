const userName = document.querySelector(".user-name");
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
const itemsBox = document.querySelector(".items");
const paginationBox = document.querySelector(".pagination");
const logoutBtn = document.getElementById("logout-btn");
const showLikedProduct = document.querySelector('#showLikedProductBtn');

if (!loggedInUser || loggedInUser.isAdmin) {
    window.location.href = "index.html";
}
userName.textContent = loggedInUser.username;

let items = [];
let currentPage = 1;
const itemsPerPage = 6;
let totalFetchedItems = 0;

document.addEventListener("DOMContentLoaded", initUI);

async function initUI() {
    // setupPagination();
    // await fetchProductsFromApi(30, 0);
    // renderItems();

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
            thumbnail: product.thumbnail
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
        noItemsMsg.textContent = "No items available";
        itemsBox.appendChild(noItemsMsg);
    } else {
        itemsToDisplay.forEach(item => {
            addToDom(item);
        });
    }

    updatePaginationButtons();
}

// function addToDom(item) {
//     const div = document.createElement("div");
//     div.setAttribute("id", item.id);
//     div.classList.add("item");
    
//     if (item.quantity <= 0) {
//         div.classList.add("out-of-stock");
//     }
//     const imageBox = document.createElement("div");
//     imageBox.classList.add("image-box");
//     const img = document.createElement("img");
//     img.src = item.thumbnail || 'https://www.shutterstock.com/image-vector/default-image-icon-vector-missing-600nw-2079504220.jpg';
//     img.alt = item.name || "Product image";
//     imageBox.appendChild(img);

//     const productInfo = document.createElement("div");
//     productInfo.classList.add("product-info");

//     const titleRow = document.createElement("div");
//     titleRow.classList.add("title-row");
//     const title = document.createElement("h3");
//     title.textContent = item.name || "Unnamed Item";
//     const price = document.createElement("span");
//     price.classList.add("price");
//     price.textContent = `₹${(item.price || 0).toFixed(2)}`;
//     titleRow.appendChild(title);
//     titleRow.appendChild(price);

//     const stock = document.createElement("p");
//     stock.classList.add("stock");
//     stock.textContent = `Stock: ${item.quantity || 0}`;

//     const description = document.createElement("p");
//     description.classList.add("description");
    
//     const fullDesc = item.description || "No description available";
//     // const shortDesc = fullDesc.length > 100 ? fullDesc.slice(0, 100) + "..." : fullDesc;
    
//     description.textContent = fullDesc;
    
//     // if (fullDesc.length > 100) {
//     //     description.style.cursor = "pointer";
//     //     let isExpanded = false;
        
//     //     description.addEventListener("click", () => {
//     //         isExpanded = !isExpanded;
//     //         description.textContent = isExpanded ? fullDesc : shortDesc;
//     //     });
//     // }

//     const btnBox = document.createElement("div");
//     btnBox.classList.add("button-box");
//     const cartBtn = document.createElement("button");
//     cartBtn.className = "addToCart";
//     cartBtn.classList.add('button')
//     cartBtn.textContent = "Add to Cart";
    
//     if (item.quantity <= 0) {
//         cartBtn.disabled = true;
//         cartBtn.classList.add("disabled");
//     } else {
//         cartBtn.addEventListener("click", () => addToCart(item.id));
//     }
    
//     btnBox.appendChild(cartBtn);

//     const productDetails = document.createElement('div');
//     productDetails.classList.add('product-details');

//     productDetails.appendChild(titleRow);
//     productDetails.appendChild(stock);
//     productDetails.appendChild(description);
//     productInfo.appendChild(productDetails);
//     productInfo.appendChild(btnBox);

//     const heartIcon = document.createElement('span');
//     heartIcon.classList.add('heart-box');
//     heartIcon.innerHTML = `
//         <label class="wishlist-toggle">
//             <input type="checkbox" class="wishlist-checkbox">
//             <i class="heart-icon fa-solid fa-heart"></i>
//         </label>
//     `;

//     div.appendChild(heartIcon);
//     div.appendChild(imageBox);
//     div.appendChild(productInfo);

//     itemsBox.appendChild(div);
// }

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
    nextBtn.disabled = currentPage === totalPages && items.length >= totalFetchedItems;
}

async function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderItems();
    }
}

async function goToNextPage() {
    const totalPages = Math.ceil(items.length / itemsPerPage);
    
    if (currentPage === totalPages - 1 && items.length >= totalFetchedItems) {
        await fetchProductsFromApi(30, totalFetchedItems);
    }
    
    const newTotalPages = Math.ceil(items.length / itemsPerPage);
    if (currentPage < newTotalPages) {
        currentPage++;
        renderItems();
    }
}

function addToCart(itemId) {
    const item = items.find(i => i.id === itemId);
    
    if (!item || item.quantity <= 0) {
        return;
    }

    if (!loggedInUser.cart) loggedInUser.cart = [];
    
    const existingItem = loggedInUser.cart.find(item => item.id === itemId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        loggedInUser.cart.push({ id: itemId, quantity: 1 });
    }
    
    item.quantity -= 1;
    localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
    renderItems();
}

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
});

showLikedProduct.addEventListener("click", async () => {
    try {
        const response = await fetch(`http://localhost:6565/api/wishlist/${loggedInUser.id}`);
        const data = await response.json();
        
        if (data.success && data.wishlist) {

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
            
            renderItems();
            
            showLikedProduct.textContent = "Show All Products";
            showLikedProduct.removeEventListener("click", arguments.callee);
            showLikedProduct.addEventListener("click", showAllProducts);
        } else {
            alert("No liked products found or error fetching wishlist");
        }
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        alert("Error fetching liked products");
    }
});

async function showAllProducts() {
    items = [];
    totalFetchedItems = 0;
    currentPage = 1;
    
    await fetchProductsFromApi(30, 0);
    renderItems();
    
    showLikedProduct.textContent = "Show Liked Products";
    showLikedProduct.removeEventListener("click", arguments.callee);
    showLikedProduct.addEventListener("click", showLikedProductHandler);
}

const showLikedProductHandler = showLikedProduct.onclick;

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
    const cartBtn = document.createElement("button");
    cartBtn.className = "addToCart";
    cartBtn.classList.add('button')
    cartBtn.textContent = "Add to Cart";
    
    if (item.quantity <= 0) {
        cartBtn.disabled = true;
        cartBtn.classList.add("disabled");
    } else {
        cartBtn.addEventListener("click", () => addToCart(item.id));
    }
    
    btnBox.appendChild(cartBtn);

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
                }
            } else {
                const response = await fetch(`http://localhost:6565/api/wishlist/${loggedInUser.id}/${item.id}`, {
                    method: 'DELETE'
                });
                const result = await response.json();
                if (!result.success) {
                    e.target.checked = true;
                    alert(result.error || "Failed to remove from wishlist");
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