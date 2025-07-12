const { readJSON, writeJSON } = require("../utils/fileUtils");

async function getAllProducts (req, res){
    try{
        const { limit, skip } = req.query;
        const products = await readJSON('products.json');

        if(!limit && !skip){
            return res.status(200).json({
                success: true,
                total: products.length,
                returned: products.length,
                products,
                limit: 0,
                skip: 0
            })
        }

        const LIMIT = parseInt(limit) || 0;
        const SKIP = parseInt(skip) || 0;

        const paginatedProducts = products.slice(SKIP, SKIP+LIMIT);
        return res.status(200).json({
            success: true,
            total: products.length,
            returned: paginatedProducts.length,
            products: paginatedProducts,
            limit: LIMIT,
            skip: SKIP
        })

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        })
    }
}

async function getProduct (req, res) {
    try{
        const id = parseInt(req.params.id);
        const products = await readJSON('products.json');
        const productExist = products.find(product => product.id === id);
        if(!productExist){
            return res.status(404).json({
                success : false,
                error : "Product not found"
            })
        }

        return res.status(200).json({
            success: true,
            product: productExist
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        })
    }
}

async function createProduct (req, res) {
    try{
        const { title, price, stock, description , imageURL} = req.body;
        if(!title || !price || !stock || !description ){
            return res.status(400).json({
                success: false,
                error: "Required fields are missing"
            })
        }
        const products = await readJSON('products.json');

        let productExist = null;
        let existingProductIndex;
        for(let i=0; i < products.length; i++){
            if(products[i].title === title){
                productExist = products[i];
                existingProductIndex = i;
            }
        }

        if(productExist){
            products[existingProductIndex].stock+= stock;
            await writeJSON('products.json',products);

            return res.status(200).json({
                success: true,
                message: "Product alrady exists, it's stock is incremented",
                product: productExist
            })
        }

        const newProduct = { id: Date.now(), title, price, stock, description, imageURL }
        products.push(newProduct);
        await writeJSON('products.json', products);
        return res.status(201).json({
            success: true,
            message: "Product added successfully",
            product: newProduct
        })

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        })
    }
}

async function updateProduct (req, res){
    try{
        const productID = parseInt(req.params.id);
        const { title, price, description, stock, imageURL} = req.body;
        if(!title || !price || !description || !stock ){
            return res.status(400).json({
                success: false,
                error: "Bad request, No valid update fields are provided"
            })
        }
        const products = await readJSON('products.json');
        const productExist = products.find(p => p.id === productID);

        if(!productExist){
            return res.status(404).json({
                success: false,
                error: "No product found with this id"
            })
        }

        const existproductIndex = products.findIndex(p => p.id === productExist.id);

        const titleAlreadyExist = products.find(p => p.title === title && productExist.title !== title);
        if(titleAlreadyExist){
            return res.status(409).json({
                success: false,
                error: "Unauthorized, trying to add title of product which already exists"
            })
        }

        products[existproductIndex].title = title;
        products[existproductIndex].price = price;
        products[existproductIndex].description = description;
        products[existproductIndex].stock = stock;
        products[existproductIndex].imageURL = imageURL || products[existproductIndex].imageURL;

        await writeJSON('products.json', products);
        
        return res.status(200).json({
            success : true,
            message: "Product updated",
            product: products[existproductIndex]
        })

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        })
    }
}

async function deleteProduct (req, res) {
    try{
        const productId = parseInt(req.params.id);
        const products = await readJSON('products.json');
        const productIndex = products.findIndex(product => product.id === productId);

        if(productIndex === -1){
            return res.status(404).json({
                success: false,
                error: "Product not found"
            })
        }

        const [deleteProduct] = products.splice(productIndex, 1);
        await writeJSON("products.json", products);

        return res.status(200).json({
            success: true,
            message: "Item deleted successfully",
            product: {
                id: deleteProduct.id,
                title: deleteProduct.title
            }
        })

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        })
    }
}

module.exports = { getAllProducts, getProduct, createProduct, updateProduct, deleteProduct }