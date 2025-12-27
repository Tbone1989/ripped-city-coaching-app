import React from 'react';
import { Card, Input, Button } from './ui/common.tsx';

const Settings: React.FC = () => {
  return (
    <div className="space-y-8">
      <Card>
        <h3 className="text-xl font-semibold text-white mb-2">Stripe Integration</h3>
        <p className="text-gray-400 mb-6">Connect your Stripe account to manage client payments and invoicing directly through the app.</p>
        
        <div className="p-4 mb-6 bg-yellow-900/30 border border-yellow-700 rounded-lg text-yellow-300 text-sm">
            <p className="font-bold mb-2 flex items-center"><i className="fa-solid fa-shield-halved mr-2"></i>Security Note</p>
            <p>For security reasons, connecting to third-party services like Stripe requires a backend server. Your API keys should never be exposed in the frontend application. This interface is a placeholder for where a backend developer would integrate these services.</p>
        </div>

        <div className="space-y-4">
            <Input 
                label="Stripe Secret Key"
                id="stripe-secret"
                type="password"
                placeholder="sk_live_************************"
                disabled
            />
            <Input 
                label="Stripe Publishable Key"
                id="stripe-publishable"
                placeholder="pk_live_************************"
                disabled
            />
            <Button disabled>Connect Stripe Account</Button>
        </div>
      </Card>

      <Card>
        <h3 className="text-xl font-semibold text-white mb-2">Google Sheets Integration</h3>
        <p className="text-gray-400 mb-6">Connect your Google account to automatically export and sync client data to a Google Sheet for backup and analysis.</p>
        
         <div className="p-4 mb-6 bg-yellow-900/30 border border-yellow-700 rounded-lg text-yellow-300 text-sm">
            <p className="font-bold mb-2 flex items-center"><i className="fa-solid fa-shield-halved mr-2"></i>Security & Functionality Note</p>
            <p>Connecting to Google Sheets requires a secure backend server to handle the OAuth 2.0 authentication flow and manage API calls. This ensures your account credentials and client data remain secure.</p>
        </div>
        
        <div className="space-y-4">
             <Input 
                label="Target Google Sheet URL"
                id="google-sheet-url"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                disabled
            />
            <Button disabled>Connect Google Account</Button>
        </div>
      </Card>
      
      <Card>
        <h3 className="text-xl font-semibold text-white mb-2">Google Forms Integration</h3>
        <p className="text-gray-400 mb-6">Link a Google Form to use as a client intake questionnaire. Responses can be automatically pulled into the client's profile.</p>
        
         <div className="p-4 mb-6 bg-yellow-900/30 border border-yellow-700 rounded-lg text-yellow-300 text-sm">
            <p className="font-bold mb-2 flex items-center"><i className="fa-solid fa-shield-halved mr-2"></i>Backend Required</p>
            <p>Similar to other integrations, securely connecting to the Google Forms API to fetch responses requires a backend server to handle authentication and protect your credentials.</p>
        </div>
        
        <div className="space-y-4">
             <Input 
                label="Client Intake Form URL"
                id="google-form-url"
                placeholder="https://docs.google.com/forms/d/e/..."
                disabled
            />
            <Button disabled>Connect Google Form</Button>
        </div>
      </Card>
    </div>
  );
};

export default Settings;