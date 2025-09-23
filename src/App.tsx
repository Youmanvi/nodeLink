import { useState, useEffect } from 'react';
// import NodeLinkGraph from "./components/NodeLinkGraph";
// import TextProcessor from "./components/TextProcessor";
// import AIStatusIndicator from "./components/AIStatusIndicator";
// import { performBasicNLP } from "./utils/basicNLP"; // Now using Flask backend

// Import Gemini Nano Processor
declare global {
  interface Window {
    GeminiNanoProcessor: any;
  }
}

// Load Gemini Nano Processor
let GeminiNanoProcessor: any = null;
if (typeof window !== 'undefined' && window.GeminiNanoProcessor) {
  GeminiNanoProcessor = window.GeminiNanoProcessor;
}

export default function App() {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [geminiProcessor, setGeminiProcessor] = useState<any>(null);
  const [aiEnabled, setAiEnabled] = useState(false);

  // Initialize Gemini Nano Processor
  useEffect(() => {
    if (GeminiNanoProcessor) {
      const processor = new GeminiNanoProcessor();
      setGeminiProcessor(processor);
      console.log('Gemini Nano Processor initialized:', processor);
    }
  }, []);

  const processText = async () => {
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    console.log('Starting text processing...');
    
    try {
      // Step 1: Flask NLP preprocessing
      console.log('Step 1: Running Flask NLP preprocessing...');
      const flaskResponse = await fetch('/api/process-advanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          options: {
            basicPreprocessing: true,
            keywordExtraction: true,
            entityRecognition: true,
            sentimentAnalysis: true,
            contextualEmbedding: true,
            relationshipMapping: true,
            topicModeling: true,
            intentClassification: true,
            conceptExtraction: true
          },
          timestamp: new Date().toISOString()
        })
      });
      
      if (!flaskResponse.ok) {
        throw new Error(`Flask API error: ${flaskResponse.status}`);
      }
      
      const flaskResults = await flaskResponse.json();
      console.log('Flask NLP Results:', flaskResults);
      
      // Step 2: Gemini post-processing and fine-tuning
      let enhancedResults = flaskResults;
      if (aiEnabled && geminiProcessor && geminiProcessor.isInitialized) {
        try {
          console.log('Step 2: Running Gemini post-processing...');
          const aiResults = await geminiProcessor.enhanceNLPResults(
            flaskResults, 
            inputText
          );
          console.log('Gemini Enhanced Results:', aiResults);
          
          if (aiResults.enhanced) {
            enhancedResults = aiResults;
            console.log('✅ AI enhancement successful!');
          } else {
            console.log('⚠️ AI enhancement failed, using Flask results');
          }
        } catch (error) {
          console.warn('❌ AI enhancement failed:', error);
        }
      } else {
        console.log('⚠️ AI not enabled or not available, using Flask NLP only');
      }
      
      // Step 3: Log final results
      console.log('🎯 Final Processing Results:', {
        originalText: inputText,
        flaskNLP: flaskResults,
        enhancedResults: enhancedResults,
        processingMethod: aiEnabled && geminiProcessor?.isInitialized ? 'Flask NLP + Gemini Nano' : 'Flask NLP Only'
      });
      
    } catch (error) {
      console.error('❌ Processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen dark" style={{ backgroundColor: '#2C2C2C' }}>
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-medium text-[#E4E4E4] mb-4">
            NLP + Gemini Processing Test
          </h1>
          <p className="text-[#B8B8B8] text-lg">
            Test the NLP preprocessing and Gemini post-processing pipeline. Check the browser console for detailed results.
          </p>
        </div>
        
        {/* Text Input */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#E4E4E4' }}>
              Input Text for Processing
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text to analyze with NLP + Gemini processing..."
              className="w-full h-32 p-3 border rounded-lg resize-none"
              style={{
                backgroundColor: '#3A3A3A',
                borderColor: '#4A4A4A',
                color: '#E4E4E4'
              }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={aiEnabled}
                onChange={(e) => setAiEnabled(e.target.checked)}
                disabled={!geminiProcessor || !geminiProcessor.isSupported}
                className="rounded"
              />
              <span className="text-sm" style={{ color: '#B8B8B8' }}>
                Enable Gemini AI Enhancement {(!geminiProcessor || !geminiProcessor.isSupported) && '(Not Available)'}
              </span>
            </label>
            
            <button
              onClick={processText}
              disabled={isProcessing || !inputText.trim()}
              className="px-4 py-2 rounded-lg disabled:opacity-50 transition-colors"
              style={{
                backgroundColor: '#B39CD0',
                color: '#2C2C2C'
              }}
            >
              {isProcessing ? 'Processing...' : 'Process Text'}
            </button>
          </div>
        </div>
        
        {/* Status Information */}
        <div className="bg-[#3A3A3A] border border-[#4A4A4A] rounded-lg p-4">
          <h3 className="text-lg font-medium text-[#E4E4E4] mb-2">
            Processing Status
          </h3>
          <div className="space-y-2 text-sm" style={{ color: '#B8B8B8' }}>
            <div className="flex items-center gap-2">
              <div 
                className={`w-2 h-2 rounded-full ${
                  geminiProcessor?.isSupported ? 'bg-green-400' : 'bg-red-400'
                }`}
              />
              <span>
                Gemini Support: {geminiProcessor?.isSupported ? 'Available' : 'Not Available'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div 
                className={`w-2 h-2 rounded-full ${
                  geminiProcessor?.isInitialized ? 'bg-green-400' : 'bg-yellow-400'
                }`}
              />
              <span>
                AI Status: {geminiProcessor?.isInitialized ? 'Ready' : 'Initializing...'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div 
                className={`w-2 h-2 rounded-full ${
                  isProcessing ? 'bg-blue-400' : 'bg-gray-400'
                }`}
              />
              <span>
                Processing: {isProcessing ? 'In Progress' : 'Ready'}
              </span>
            </div>
          </div>
          
          <div className="mt-4 p-3 rounded border" style={{ 
            backgroundColor: '#2C2C2C',
            borderColor: '#4A4A4A'
          }}>
            <p className="text-xs" style={{ color: '#B8B8B8' }}>
              <strong>Console Output:</strong> Open your browser's developer console (F12) to see detailed processing results, including NLP preprocessing and Gemini enhancement steps.
            </p>
          </div>
        </div>
        
        {/* Example Text */}
        <div className="mt-6">
          <p className="text-sm mb-2" style={{ color: '#B8B8B8' }}>
            Try this example text:
          </p>
          <button
            onClick={() => setInputText("President John F. Kennedy established the Apollo Program in 1961 to land Americans on the Moon. NASA Headquarters coordinated the massive effort, which involved thousands of engineers and scientists. The program succeeded in 1969 when Apollo 11 landed on the Moon during the Cold War tensions with the Soviet Union.")}
            className="text-left text-xs p-3 rounded border w-full hover:opacity-80 transition-opacity"
            style={{
              backgroundColor: '#3A3A3A',
              borderColor: '#4A4A4A',
              color: '#B8B8B8'
            }}
          >
            President John F. Kennedy established the Apollo Program in 1961 to land Americans on the Moon. NASA Headquarters coordinated the massive effort, which involved thousands of engineers and scientists...
          </button>
        </div>
      </div>
    </div>
  );
}
