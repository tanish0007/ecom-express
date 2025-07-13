const { readJSON, writeJSON } = require("../utils/fileUtils");

async function getAllProducts(req, res) {
    try {
        const { limit, skip } = req.query;
        const products = await readJSON('products.json');

        if (!limit && !skip) {
            return res.status(200).json({
                success: true,
                total: products.length,
                returned: products.length,
                products,
                limit: 0,
                skip: 0
            });
        }

        const LIMIT = parseInt(limit) || products.length;
        const SKIP = parseInt(skip) || 0;

        const paginatedProducts = products.slice(SKIP, SKIP + LIMIT);
        return res.status(200).json({
            success: true,
            total: products.length,
            returned: paginatedProducts.length,
            products: paginatedProducts,
            limit: LIMIT,
            skip: SKIP
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
}

async function getProduct(req, res) {
    try {
        const id = parseInt(req.params.id);
        const products = await readJSON('products.json');
        const productExist = products.find(product => product.id === id);
        if (!productExist) {
            return res.status(404).json({
                success: false,
                error: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            product: productExist
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
}

async function createProduct(req, res) {
    try {
        const { title, price, stock, description, thumbnail } = req.body;
        if (!title || !price || !stock || !description) {
            return res.status(400).json({
                success: false,
                error: "Required fields are missing"
            });
        }

        const products = await readJSON('products.json');
        const existingProductIndex = products.findIndex(p => p.title === title);

        if (existingProductIndex !== -1) {
            products[existingProductIndex].stock += 1;
            await writeJSON('products.json', products);

            return res.status(200).json({
                success: true,
                message: "Product already exists - stock incremented by 1",
                product: products[existingProductIndex]
            });
        }

        const newProduct = {
            id: Date.now(),
            title,
            price,
            stock,
            description,
            thumbnail: thumbnail || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoB2xlLb4CRNndJY9K1R2GNFau0M6PSvVkW85q5MOQbPjQKodBrTT47KgiGDn6kY2YHBM&usqp=CAU"
        };

        products.push(newProduct);
        await writeJSON('products.json', products);
        
        return res.status(201).json({
            success: true,
            message: "Product added successfully",
            product: newProduct
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
}

async function updateProduct(req, res) {
    try {
        const productID = parseInt(req.params.id);
        const { title, price, description, stock, thumbnail } = req.body;
        
        if (!title || !price || !description || !stock) {
            return res.status(400).json({
                success: false,
                error: "Bad request - required fields are missing"
            });
        }

        const products = await readJSON('products.json');
        const productExist = products.find(p => p.id === productID);

        if (!productExist) {
            return res.status(404).json({
                success: false,
                error: "No product found with this id"
            });
        }

        const existproductIndex = products.findIndex(p => p.id === productExist.id);

        // Check for duplicate title (excluding current product)
        const titleAlreadyExist = products.find(p => 
            p.title === title && p.id !== productID
        );
        
        if (titleAlreadyExist) {
            return res.status(409).json({
                success: false,
                error: "Product with this title already exists"
            });
        }

        // Update product
        products[existproductIndex] = {
            ...products[existproductIndex],
            title,
            price,
            description,
            stock,
            thumbnail: thumbnail || products[existproductIndex].thumbnail
        };

        await writeJSON('products.json', products);
        
        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: products[existproductIndex]
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
}

async function deleteProduct(req, res) {
    try {
        const productId = parseInt(req.params.id);
        const products = await readJSON('products.json');
        const productIndex = products.findIndex(product => product.id === productId);

        if (productIndex === -1) {
            return res.status(404).json({
                success: false,
                error: "Product not found"
            });
        }

        const [deletedProduct] = products.splice(productIndex, 1);
        await writeJSON("products.json", products);

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully",
            product: {
                id: deletedProduct.id,
                title: deletedProduct.title
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
}

module.exports = {
    getAllProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
};