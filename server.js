require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// DeepSeek API configuration
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// Debug environment variables
console.log('Environment variables:');
console.log('DEEPSEEK_API_KEY:', DEEPSEEK_API_KEY ? 'Set' : 'Not set');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
            imgSrc: ["'self'", "data:", "https:", "https://placehold.co"],
            connectSrc: ["'self'"]
        }
    }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API Routes

// Contact form endpoint
app.post('/api/contact', [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
    body('message').trim().isLength({ min: 10, max: 1000 }).withMessage('Message must be between 10 and 1000 characters')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, email, message } = req.body;

        // Log the contact form submission (in production, you'd send an email)
        const messageData = { name, email, message, timestamp: new Date().toISOString() };
        console.log('New contact form submission:', messageData);

        // Save message to a file (append as JSON per line)
        try {
            fs.appendFileSync('messages.json', JSON.stringify(messageData) + '\n');
        } catch (fileError) {
            console.error('Error saving message to file:', fileError);
        }

        // In a real application, you would send an email here
        // await sendContactEmail({ name, email, message });

        // Simulate email sending delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        res.json({
            success: true,
            message: 'Thank you for your message! We\'ll get back to you soon.'
        });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
});

// AI Guppy Description Generator endpoint with DeepSeek API
app.post('/api/generate-description', [
    body('strainName').trim().isLength({ min: 2, max: 100 }).withMessage('Strain name must be between 2 and 100 characters'),
    body('primaryColor').trim().isLength({ min: 2, max: 50 }).withMessage('Primary color must be between 2 and 50 characters'),
    body('finType').trim().isLength({ min: 2, max: 50 }).withMessage('Fin type must be between 2 and 50 characters'),
    body('temperament').trim().isLength({ min: 2, max: 50 }).withMessage('Temperament must be between 2 and 50 characters'),
    body('rarity').optional().trim().isLength({ max: 100 }).withMessage('Rarity must be less than 100 characters')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { strainName, primaryColor, finType, temperament, rarity } = req.body;

        let description;

        // Try to use DeepSeek API if available, otherwise fall back to local generation
        if (DEEPSEEK_API_KEY) {
            try {
                description = await generateDescriptionWithDeepSeek({
                    strainName,
                    primaryColor,
                    finType,
                    temperament,
                    rarity
                });
            } catch (apiError) {
                console.warn('DeepSeek API failed, falling back to local generation:', apiError.message);
                description = generateGuppyDescription({
                    strainName,
                    primaryColor,
                    finType,
                    temperament,
                    rarity
                });
            }
        } else {
            // Fall back to local generation
            description = generateGuppyDescription({
                strainName,
                primaryColor,
                finType,
                temperament,
                rarity
            });
        }

        // Log the generation request
        console.log('AI description generated:', {
            strainName,
            primaryColor,
            finType,
            temperament,
            rarity,
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            description,
            message: 'Description generated successfully!'
        });

    } catch (error) {
        console.error('AI generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating description. Please try again.'
        });
    }
});

// DeepSeek API integration function
async function generateDescriptionWithDeepSeek(data) {
    const { strainName, primaryColor, finType, temperament, rarity } = data;

    const prompt = `You are an expert aquarium fish breeder and writer. Create an engaging, professional description for a rare guppy strain with the following characteristics:

Strain Name: ${strainName}
Primary Color: ${primaryColor}
Fin Type: ${finType}
Temperament: ${temperament}
${rarity ? `Rarity: ${rarity}` : ''}

Write a compelling description (150-200 words) that:
1. Introduces the guppy with an engaging opening
2. Describes its physical appearance and unique features
3. Mentions its temperament and suitability for aquariums
4. Emphasizes its beauty and appeal to fish enthusiasts
5. Uses vivid, descriptive language that makes the fish sound desirable
6. Maintains a professional yet passionate tone

The description should be suitable for a high-end aquarium fish website.`;

    const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 300,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.choices && result.choices[0] && result.choices[0].message) {
        return result.choices[0].message.content.trim();
    } else {
        throw new Error('Invalid response from DeepSeek API');
    }
}

