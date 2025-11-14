
import * as React from 'react';
import type { FinalQuote } from '@/lib/types';

interface FollowUpEmailProps {
  quote: FinalQuote;
  baseUrl: string;
}

// --- Inline CSS Styles ---
const main = {
  backgroundColor: '#f9f9f9',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  padding: '20px',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px',
  width: '100%',
  maxWidth: '640px',
  borderRadius: '12px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
  border: '1px solid #eaeaea',
};

const header = {
  textAlign: 'center' as const,
  paddingBottom: '20px',
};

const heading = {
  fontSize: '36px',
  lineHeight: '1.2',
  fontWeight: 'bold',
  color: '#212529',
  margin: '0 0 12px 0',
  fontFamily: "'Belleza', sans-serif",
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.7',
  color: '#555',
  margin: '0 0 20px 0',
};

const section = {
  padding: '30px 0',
  borderBottom: '1px solid #eaeaea',
};

const sectionTitle = {
  fontSize: '24px',
  fontWeight: 600,
  color: '#212529',
  marginBottom: '24px',
  fontFamily: "'Belleza', sans-serif",
};

const instructionBox = {
    background: '#fff8f9',
    border: '1px solid #fde1e5',
    borderRadius: '12px',
    padding: '30px',
    textAlign: 'center' as const,
    margin: '30px 0',
};

const bookingIdLabel = {
    fontSize: '16px',
    color: '#7c2d3a',
    marginBottom: '8px',
};

const bookingIdText = {
    fontSize: '28px',
    fontWeight: 700,
    color: '#c72c41',
    fontFamily: 'monospace',
    margin: '0 0 24px 0',
};

const button = {
  backgroundColor: '#E11D48',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '16px 28px',
  display: 'inline-block',
  boxShadow: '0 4px 14px rgba(225, 29, 72, 0.25)',
};

const footer = {
  padding: '30px 0 0 0',
  textAlign: 'center' as const,
  fontSize: '12px',
  color: '#999',
};


const FollowUpEmailTemplate: React.FC<Readonly<FollowUpEmailProps>> = ({ quote, baseUrl }) => (
  <div style={main}>
    <div style={container}>
      <div style={header}>
        <h1 style={heading}>Looks by Anum</h1>
        <p style={{...paragraph, color: '#6c757d', marginBottom: 0}}>Don't Miss Out on Your Perfect Look!</p>
      </div>

      <div style={section}>
        <p style={paragraph}>
          Hi {quote.contact.name},
        </p>
        <p style={paragraph}>
          We noticed you recently requested a quote for our makeup services but haven't confirmed your booking yet. We'd love to help you look and feel your absolute best for your event!
        </p>
         <p style={{...paragraph, fontStyle: 'italic', color: '#333'}}>
          Slots fill up quickly, especially around peak season. Confirming soon will ensure your preferred date and time are locked in.
        </p>
        
        <div style={instructionBox}>
            <p style={bookingIdLabel}>Your Booking ID:</p>
            <p style={bookingIdText}>{quote.id}</p>
            <p style={{ ...paragraph, marginTop: 0, marginBottom: '24px', color: '#7c2d3a' }}>
              Ready to secure your spot? Retrieve your quote on our website to finalize your appointment.
            </p>
            <a href={baseUrl} target="_blank" rel="noopener noreferrer" style={button}>
                Complete Your Booking
            </a>
        </div>
      </div>

      <div style={section}>
        <h2 style={sectionTitle}>A Quick Reminder of Your Quote</h2>
        <p style={paragraph}>Here's a reminder of the personalized package you created. We have two exceptional pricing tiers available for you to choose from when you confirm.</p>
        
        <div style={{ padding: '24px', border: '1px solid #eaeaea', borderRadius: '12px', marginBottom: '24px', backgroundColor: '#fdfdfd' }}>
            <h3 style={{ ...sectionTitle, fontSize: '20px', textAlign: 'center', marginTop: 0, marginBottom: '16px' }}>
                Your Services
            </h3>
            {quote.booking.days.map((day, index) => (
              <div key={index} style={{ marginBottom: '12px', fontSize: '15px' }}>
                <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#333' }}>
                  {day.serviceName} on {day.date}
                </p>
                <p style={{ margin: 0, paddingLeft: '15px', color: '#555' }}>
                  &bull; Time: {day.getReadyTime}<br/>
                  &bull; Location: {day.location}
                </p>
              </div>
            ))}
        </div>
      </div>
      
      <p style={{ ...paragraph, fontSize: '14px', color: '#6c757d', textAlign: 'center', marginBottom: 0 }}>
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
