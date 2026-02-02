"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

export default function TeliTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [firstName, setFirstName] = useState("Test User");
  const [message, setMessage] = useState("Hello! This is a test from AveloHealth. 🏥");

  const testSMS = async (type: string) => {
    setLoading(true);
    setResult(null);
    
    try {
      let endpoint = '';
      let payload = {};

      switch (type) {
        case 'ai-conversation':
          endpoint = '/api/teli/start-ai-conversation';
          payload = {
            phoneNumber,
            patientName: firstName,
            appointmentDate: "2026-02-15",
            appointmentTime: "10:00 AM",
            providerName: "Dr. Smith"
          };
          break;
        
        case 'simple-sms':
          endpoint = '/api/teli/send-sms';
          payload = {
            phoneNumber,
            message,
            firstName
          };
          break;
        
        case 'appointment-reminder':
          endpoint = '/api/teli/send-appointment-reminder';
          payload = {
            phoneNumber,
            patientName: firstName,
            appointmentDate: "2026-02-15",
            appointmentTime: "10:00 AM",
            providerName: "Dr. Smith"
          };
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      setResult({
        type,
        status: response.status,
        data
      });
    } catch (error) {
      setResult({
        type,
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  const testVoice = async (type: string) => {
    setLoading(true);
    setResult(null);
    
    try {
      let endpoint = '';
      let payload = {};

      switch (type) {
        case 'voice-call':
          endpoint = '/api/teli/voice/call';
          payload = {
            phoneNumber,
            firstName
          };
          break;
        
        case 'voice-appointment':
          endpoint = '/api/teli/voice/appointment-reminder';
          payload = {
            phoneNumber,
            patientName: firstName,
            appointmentDate: "2026-02-15",
            appointmentTime: "10:00 AM",
            providerName: "Dr. Smith"
          };
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      setResult({
        type,
        status: response.status,
        data
      });
    } catch (error) {
      setResult({
        type,
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  const testKB = async (type: string) => {
    setLoading(true);
    setResult(null);
    
    try {
      let endpoint = '';
      let payload = {
        phoneNumber,
        firstName
      };

      switch (type) {
        case 'sms-kb':
          endpoint = '/api/teli/test-sms-with-kb';
          break;
        
        case 'voice-kb':
          endpoint = '/api/teli/test-voice-with-kb';
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      setResult({
        type,
        status: response.status,
        data
      });
    } catch (error) {
      setResult({
        type,
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Teli AI Test Dashboard</h1>
      
      {/* Configuration Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+15551234567"
            />
          </div>
          <div>
            <Label htmlFor="name">First Name</Label>
            <Input
              id="name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Test User"
            />
          </div>
          <div>
            <Label htmlFor="message">SMS Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter custom SMS message..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* SMS Testing Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-blue-600">📱 SMS Testing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              onClick={() => testSMS('simple-sms')}
              disabled={loading}
              variant="outline"
              className="h-auto p-4 text-left"
            >
              <div>
                <div className="font-medium">Simple SMS</div>
                <div className="text-sm text-muted-foreground">Send basic text message</div>
              </div>
            </Button>
            
            <Button
              onClick={() => testSMS('ai-conversation')}
              disabled={loading}
              variant="outline"
              className="h-auto p-4 text-left"
            >
              <div>
                <div className="font-medium">AI Conversation</div>
                <div className="text-sm text-muted-foreground">Start two-way AI chat</div>
              </div>
            </Button>
            
            <Button
              onClick={() => testSMS('appointment-reminder')}
              disabled={loading}
              variant="outline"
              className="h-auto p-4 text-left"
            >
              <div>
                <div className="font-medium">Appointment Reminder</div>
                <div className="text-sm text-muted-foreground">Send appointment SMS</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Voice Testing Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-green-600">📞 Voice Testing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={() => testVoice('voice-call')}
              disabled={loading}
              variant="outline"
              className="h-auto p-4 text-left"
            >
              <div>
                <div className="font-medium">Voice Call</div>
                <div className="text-sm text-muted-foreground">Start AI voice call</div>
              </div>
            </Button>
            
            <Button
              onClick={() => testVoice('voice-appointment')}
              disabled={loading}
              variant="outline"
              className="h-auto p-4 text-left"
            >
              <div>
                <div className="font-medium">Voice Appointment</div>
                <div className="text-sm text-muted-foreground">Call with appointment details</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Knowledge Base Testing Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-purple-600">🧠 Knowledge Base Testing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={() => testKB('sms-kb')}
              disabled={loading}
              variant="outline"
              className="h-auto p-4 text-left"
            >
              <div>
                <div className="font-medium">SMS with Appointments</div>
                <div className="text-sm text-muted-foreground">SMS with Snowflake appointment data</div>
              </div>
            </Button>
            
            <Button
              onClick={() => testKB('voice-kb')}
              disabled={loading}
              variant="outline"
              className="h-auto p-4 text-left"
            >
              <div>
                <div className="font-medium">Voice with Appointments</div>
                <div className="text-sm text-muted-foreground">Voice call with appointment data</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Test Results 
              <span className={`text-sm px-2 py-1 rounded-full ${
                result.status === 200 ? 'bg-green-100 text-green-800' : 
                result.status === 'error' ? 'bg-red-100 text-red-800' : 
                'bg-yellow-100 text-yellow-800'
              }`}>
                {result.status}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Test Type:</Label>
                <p className="text-sm text-muted-foreground">{result.type}</p>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-sm font-medium">Response:</Label>
                <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto max-h-96">
                  {JSON.stringify(result.data || result.error, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status */}
      {loading && (
        <Alert className="mt-4">
          <AlertDescription>
            Testing in progress... Please wait.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}