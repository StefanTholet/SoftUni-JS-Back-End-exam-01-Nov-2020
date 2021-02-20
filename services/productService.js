const Product = require('../models/Product');

async function getAll() {
    let products = await Product.find({}).lean();
    return products;
}

function getOne(id) {
    return Product.findById(id).lean();
}

function create(data, userId) {
    let product = new Product({ ...data, creator: userId });
    return product.save();
}

function updateOne(productId, productData) {
    return Product.updateOne({ _id: productId }, productData);
}

function deleteOne(_id) {	
    return Product.deleteOne({ _id });	
}

function updateDbArray(Document, id, arrayName, element) {	
    return Document.updateOne(	
        { _id: id },	
        { $push: { [arrayName]: element } }	
    )		
}

function getPopulated(id) {
    return Product.findById(id)
        .populate('buddies')
        .lean();
}

module.exports = {
    updateDbArray,
    getAll,
    getOne,
    getPopulated,
    create,
    updateOne,
    deleteOne,
    //getAllSold
}

//bonnus
// function getAllSold(userId) {
//     return Product.find({ creator: userId }).lean();
// }
