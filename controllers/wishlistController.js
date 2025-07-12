const { readJSON, writeJSON } = require("../utils/fileUtils");

async function fetchWishlist(req, res) {
    try {
        const userId = parseInt(req.params.userId);
        const wishlists = await readJSON("wishlists.json");
        const existingWishlist = wishlists.find(item => item.userId === userId);

        if (!existingWishlist || existingWishlist.products.length === 0) {
            return res.status(404).json({
                success: false,
                error: "No user wishlist found or it's empty"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Liked products fetched successfully",
            wishlist: existingWishlist
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
}

async function addLikedProduct(req, res) {
    try {
        const userId = parseInt(req.params.userId);
        const productId = parseInt(req.params.productId);

        const products = await readJSON("products.json");
        const existingProduct = products.find(product => product.id === productId);

        if (!existingProduct) {
            return res.status(400).json({
                success: false,
                error: "Product not found"
            });
        }

        const wishlists = await readJSON("wishlists.json");
        let userWishlist = wishlists.find(item => item.userId === userId);

        if (!userWishlist) {
            userWishlist = {
                id: Date.now(),
                userId,
                products: [],
                likedCount: 0
            };
            wishlists.push(userWishlist);
        }

        const alreadyLiked = userWishlist.products.some(p => p.id === productId);
        if (alreadyLiked) {
            return res.status(400).json({
                success: false,
                error: "Product already liked"
            });
        }

        userWishlist.products.push({
            id: productId,
            title: existingProduct.title,
            price: existingProduct.price,
            stock: existingProduct.stock,
            description: existingProduct.description,
            thumbnail: existingProduct.thumbnail
        });

        userWishlist.likedCount = userWishlist.products.length;
        await writeJSON("wishlists.json", wishlists);

        return res.status(200).json({
            success: true,
            message: "Product liked successfully",
            wishlist: userWishlist
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
}

async function removeLikedProduct(req, res) {
    try {
        const userId = parseInt(req.params.userId);
        const productId = parseInt(req.params.productId);

        const wishlists = await readJSON("wishlists.json");
        const userWishlist = wishlists.find(item => item.userId === userId);

        if (!userWishlist) {
            return res.status(404).json({
                success: false,
                error: "User wishlist not found"
            });
        }

        const index = userWishlist.products.findIndex(p => p.id === productId);
        if (index === -1) {
            return res.status(404).json({
                success: false,
                error: "Product not found in wishlist"
            });
        }

        userWishlist.products.splice(index, 1);
        userWishlist.likedCount = userWishlist.products.length;

        await writeJSON("wishlists.json", wishlists);

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist successfully",
            wishlist: userWishlist
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
}

module.exports = { fetchWishlist, addLikedProduct, removeLikedProduct };
