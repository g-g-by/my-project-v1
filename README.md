# 🐠 Guppy Gems - Rare Guppies from Budapest

A professional website for a Budapest-based guppy breeder, featuring an AI-powered description generator and modern web design.

## ✨ Features

- **Responsive Design**: Modern, mobile-first design using Tailwind CSS
- **AI Description Generator**: Powered by DeepSeek API for creating engaging guppy descriptions
- **Contact Form**: Backend integration for customer inquiries
- **Interactive UI**: Smooth animations, mobile menu, and scroll-to-top functionality
- **Professional Styling**: Beautiful gradients, hover effects, and modern typography
- **SEO Optimized**: Proper meta tags and semantic HTML structure

## 🚀 Quick Start

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. **Clone or download the project files**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # DeepSeek API Configuration
   DEEPSEEK_API_KEY=sk-8e0bff71aabd4252b0d22ad87103506b
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
guppy-gems/
├── index.html          # Main HTML file
├── style.css           # Custom CSS styles
├── script.js           # Frontend JavaScript
├── server.js           # Express.js backend server
├── package.json        # Node.js dependencies
├── .env               # Environment variables (create this)
├── images/            # Guppy images directory
└── README.md          # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

- `DEEPSEEK_API_KEY`: Your DeepSeek API key for AI description generation
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

### API Endpoints

- `GET /` - Main website
- `POST /api/contact` - Contact form submission
- `POST /api/generate-description` - AI guppy description generator
- `GET /api/guppies` - Guppy inventory (for future use)
- `GET /api/health` - Health check

## 🎨 Customization

### Adding New Guppy Strains

1. Add images to the `images/` directory
2. Update the guppy cards in `index.html`
3. Optionally update the `/api/guppies` endpoint in `server.js`

### Styling Changes

- Main styles: `style.css`
- Tailwind classes: Directly in `index.html`
- Color scheme: Update CSS variables in `style.css`

### AI Prompt Customization

Edit the prompt in the `generateDescriptionWithDeepSeek()` function in `server.js` to customize the AI-generated descriptions.

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Deployment Options

1. **Heroku**: Connect your GitHub repository
2. **Vercel**: Deploy with zero configuration
3. **Netlify**: Drag and drop deployment
4. **DigitalOcean**: App Platform deployment

## 🔒 Security Features

- **Helmet.js**: Security headers
- **Rate Limiting**: API request throttling
- **Input Validation**: Form data sanitization
- **CORS**: Cross-origin resource sharing protection
- **Environment Variables**: Secure API key storage

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support or questions:
- Email: info@guppygems.hu
- Phone: +36 70 123 4567

## 🐠 About Guppy Gems

Guppy Gems is a Budapest-based guppy breeder specializing in rare and high-quality guppy strains. We focus on ethical breeding practices and providing exceptional customer service to the aquarium community in Hungary.

---

**Made with ❤️ in Budapest, Hungary** 