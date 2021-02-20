const { Router } = require('express');

const isAuthenticated = require('../middlewares/isAuthenticated');

const productService = require('../services/productService');

const errorCompiler = require('./helpers/errorCompiler');

const router = Router();

const User = require('../models/User');

const Product = require('../models/Product');

router.get('/', (req, res) => {
    productService.getAll()
        .then(products => {
            if (res.locals.isAuthenticated) {
                const sortedCourses = products
                    .sort((a, b) => a.createdOn.localeCompare(b.createdOn))
                res.render('./users/home', { title: 'Browse', sortedCourses })
            } else {
                const topCourses = products
                    .sort((a, b) => b.enrolledUsers.length - a.enrolledUsers.length)
                    .slice(0, 3)
                res.render('./guests/home', { title: 'Browse', topCourses });
            }
        })
        .catch((error) => {
            const errors = errorCompiler(error);
            if (res.locals.isAuthenticated) {
                res.render('./users/home', { errors })
            } else {
                res.render('./guests/home', { errors });
            }
        })
});

router.get('/products/create', (req, res) => {
    res.render('./users/create', { title: 'Create' });
});

router.post('/products/create', (req, res) => {
    const productData = req.body;
    const user = req.user;
    let now = new Date().toString().split(' ').slice(0, 5).join(' ');
    productData.createdOn = now;
    productService.create(productData, user._id)
        .then((createdProduct) => {
            res.redirect('/');
        })
        .catch((error) => {
            const errors = errorCompiler(error);
            console.log(`Create unsuccessful: ${errors[0].message}`)
            res.render('./users/create', { errors })
        })
});

router.get('/products/:productId/details', isAuthenticated, (req, res) => {
    productService.getOne(req.params.productId)
        .then(product => {
            if (req.user._id == String(product.creator._id)) {
                product.isCreator = true;
            } else if (product.enrolledUsers.includes(req.user._id)) {
                product.enrolled = true;
            }
            res.render('./users/details', { title: 'Product Details', product })
        })
        .catch(err => { throw err });
});


router.get('/products/:productId/edit', (req, res) => {
    productService.getOne(req.params.productId)
        .then(product => {
            res.render('./users/edit', { title: 'Edit Product', product });
        })
        .catch(err => { throw err });
});

router.post('/products/:productId/edit', (req, res) => {
    productService.updateOne(req.params.productId, req.body)
        .then(response => {
            res.redirect(`/products/${req.params.productId}/details`);
        })
        .catch((error) => {
            const errors = errorCompiler(error);
            console.log(`Edit unsuccessful: ${errors[0].message}`)
            res.render('./users/create', { errors })
        })
});


router.get('/products/:productId/delete', isAuthenticated, (req, res) => {
    productService.deleteOne(req.params.productId)
        .then(result => res.redirect('/'))
});



//bonuses

router.get('/users/:_id/profile', (req, res) => {
    productService.getAllSold(req.params._id)
        .then(products => {
            const user = req.user;
            user.totalProfit = products.reduce((totalProfit, product) => {
                totalProfit += product.price;
                return totalProfit;
            }, 0);
            user.offers = products.reduce((offers, product) => {
                offers += product.buyers.length;
                return offers
            }, 0);
            res.render('./users/profile', { user, products });
        })
        .catch((error) => {
            console.log(error);
            res.status(404).send('Not Found')
        })

})

router.get('/products/:productId/buy', (req, res) => {
    const id = req.params.productId;
    const buyerId = req.user._id;
    productService.updateDbArray(Product, id, 'buyers', buyerId)
        .then(result => {
            res.redirect(`/products/${id}/details`);
        })

});

router.get('/products/:productId/enroll', async (req, res) => {
    const courseId = req.params.productId;
    const studentId = req.user._id;
    try {
        await productService.updateDbArray(Product, courseId, 'enrolledUsers', studentId);
        await productService.updateDbArray(User, studentId, 'enrolledCourses', courseId);
        res.redirect(`/products/${courseId}/details`);
    } catch (error) {
        console.log(error)
        const errors = errorCompiler(error);
        res.render('./users/details', { errors })
    }
});


router.post('/', (req, res) => {
    const query = req.body.query;
    Product.find(
        { title: { "$regex": query, "$options": "i" } }
    ).lean()
        .then(sortedCourses => {
            res.render('./users/home', { sortedCourses })
        })
        .catch((error) => {
            const errors = errorCompiler(error);
            console.log(`Search unsuccessful: ${errors[0].message}`)
            res.render('./users/create', { errors })
        })
})



module.exports = router;
