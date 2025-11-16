import * as React from 'react';
import type { FinalQuote } from '@/lib/types';

interface FollowUpEmailProps {
  quote: FinalQuote;
  baseUrl: string;
}

// --- Inline CSS Styles using App's Theme Colors ---
const main = {
  backgroundColor: 'hsl(345, 60%, 98%)', // --background
  fontFamily: "'Alegreya', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  padding: '20px',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px',
  width: '100%',
  maxWidth: '680px',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  border: '1px solid hsl(345, 20%, 90%)', // --border
};

const header = {
  textAlign: 'center' as const,
  paddingBottom: '20px',
  borderBottom: '1px solid hsl(345, 20%, 90%)', // --border
};

const heading = {
  fontSize: '42px',
  lineHeight: '1.2',
  fontWeight: 'bold',
  color: 'hsl(345, 80%, 50%)', // --primary
  margin: '0 0 12px 0',
  fontFamily: "'Belleza', sans-serif",
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.7',
  color: 'hsl(240, 10%, 3.9%)', // --foreground
  margin: '0 0 24px 0',
};

const section = {
  padding: '30px 0',
};

const sectionTitle = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: 'hsl(240, 10%, 3.9%)', // --foreground
  marginBottom: '24px',
  fontFamily: "'Belleza', sans-serif",
  textAlign: 'center' as const,
};

const instructionBox = {
    background: 'hsl(345, 60%, 94%)', // --accent
    border: '1px solid hsl(345, 20%, 90%)', // --border
    borderRadius: '12px',
    padding: '30px',
    textAlign: 'center' as const,
    margin: '30px 0',
};

const button = {
  backgroundColor: 'hsl(345, 80%, 50%)', // --primary
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '18px 32px',
  display: 'inline-block',
  boxShadow: '0 4px 14px rgba(225, 29, 72, 0.25)',
};

const footer = {
  padding: '30px 0 0 0',
  textAlign: 'center' as const,
  fontSize: '13px',
  color: '#999',
};

const bookingSummaryCard = {
    padding: '24px',
    border: '1px solid hsl(345, 20%, 90%)', // --border
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    marginBottom: '20px',
}

const bookingSummaryTitle = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'hsl(345, 80%, 50%)', // --primary
    margin: '0 0 4px 0',
    fontFamily: "'Belleza', sans-serif",
};

const FollowUpEmailTemplate: React.FC<Readonly<FollowUpEmailProps>> = ({ quote, baseUrl }) => (
  <div style={main}>
    <div style={container}>
      <div style={header}>
        <h1 style={heading}>Looks by Anum</h1>
        <p style={{...paragraph, color: '#6c757d', fontSize: '18px', marginBottom: 0}}>Don't Miss Out on Your Perfect Look!</p>
      </div>

      <div style={section}>
        <p style={paragraph}>
          Hi {quote.contact.name},
        </p>
        <p style={paragraph}>
          We noticed you recently requested a quote for our makeup services but haven't confirmed your booking yet. We'd love to help you look and feel your absolute best for your event!
        </p>
         <p style={{...paragraph, fontStyle: 'italic', color: 'hsl(240, 5.9%, 10%)' }}>
          Slots fill up quickly, especially around peak season. Confirming soon will ensure your preferred date and time are locked in.
        </p>
        
        <div style={instructionBox}>
            <p style={{ ...paragraph, marginTop: 0, marginBottom: '24px', color: 'hsl(240, 5.9%, 10%)', fontSize: '18px' }}>
              Ready to secure your spot?
            </p>
            <a href={baseUrl} target="_blank" rel="noopener noreferrer" style={button}>
                Complete Your Booking
            </a>
            <p style={{ fontSize: '14px', color: '#777', marginTop: '16px' }}>
                Use Booking ID: <strong style={{color: 'hsl(240, 10%, 3.9%)'}}>{quote.id}</strong>
            </p>
        </div>
      </div>

      <div style={{ ...section, borderBottom: 'none', paddingTop: 0 }}>
        <h2 style={sectionTitle}>Your Quote Reminder</h2>
        
        <div style={bookingSummaryCard}>
            <h3 style={{ ...bookingSummaryTitle, fontSize: '22px', textAlign: 'center', marginBottom: '20px' }}>
                Your Requested Services
            </h3>
            {quote.booking.days.map((day, index) => (
              <div key={index} style={{ marginBottom: '16px', borderTop: index > 0 ? '1px solid #eee' : 'none', paddingTop: index > 0 ? '16px' : '0' }}>
                <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: 'hsl(240, 10%, 3.9%)', fontSize: '16px' }}>
                  {day.serviceName} on {day.date}
                </p>
                <p style={{ margin: 0, paddingLeft: '15px', color: '#555' }}>
                  &bull; Time: {day.getReadyTime}<br/>
                  &bull; Location: {day.location}
                </p>
              </div>
            ))}
        </div>
        <p style={{...paragraph, textAlign: 'center' as const}}>
            Pricing for both our Lead Artist and Team tiers are waiting for you on our website.
        </p>
      </div>
      
      <p style={{ ...paragraph, fontSize: '14px', color: '#6c757d', textAlign: 'center', marginBottom: 0, marginTop: '20px' }}>
        If you have any questions or would like to make changes, please reply directly to this email. We're here to help!
      </p>
      
      <div style={footer}>
        <p>&copy; {new Date().getFullYear()} Looks by Anum. All rights reserved.</p>
        <p>Powered by <a href="https://www.instagram.com/sellayadigital" target="_blank" rel="noopener noreferrer" style={{color: '#999', textDecoration: 'underline'}}>Sellaya</a>.</p>
      </div>
    </div>
  </div>
);

export default FollowUpEmailTemplate;
