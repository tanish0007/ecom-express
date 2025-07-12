const { readJSON, writeJSON } = require("../utils/fileUtils");

async function fetchCart(req, res) {
    try {
        const userId = parseInt(req.params.userId);
        const carts = await readJSON('carts.json');
        const cartExist = carts.find(cart => cart.userId == userId);

        if (!cartExist) {
            return res.status(404).json({
                success: false,
                error: "Cart not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Fetched Cart Successfully",
            cart: cartExist
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
}

async function addToCart(req, res) {
    try {
        const userId = parseInt(req.params.userId);
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                error: "Product ID is required"
            });
        }

        const products = await readJSON('products.json');
        const carts = await readJSON('carts.json');

        const product = products.find(p => p.id === productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: "Product not found."
            });
        }

        if (product.stock < 1) {
            return res.status(400).json({
                success: false,
                error: "Product is out of stock"
            });
        }

        let userCart = carts.find(c => c.userId === userId);

        if (!userCart) {
            userCart = {
                id: Date.now(),
                userId,
                products: [],
                totalAmount: 0,
                totalQuantity: 0
            };
            carts.push(userCart);
        }

        const existingProduct = userCart.products.find(p => p.id === productId);
        if (existingProduct) {
            existingProduct.quantity += 1;
            existingProduct.totalPrice += product.price;
        } else {
            userCart.products.push({
                id: productId,
                title: product.title,
                quantity: 1,
                totalPrice: product.price,
                thumbnail: product.thumbnail
            });
        }

        userCart.totalQuantity += 1;
        userCart.totalAmount += product.price;

        product.stock -= 1;

        await writeJSON('products.json', products);
        await writeJSON('carts.json', carts);

        return res.status(200).json({
            success: true,
            message: `${product.title} added to cart successfully.`,
            cart: userCart
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
}

async function emptyCart(req, res) {
    try {
        const userId = parseInt(req.params.userId);

        const carts = await readJSON('carts.json');
        const products = await readJSON('products.json');

        const userCart = carts.find(cart => cart.userId === userId);
        if (!userCart) {
            return res.status(404).json({
                success: false,
                error: "User cart not found"
            });
        }

        for (const productInCart of userCart.products) {
            const product = products.find(p => p.id === productInCart.id);
            if (product) {
                product.stock += productInCart.quantity;
            }
        }

        userCart.products = [];
        userCart.totalAmount = 0;
        userCart.totalQuantity = 0;

        await writeJSON('products.json', products);
        await writeJSON('carts.json', carts);

        return res.status(200).json({
            success: true,
            message: "User cart emptied successfully",
            cart: userCart
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
}

async function deleteWholeProduct(req, res) {
    try {
        const userId = parseInt(req.params.userId);
        const productId = parseInt(req.params.productId);

        const carts = await readJSON('carts.json');
        const products = await readJSON('products.json');

        const userCart = carts.find(cart => cart.userId === userId);
        if (!userCart) {
            return res.status(404).json({
                success: false,
                error: "User cart not found"
            });
        }

        const productInUserCart = userCart.products.find(p => p.id === productId);

        if (!productInUserCart) {
            return res.status(404).json({
                success: false,
                error: "Product in User cart not found"
            });
        }

        const product = products.find(p => p.id === productId);
        if (product) {
            product.stock += productInUserCart.quantity;
        }

        userCart.products = userCart.products.filter(p => p.id !== productId);
        userCart.totalQuantity -= productInUserCart.quantity;
        userCart.totalAmount -= productInUserCart.totalPrice;

        await writeJSON('products.json', products);
        await writeJSON('carts.json', carts);

        return res.status(200).json({
            success: true,
            message: "Product removed from cart successfully",
            cart: userCart
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
}

async function updateCart(req, res) {
    try {
        const userId = parseInt(req.params.userId);
        const productId = parseInt(req.params.productId);
        const { operation } = req.body;

        if (!operation) {
            return res.status(400).json({
                success: false,
                error: "Operation is not specified in the request"
            });
        }

        const carts = await readJSON('carts.json');
        const products = await readJSON('products.json');

        const userCart = carts.find(cart => cart.userId === userId);
        if (!userCart) {
            return res.status(404).json({
                success: false,
                error: "User cart not found"
            });
        }

        const productInCart = userCart.products.find(p => p.id === productId);
        if (!productInCart) {
            return res.status(404).json({
                success: false,
                error: "Product not found in user cart"
            });
        }

        const product = products.find(p => p.id === productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: "Product not found in database"
            });
        }

        const op = operation.toLowerCase();

        if (op === 'd' || op === 'dec' || op === 'decrement') {
            if (productInCart.quantity <= 1) {
                userCart.products = userCart.products.filter(p => p.id !== productId);
            } else {
                productInCart.quantity -= 1;
                productInCart.totalPrice -= product.price;
            }

            userCart.totalQuantity -= 1;
            userCart.totalAmount -= product.price;
            product.stock += 1;
        } else if (op === 'i' || op === 'inc' || op === 'increment') {
            if (product.stock <= 0) {
                return res.status(400).json({
                    success: false,
                    error: "Cannot add more. Product stock limit reached."
                });
            }

            productInCart.quantity += 1;
            productInCart.totalPrice += product.price;
            userCart.totalQuantity += 1;
            userCart.totalAmount += product.price;
            product.stock -= 1;
        } else {
            return res.status(400).json({
                success: false,
                error: "Invalid operation"
            });
        }

        await writeJSON('products.json', products);
        await writeJSON('carts.json', carts);

        return res.status(200).json({
            success: true,
            message: `Cart updated successfully: ${op}`,
            cart: userCart
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
}

module.exports = { fetchCart, addToCart, emptyCart, deleteWholeProduct, updateCart };
