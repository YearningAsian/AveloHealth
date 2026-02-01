'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  MessageSquare, 
  Phone, 
  Mic, 
  Send, 
  Activity,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

export default function QuickDiagnosisPage() {
  const [mode, setMode] = useState<'chat' | 'voice' | null>(null);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: 'Thank you for sharing that information. Based on your symptoms, I recommend consulting with a healthcare professional. This is a preliminary assessment and not a medical diagnosis.'
      }]);
      setIsLoading(false);
    }, 1500);
  };

  const startVoiceCall = () => {
    setIsListening(true);
    // Implement voice call logic here
    alert('Voice call functionality would connect here. In production, this would initiate a Teli AI voice session.');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">QuickDiagnosis</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Free AI-powered symptom assessment. Get instant health insights through voice or chat.
            Available to everyone, anytime.
          </p>
          <div className="inline-flex gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-950 rounded-lg">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <p className="text-sm text-blue-900 dark:text-blue-100">
              This tool provides general health information only and is not a substitute for professional medical advice.
            </p>
          </div>
        </div>

        {/* Assessment Card */}
        {mode === null ? (
          <div className="max-w-2xl mx-auto">
            <Card className="hover:shadow-xl transition-all border-2 border-primary">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                  <Activity className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="text-3xl mb-3">Start Your Assessment</CardTitle>
                <CardDescription className="text-lg">
                  Get AI-powered insights about your symptoms through our interactive assessment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>100% Free - No account required</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Quick and easy symptom questionnaire</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Get preliminary health insights in minutes</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Private and secure assessment</span>
                  </li>
                </ul>
                
                <a 
                  href="https://tally.so/r/Xx0DjP" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button className="w-full" size="lg">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Begin Assessment
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {mode === 'chat' ? (
                  <MessageSquare className="h-6 w-6 text-primary" />
                ) : (
                  <Phone className="h-6 w-6 text-primary" />
                )}
                <h2 className="text-2xl font-semibold">
                  {mode === 'chat' ? 'Chat Assessment' : 'Voice Assessment'}
                </h2>
              </div>
              <Button variant="outline" onClick={() => setMode(null)}>
                Change Mode
              </Button>
            </div>

            {mode === 'chat' ? (
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="border-b">
                  <CardTitle className="text-lg">Symptom Assessment Chat</CardTitle>
                  <CardDescription>
                    Describe your symptoms in detail. The AI will ask follow-up questions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center text-muted-foreground py-12">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Start by describing your symptoms or health concerns</p>
                    </div>
                  )}
                  
                  {messages.map((msg, idx) => (
                    <div
                      key={`msg-${idx}-${msg.role}`}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-3 ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg px-4 py-3">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                </CardContent>
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Describe your symptoms..."
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={isLoading}
                    />
                    <Button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="h-[600px] flex flex-col items-center justify-center">
                <CardContent className="text-center">
                  <div className="mb-8">
                    <div className={`mx-auto p-8 rounded-full w-fit ${
                      isListening ? 'bg-red-100 dark:bg-red-950' : 'bg-primary/10'
                    }`}>
                      <Mic className={`h-24 w-24 ${
                        isListening ? 'text-red-600 animate-pulse' : 'text-primary'
                      }`} />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4">
                    {isListening ? 'Listening...' : 'Ready to Start'}
                  </h3>
                  
                  <p className="text-muted-foreground mb-8 max-w-md">
                    {isListening 
                      ? 'Speak clearly about your symptoms. The AI will ask follow-up questions.'
                      : 'Click the button below to start your voice assessment session.'
                    }
                  </p>
                  
                  <Button 
                    size="lg" 
                    onClick={startVoiceCall}
                    variant={isListening ? 'destructive' : 'default'}
                    className="px-8"
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    {isListening ? 'End Call' : 'Start Voice Call'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <Card className="mt-12 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">Important Disclaimer</p>
                <ul className="text-sm text-yellow-700 dark:text-yellow-200 space-y-1">
                  <li>• This tool is for informational purposes only and does not provide medical advice</li>
                  <li>• Always consult with a qualified healthcare professional for medical concerns</li>
                  <li>• In case of emergency, call 911 or your local emergency number immediately</li>
                  <li>• AI assessments are preliminary and should not replace professional diagnosis</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
