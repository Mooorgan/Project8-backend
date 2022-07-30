const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');

const { Product } = require('../models/product');
const { Category } = require('../models/category');
const { User } = require('../models/user');

const router = express.Router();

const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error('invalid image type');
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, 'public/uploads');
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(' ').join('-');
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

router.get(`/`, async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(',') };
  }
  const productList = await Product.find(filter).populate('category');
  if (!productList) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(productList);
});

router.get(`/:id`, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send('Invalid Product id');
  }
  if (req.headers.authorization) {
    const extraction = req.headers.authorization.split(' ')[1];
    const extraction1 = atob(extraction.split('.')[1]);
    const extraction1Parsed = JSON.parse(extraction1);
    // console.log(typeof extraction1Parsed);
    console.log(extraction1Parsed);
    const uid = extraction1Parsed.userId;

    // if (req.headers.authorization && !extraction1Parsed.isAdmin) {
    if (req.headers.authorization) {
      console.log('user id is', uid);
      // const targetUser=await User.findById(uid);

      const updatedProduct = await Product.findById(req.params.id);

      const numTimeRecorded = +updatedProduct.timeRecorded;
      console.log('Time recorded is', numTimeRecorded);
      // console.log(typeof numTimeRecorded, numTimeRecorded);
      console.log('Timecount is', updatedProduct.timeCount);
      const addSec = updatedProduct.timeCount * 1000;
      console.log('Addition second is', addSec);
      const futureTime = numTimeRecorded + addSec;
      console.log('Time future is', futureTime);
      console.log(Date.now() > futureTime);

      if (Date.now() > futureTime) {
        console.log('updated product.priceMin is', updatedProduct.priceMin);
        updatedProduct.price = updatedProduct.priceMin;
        updatedProduct.timeRecorded = '';
        updatedProduct.viewsCount = 0;
        console.log(updatedProduct.viewsCount);
        updatedProduct.viewsId = [];
      }

      const found = updatedProduct.viewsId.find((id) => {
        return id === uid;
      });

      if (!found) {
        updatedProduct.viewsId.push(uid);
        console.log('pushed is', updatedProduct.viewsId);
        updatedProduct.viewsCount = updatedProduct.viewsCount + 1;
        updatedProduct.timeRecorded = Date.now().toString();
      } else {
        // updatedProduct.viewsId.push(uid);
        // updatedProduct.viewsCount = updatedProduct.viewsCount + 1;
        updatedProduct.timeRecorded = Date.now().toString();
      }

      if (updatedProduct.viewsCount > updatedProduct.thresholdCount) {
        console.log('viewscount current', updatedProduct.viewsCount);
        console.log('thresholdcount current', updatedProduct.thresholdCount);
        console.log('Max price is', updatedProduct.priceMax);
        updatedProduct.price = updatedProduct.priceMax;
      }

      // console.log(typeof updatedProduct, updatedProduct);
      // const found = updatedProduct.viewsId.find((id) => {
      //   return id === uid;
      // });
      // const numTimeRecorded = +updatedProduct.timeRecorded;
      // console.log('Time recorded is', numTimeRecorded);
      // // console.log(typeof numTimeRecorded, numTimeRecorded);
      // console.log('Timecount is', updatedProduct.timeCount);
      // const addSec = updatedProduct.timeCount * 1000;
      // console.log('Addition second is', addSec);
      // const futureTime = numTimeRecorded + addSec;
      // console.log('Time future is', futureTime);
      // console.log(Date.now() > futureTime);
      // if (Date.now() > futureTime) {
      //   console.log('updated product.priceMin is', updatedProduct.priceMin);
      //   updatedProduct.price = updatedProduct.priceMin;
      //   updatedProduct.timeRecorded = '';
      //   updatedProduct.viewsCount = 0;
      //   console.log(updatedProduct.viewsCount);
      //   updatedProduct.viewsId = '';
      //   updatedProduct.viewsId.push(uid);
      //   updatedProduct.viewsCount = updatedProduct.viewsCount + 1;
      //   updatedProduct.timeRecorded = Date.now().toString();
      //   console.log('Executred Time greater');
      // }
      // if (!found) {
      //   updatedProduct.viewsId.push(uid);
      //   console.log('pushed is', updatedProduct.viewsId);
      //   updatedProduct.viewsCount = updatedProduct.viewsCount + 1;
      //   updatedProduct.timeRecorded = Date.now().toString();
      // } else {
      //   // updatedProduct.viewsId.push(uid);
      //   // updatedProduct.viewsCount = updatedProduct.viewsCount + 1;
      //   updatedProduct.timeRecorded = Date.now().toString();
      //   if (updatedProduct.viewsCount > updatedProduct.thresholdCount) {
      //     updatedProduct.price = updatedProduct.priceMax;
      //   }
      // }

      // console.log(updatedProduct);
      const storeProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
          // name: req.body.name,
          // description: req.body.description,
          // richDescription: req.body.richDescription,
          // image: imagePath,
          // brand: req.body.brand,
          price: updatedProduct.price,
          // priceMax: req.body.priceMax,
          // priceMin: req.body.price,
          // thresholdCount: req.body.thresholdCount,
          // timeCount: req.body.timeCount,
          // category: req.body.category,
          // countInStock: req.body.countInStock,
          // rating: req.body.rating,
          // numReviews: req.body.numReviews,
          // isFeatured: req.body.isFeatured,
          timeRecorded: updatedProduct.timeRecorded,
          viewsCount: updatedProduct.viewsCount,
          viewsId: updatedProduct.viewsId,
        },
        { new: true }
      );
      console.log(storeProduct);
      console.log('Hellooooooooooooooooooooo');
      // console.log(typeof uid, uid);
    }
    // console.log(typeof req.params.id);
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(product);
});

