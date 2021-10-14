const express = require('express');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const router = express.Router();

const multer = require('multer');
const Post = require('../../models/Post');

// Set up multer for storing uploaded files

const upload = multer({});

// @route  POST api/posts
// @desc   Create a post
// @access Private
router.post(
  '/',
  [
    auth,
    upload.single('image'),
    [
      check('text', 'Text is required').not().isEmpty(),
      check('title', 'Title is required').not().isEmpty(),
      check('type', 'Type is required').not().isEmpty(),
      check('lang', 'Lang is required').not().isEmpty(),
      check('latitude', 'Latitude is required').not().isEmpty(),
      check('longitude', 'Longitude is required').not().isEmpty(),
      check('locationUrl', 'Location url is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newPost = new Post({
        text: req.body.text,
        title: req.body.title,
        img: {
          data: req.file.buffer,
          contentType: 'image/png'
        },
        type: req.body.type,
        location: {
          type: 'Point',
          coordinates: [req.body.latitude, req.body.longitude]
        },
        lang: req.body.lang,
        locationUrl: req.body.locationUrl
      });

      const post = await newPost.save();

      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route  Get api/posts
// @desc   Get all posts and filtered posts
// @access Public
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) {
      filter.type = req.query.type;
    }
    let posts = [];
    if (req.query.size) {
      posts = await Post.find(filter).limit(parseInt(req.query.size, 10));
    } else {
      posts = await Post.find(filter).limit(9);
    }
    console.log('posts', posts);
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route  Get api/posts/:id
// @desc   Get post by id
// @access Public
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route  DELETE api/posts/:id
// @desc   Delete a post
// @access Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    await post.remove();
    res.json({ msg: 'Post removed ' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route  PUT api/posts/:id
// @desc   Update a post
// @access Private

router.put('/:id', [auth, upload.single('image')], async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    Object.keys(req.body).forEach((key) => {
      if (post[key]) {
        post[key] = req.body[key];
      }
    });

    if (req.file.buffer) {
      console.log('post', post);
      post.img = {
        data: req.file.buffer,
        contentType: 'image/png'
      };
    }
    await post.save();

    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
