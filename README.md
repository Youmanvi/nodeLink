# AI-Enhanced Knowledge Graph

A privacy-first, intelligent knowledge visualization system that combines interactive graph visualization with on-device AI processing using Gemini Nano.

## Features

- **Interactive Knowledge Graph**: Beautiful muted pastel visualization of historical connections
- **AI-Enhanced Processing**: On-device AI for enhanced text analysis and relationship discovery
- **Privacy-First Architecture**: All AI processing happens locally, no external API calls
- **Dynamic Content**: Analyze your own text and create custom knowledge graphs
- **Fallback Processing**: Works without AI enhancement using basic NLP

## Architecture

```
User Input Text
     ↓
Text Processing Pipeline
     ↓
┌─────────────────┬─────────────────┐
│   Traditional   │  Gemini Nano    │
│   NLP Results   │  Enhancement    │
└─────────────────┴─────────────────┘
     ↓
Enhanced Knowledge Extraction
     ↓
Dynamic Graph Visualization
```

## Quick Start

### Prerequisites

- Node.js 18+ 
- Chrome browser with experimental AI features enabled
- Modern development environment

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Node-Link
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

### Chrome AI Setup

To enable AI enhancement, you need Chrome with experimental AI features:

1. Open Chrome and navigate to `chrome://flags/`
2. Search for "optimization-guide-on-device-model"
3. Enable the flag
4. Restart Chrome

## Usage

### Demo Mode
- Explore pre-built historical connections
- Hover over nodes to highlight connections
- Click nodes to view detailed information
- Animated links show causal relationships

### Dynamic Mode
- Switch to "Dynamic" mode using the toggle
- Enter your own text for analysis
- Enable AI enhancement if available
- Watch as your text is transformed into a knowledge graph

### Example Texts

Try these example texts for analysis:

**Historical Analysis:**
```
President John F. Kennedy established the Apollo Program in 1961 to land Americans on the Moon. NASA Headquarters coordinated the massive effort, which involved thousands of engineers and scientists. The program succeeded in 1969 when Apollo 11 landed on the Moon during the Cold War tensions with the Soviet Union.
```

**Scientific Discovery:**
```
The discovery of DNA structure by Watson and Crick at Cambridge University revolutionized molecular biology. Their work built on X-ray crystallography research by Rosalind Franklin at King's College London. This breakthrough led to the development of genetic engineering and modern biotechnology.
```

## Components

### NodeLinkGraph
- Main visualization component
- Supports both demo and dynamic data
- Enhanced with AI confidence indicators
- Responsive force-directed layout

### TextProcessor
- Text input and processing interface
- AI enhancement toggle
- Example text suggestions
- Real-time processing feedback

### AIStatusIndicator
- Shows AI processing status
- Browser support detection
- Initialization progress
- Feature availability

## Utilities

### basicNLP.ts
- Fallback text processing without AI
- Entity extraction using regex patterns
- Keyword analysis and relationship detection
- Temporal relationship identification

### graphConverter.ts
- Converts NLP results to graph format
- Handles both basic and AI-enhanced results
- Calculates optimal node positions
- Manages node and link relationships

### gemini-nano-processor.js
- Chrome Built-in AI integration
- Privacy-first on-device processing
- Enhanced NLP capabilities
- Graceful fallback handling

## AI Enhancement Features

When AI is available, the system provides:

- **Enhanced Entity Recognition**: More accurate identification of people, places, and events
- **Relationship Analysis**: Deeper understanding of connections between entities
- **Contextual Insights**: AI-generated insights and descriptions
- **Confidence Scoring**: Reliability indicators for AI-detected relationships
- **Semantic Understanding**: Better comprehension of text meaning and intent

## Privacy Benefits

- **Complete Privacy**: All AI processing happens locally
- **No API Keys**: No external service dependencies
- **Offline Capability**: Works without internet connection
- **Data Control**: User data never leaves their device
- **Cost-Free**: No usage limits or charges
- **Real-Time**: Immediate processing without network delays

## Browser Support

### Full AI Support
- Chrome with experimental AI features enabled
- Gemini Nano on-device processing

### Basic Support
- All modern browsers
- Fallback to traditional NLP processing
- Full visualization capabilities

## Development

### Project Structure
```
src/
├── components/
│   ├── NodeLinkGraph.tsx    # Main graph visualization
│   ├── TextProcessor.tsx    # Text input and processing
│   └── AIStatusIndicator.tsx # AI status display
├── utils/
│   ├── basicNLP.ts          # Fallback NLP processing
│   └── graphConverter.ts    # Graph data conversion
├── styles/
│   └── globals.css          # Global styles
├── App.tsx                  # Main application
└── main.tsx                 # React entry point
```

### Key Technologies
- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Beautiful icons
- **Gemini Nano**: On-device AI processing

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` directory.

## Configuration

### Graph Configuration
The graph visualization can be customized in `NodeLinkGraph.tsx`:

```typescript
const GRAPH_CONFIG = {
  colors: {
    people: '#B39CD0',      // Lavender
    events: '#FFC1CC',      // Soft Pink
    places: '#A8DADC',      // Light Cyan
  },
  // ... other configuration options
};
```

### AI Configuration
AI processing can be configured in `gemini-nano-processor.js`:

```javascript
this.config = {
  temperature: 0.3,
  topK: 3,
  maxOutputTokens: 1024,
  systemPrompt: 'Your custom prompt...'
};
```

## Troubleshooting

### AI Not Available
- Ensure Chrome has experimental AI features enabled
- Check browser console for error messages
- Verify Chrome version supports Gemini Nano
- Try refreshing the page

### Graph Not Loading
- Check browser console for errors
- Ensure all dependencies are installed
- Verify file paths are correct
- Try clearing browser cache

### Performance Issues
- Reduce text length for processing
- Disable AI enhancement for large texts
- Check browser memory usage
- Close other browser tabs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Future Enhancements

- **Domain-Specific Models**: Specialized prompts for different content types
- **Interactive Learning**: User feedback to improve AI suggestions
- **Export Capabilities**: Save enhanced graphs and analysis
- **Collaborative Features**: Share graphs while maintaining privacy
- **Advanced Visualizations**: 3D graphs, timeline views, concept maps
- **Multi-Language Support**: Process content in various languages

## Support

For issues and questions:
- Check the troubleshooting section
- Review browser console for errors
- Ensure all prerequisites are met
- Create an issue on GitHub

---

Built with ❤️ for privacy-first AI-enhanced knowledge visualization.