router.post(`/`, uploadOptions.single('image'), async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).send('Invalid Category');
  }

  const file = req.file;
  if (!file) {
    return res.status(400).send('No image in the request');
  }

  const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
  const fileName = req.file.filename;

  const product1 = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`,
    brand: req.body.brand,
    price: req.body.price,
    priceMax: req.body.priceMax,
    priceMin: req.body.price,
    thresholdCount: req.body.thresholdCount,
    timeCount: req.body.timeCount,
    // timeRecorded:new Date(),
    // viewsCount:req.body.viewsCount,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });
  const product = await product1.save();
  if (!product) {
    return res.status(500).send({
      message: 'Product cannot be created',
    });
  }
  return res.status(201).send(product);
});

router.put('/:id', uploadOptions.single('image'), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send('Invalid Product id');
  }
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).send('Invalid Category');
  }

  const productPrevious = await Product.findById(req.params.id);
  if (!productPrevious) {
    return res.status(400).send('Invalid Product!');
  }

  const file = req.file;

  let imagePath;
  if (file) {
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    const fileName = req.file.filename;
    imagePath = `${basePath}${fileName}`;
  } else {
    imagePath = productPrevious.image;
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: imagePath,
      brand: req.body.brand,
      price: req.body.price,
      priceMax: req.body.priceMax,
      priceMin: req.body.price,
      thresholdCount: req.body.thresholdCount,
      timeCount: req.body.timeCount,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true }
  );
  if (!updatedProduct) {
    return res.status(500).send('the product cannot be updated!');
  }
  return res.send(updatedProduct);
});

router.delete('/:id', (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send('Invalid Product id');
  }
  Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: 'The product is deleted!' });
      }
      return res
        .status(404)
        .json({ success: false, message: 'Product not found!' });
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

router.get(`/get/count`, (req, res) => {
  Product.countDocuments()
    .then((count) => {
      if (count) {
        return res.status(200).json({ productCount: count });
      } else {
        return res.status(500).json({ success: false });
      }
    })
    .catch((err) => {
      return res.status(400).json({
        success: false,
        error: err,
      });
    });
});

router.get(`/get/featured/:count`, async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const products = await Product.find({ isFeatured: true }).limit(+count);
  if (!products) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(products);
});

router.put(
  '/gallery-images/:id',
  uploadOptions.array('images', 10),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send('Invalid Product id');
    }
    const files = req.files;

    let imagesPath = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    if (files) {
      files.map((file) => {
        imagesPath.push(`${basePath}${file.filename}`);
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagesPath,
      },
      { new: true }
    );

    if (!product) {
      return res.status(500).send('the product cannot be updated!');
    }
    return res.send(product);
  }
);

module.exports = router;
