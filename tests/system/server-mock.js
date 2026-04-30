// Mock server for local system testing only
// Use this if you need to test locally without running the full backend + frontend
// For GitHub Actions CI/CD, the system-tests workflow uses real servers with seeded data

const express = require('express');
const app = express();

app.use(express.json());

// Mock home page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Conduit</title>
    </head>
    <body>
      <nav>
        <div class="navbar-brand">Conduit</div>
        <ul class="nav-links">
          <li><a href="/">Home</a></li>
          <li><a href="/login">Sign in</a></li>
          <li><a href="/register">Sign up</a></li>
        </ul>
      </nav>
      <main class="page">
        <div class="banner">
          <div class="container">
            <h1 class="logo-font">conduit</h1>
            <p>A place to share your knowledge.</p>
          </div>
        </div>
        <div class="container">
          <div class="row">
            <div class="col-md-9">
              <div class="feed-toggle">
                <ul class="nav nav-pills">
                  <li class="nav-item">
                    <a class="nav-link active" href="">Global Feed</a>
                  </li>
                </ul>
              </div>
              <div class="article-preview">
                <div class="article-meta">
                  <a href="">
                    <img src="https://api.example.com/images/avatar1.jpg" />
                  </a>
                  <div class="info">
                    <span class="author">John Doe</span>
                    <span class="date">January 20, 2024</span>
                  </div>
                </div>
                <a href="" class="preview-link">
                  <h1>How to build web applications</h1>
                  <p>Learn the basics of web development</p>
                  <span>Read more...</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer>
        <div class="container">
          <a href="/" class="logo-font">conduit</a>
          <span class="attribution">
            An interactive learning project from <a href="https://thinkster.io">Thinkster</a>
          </span>
        </div>
      </footer>
    </body>
    </html>
  `);
});

// Mock API - Articles
app.get('/api/articles', (req, res) => {
  res.json({
    articles: [
      {
        slug: 'how-to-train-your-dragon',
        title: 'How to train your dragon',
        description: 'Ever wonder how?',
        body: 'It takes a Jacobian',
        tagList: ['dragons', 'training'],
        author: {
          username: 'jake',
          image: 'https://api.example.com/images/jake.jpg',
          following: false,
        },
        createdAt: '2024-01-20T03:22:56.637Z',
        updatedAt: '2024-01-20T03:48:35.824Z',
        favorited: false,
        favoritesCount: 0,
      },
    ],
    articlesCount: 1,
  });
});

// Mock API - Comments
app.get('/api/articles/:slug/comments', (req, res) => {
  res.json({
    comments: [
      {
        id: 1,
        createdAt: '2024-01-20T03:22:56.637Z',
        updatedAt: '2024-01-20T03:22:56.637Z',
        body: 'This is a great article!',
        author: {
          username: 'jake',
          image: 'https://api.example.com/images/jake.jpg',
          following: false,
        },
      },
    ],
  });
});

// Mock API - Create comment
app.post('/api/articles/:slug/comments', (req, res) => {
  res.status(201).json({
    comment: {
      id: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      body: req.body.comment.body,
      author: {
        username: 'testuser',
        image: 'https://api.example.com/images/test.jpg',
        following: false,
      },
    },
  });
});

// Mock API - Auth
app.post('/api/users/login', (req, res) => {
  res.json({
    user: {
      email: req.body.user.email,
      token: 'jwt.token.here',
      username: 'testuser',
      bio: 'Test user',
      image: 'https://api.example.com/images/test.jpg',
    },
  });
});

app.post('/api/users', (req, res) => {
  res.status(201).json({
    user: {
      email: req.body.user.email,
      token: 'jwt.token.here',
      username: req.body.user.username,
      bio: '',
      image: 'https://api.example.com/images/default.jpg',
    },
  });
});

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ errors: { body: ['Not Found'] } });
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Mock server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