// Guppy inventory endpoint (for future use)
app.get('/api/guppies', (req, res) => {
    const guppies = [
        {
            id: 1,
            name: 'Red Dragon Guppy',
            price: 50,
            currency: 'EUR',
            availability: 'Limited Stock',
            image: './images/red-dragon-guppy.png',
            description: 'Introducing the magnificent Red Dragon Guppy, a true aquatic jewel with a fiery presence...'
        },
        {
            id: 2,
            name: 'Moscow Blue Guppy',
            price: 45,
            currency: 'EUR',
            availability: 'Good Stock',
            image: './images/moscow-blue-guppy.png',
            description: 'Behold the Moscow Blue Guppy, a vision of deep sapphire elegance...'
        },
        {
            id: 3,
            name: 'Emerald Green Guppy',
            price: 55,
            currency: 'EUR',
            availability: 'Coming Soon',
            image: './images/emerald-green-guppy.png',
            description: 'Prepare to be enchanted by the Emerald Green Guppy, a living jewel...'
        }
    ];

    res.json({
        success: true,
        guppies
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Guppy Gems API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        deepseek_available: !!DEEPSEEK_API_KEY
    });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// Catch-all handler for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Helper function to generate guppy descriptions (fallback)
function generateGuppyDescription(data) {
    const { strainName, primaryColor, finType, temperament, rarity } = data;
    
    // Color descriptions
    const colorDescriptions = {
        'red': 'fiery red', 'blue': 'sapphire blue', 'green': 'emerald green',
        'yellow': 'golden yellow', 'orange': 'vibrant orange', 'purple': 'royal purple',
        'pink': 'soft pink', 'white': 'pearl white', 'black': 'midnight black',
        'silver': 'metallic silver', 'gold': 'shimmering gold'
    };
    
    // Fin type descriptions
    const finDescriptions = {
        'delta': 'elegant delta tail that fans out majestically',
        'fan': 'broad fan tail that creates a stunning display',
        'lyretail': 'graceful lyretail with flowing extensions',
        'dumbo ear': 'unique dumbo ear pectoral fins that add character',
        'swordtail': 'distinctive swordtail extension that commands attention',
        'round': 'classic round tail with perfect symmetry'
    };
    
    // Temperament descriptions
    const temperamentDescriptions = {
        'peaceful': 'gentle and peaceful nature',
        'active': 'energetic and constantly on the move',
        'hardy': 'robust and resilient',
        'shy': 'modest and reserved',
        'bold': 'confident and outgoing',
        'social': 'friendly and community-oriented'
    };
    
    // Get descriptions
    const colorDesc = colorDescriptions[primaryColor.toLowerCase()] || primaryColor;
    const finDesc = finDescriptions[finType.toLowerCase()] || finType;
    const tempDesc = temperamentDescriptions[temperament.toLowerCase()] || temperament;
    
    // Build the description
    let description = `Introducing the magnificent ${strainName}, a true aquatic jewel that captivates with its ${colorDesc} coloration. `;
    
    if (rarity) {
        description += `This ${rarity.toLowerCase()} strain features a ${finDesc}, making it a standout addition to any aquarium. `;
    } else {
        description += `This exceptional strain features a ${finDesc}, making it a standout addition to any aquarium. `;
    }
    
    description += `With its ${tempDesc}, the ${strainName} is perfect for both novice and experienced aquarists. `;
    
    description += `Its vibrant colors and graceful movements create a mesmerizing display that will be the centerpiece of your aquatic collection. `;
    
    if (rarity && rarity.toLowerCase().includes('rare')) {
        description += `As a rare and sought-after variety, this guppy represents the pinnacle of selective breeding and is sure to be a conversation starter among fellow enthusiasts.`;
    } else {
        description += `This carefully bred strain represents the perfect balance of beauty, health, and personality, making it an ideal choice for any guppy enthusiast.`;
    }
    
    return description;
}

// Start server
app.listen(PORT, () => {
    console.log(`🐠 Guppy Gems server running on port ${PORT}`);
    console.log(`🌐 Visit: http://localhost:${PORT}`);
    console.log(`📧 Contact API: http://localhost:${PORT}/api/contact`);
    console.log(`🤖 AI Generator: http://localhost:${PORT}/api/generate-description`);
    console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🧠 DeepSeek API: ${DEEPSEEK_API_KEY ? 'Available' : 'Not configured'}`);
}); 