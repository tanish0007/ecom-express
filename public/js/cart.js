document.addEventListener('DOMContentLoaded', async () => {
    const userName = document.querySelector(".user-name");
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const logoutBtn = document.getElementById("logout-btn");
    const backButton = document.getElementById("backButton");
    const heroSection = document.querySelector(".hero");

    if (!loggedInUser || loggedInUser.isAdmin) {
        window.location.href = "index.html";
    }
    userName.textContent = loggedInUser.username;

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("loggedInUser");
        window.location.href = "index.html";
    });

    backButton.addEventListener("click", () => {
        window.location.href = "user.html";
    });

    // Base API URL - Updated to use '/cart' instead of '/carts'
    const API_BASE_URL = 'http://localhost:6565/api/cart';

    // Fetch user's cart
    async function fetchUserCart() {
        try {
            const response = await fetch(`${API_BASE_URL}/${loggedInUser.id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch cart');
            }
            const data = await response.json();
            return data.cart;
        } catch (error) {
            console.error('Error fetching cart:', error);
            return null;
        }
    }

    // Render cart items
    async function renderCart() {
        const cart = await fetchUserCart();
        
        if (!cart || cart.products.length === 0) {
            heroSection.innerHTML = `
                <h2 class="cart-title">Your Cart</h2>
                <div class="empty-cart">Your cart is empty</div>
            `;
            return;
        }

        let cartHTML = `
            <h2 class="cart-title">Your Cart</h2>
            <div class="cart-items">
        `;

        cart.products.forEach(product => {
            cartHTML += `
                <div class="cart-item" data-product-id="${product.id}">
                    <img src="${product.thumbnail}" alt="${product.title}" class="item-image">
                    <div class="item-details">
                        <h3 class="item-title">${product.title}</h3>
                        <div class="item-price">$${product.totalPrice.toFixed(2)}</div>
                        <div class="quantity-controls">
                            <button class="quantity-btn decrement-btn">-</button>
                            <span class="quantity-value">${product.quantity}</span>
                            <button class="quantity-btn increment-btn">+</button>
                        </div>
                    </div>
                    <button class="delete-btn" title="Remove item">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
        });

        cartHTML += `
            </div>
            <div class="cart-summary">
                <div class="total-amount">Total: $${cart.totalAmount.toFixed(2)}</div>
                <button class="checkout-btn">Proceed to Checkout</button>
            </div>
        `;

        heroSection.innerHTML = cartHTML;

        // Add event listeners to all buttons
        document.querySelectorAll('.decrement-btn').forEach(btn => {
            btn.addEventListener('click', handleQuantityChange);
        });

        document.querySelectorAll('.increment-btn').forEach(btn => {
            btn.addEventListener('click', handleQuantityChange);
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', handleDeleteProduct);
        });

        document.querySelector('.checkout-btn')?.addEventListener('click', handleCheckout);
    }

    // Handle quantity changes
    async function handleQuantityChange(e) {
        const productItem = e.target.closest('.cart-item');
        const productId = parseInt(productItem.dataset.productId);
        const isIncrement = e.target.classList.contains('increment-btn');

        try {
            const response = await fetch(`${API_BASE_URL}/${loggedInUser.id}/${productId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    operation: isIncrement ? 'inc' : 'dec'
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update cart');
            }

            if (data.success) {
                // Re-render the cart after successful update
                await renderCart();
            } else {
                alert(data.error || 'Failed to update cart');
            }
        } catch (error) {
            console.error('Error updating cart:', error);
            alert(error.message || 'Failed to update cart. Please try again.');
        }
    }

    // Handle product deletion
    async function handleDeleteProduct(e) {
        const productItem = e.target.closest('.cart-item');
        const productId = parseInt(productItem.dataset.productId);

        if (!confirm('Are you sure you want to remove this item from your cart?')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/${loggedInUser.id}/${productId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to remove product from cart');
            }

            if (data.success) {
                // Re-render the cart after successful deletion
                await renderCart();
            } else {
                alert(data.error || 'Failed to remove product');
            }
        } catch (error) {
            console.error('Error removing product:', error);
            alert(error.message || 'Failed to remove product. Please try again.');
        }
    }

    // Handle checkout
    async function handleCheckout() {
        try {
            // First empty the cart
            const emptyResponse = await fetch(`${API_BASE_URL}/${loggedInUser.id}`, {
                method: 'DELETE'
            });

            const emptyData = await emptyResponse.json();

            if (!emptyResponse.ok) {
                throw new Error(emptyData.error || 'Checkout failed - could not empty cart');
            }

            if (emptyData.success) {
                alert('Checkout successful! Your order has been placed.');
                await renderCart(); // Refresh the cart which should now be empty
            } else {
                alert(emptyData.error || 'Checkout failed');
            }
        } catch (error) {
            console.error('Error during checkout:', error);
            alert(error.message || 'Checkout failed. Please try again.');
        }
    }

    // Initial render
    await renderCart();
});