# Environment Setup

## Setting up your Google Gemini API Key

To use the Shopstory application, you need to set up a Google Gemini API key:

1. **Get your API key:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key if you don't have one

2. **Set up your environment file:**
   - Create a `.env` file in the `shopstory/` directory
   - Add your API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

3. **Start the development server:**
   ```bash
   cd shopstory
   npx shop-minis dev
   ```

⚠️ **Important:** Never commit your `.env` file to version control. It's already included in `.gitignore` for security.

## File Structure
```
shopstory/
├── .env                    # Your environment variables (create this)
├── .env.example           # Template for environment variables
├── .gitignore            # Includes .env (don't modify)
└── src/
    ├── services/
    │   └── gemini.ts      # Now reads from VITE_GEMINI_API_KEY
    └── vite-env.d.ts      # TypeScript environment variable types
```

