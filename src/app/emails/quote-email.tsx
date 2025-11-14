
import * as React from 'react';
import type { FinalQuote, Quote, PriceTier } from '@/lib/types';
import { GST_RATE } from '@/lib/services';

interface QuoteEmailTemplateProps {
  quote: FinalQuote;
  baseUrl: string;
}

// --- Inline CSS Styles for a Professional Look ---
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

const item = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '15px',
  color: '#495057',
  marginBottom: '10px',
};

const itemDescription = {
  fontWeight: 500,
};

const itemPrice = {
  fontWeight: 600,
  fontFamily: 'monospace',
};

const totalStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '16px',
  paddingTop: '16px',
  borderTop: '1px solid #eaeaea',
};

const grandTotalStyle = {
  ...totalStyle,
  borderTop: '2px solid #212529',
};

const grandTotalLabel = {
  fontSize: '18px',
  fontWeight: 700,
  color: '#212529',
};

const grandTotalPrice = {
  fontSize: '24px',
  fontWeight: 700,
  color: '#E11D48',
};

const footer = {
  padding: '30px 0 0 0',
  textAlign: 'center' as const,
  fontSize: '12px',
  color: '#999',
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

const bookingSummaryCard = {
    padding: '20px',
    border: '1px solid #eaeaea',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
    marginBottom: '20px',
}

const bookingSummaryTitle = {
    fontSize: '18px',
    fontWeight: 600,
    color: '#333',
    margin: 0,
};
const bookingSummarySubtitle = {
    fontSize: '15px',
    color: '#777',
    margin: '4px 0 0 0',
}

const bookingSummaryDetail = {
    fontSize: '14px',
    color: '#555',
    margin: '12px 0 0 0',
    paddingLeft: '18px',
    position: 'relative' as const,
}
const bulletPoint = {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    color: '#E11D48',
}


const PriceBreakdown = ({ quote, title }: { quote: Quote; title: string }) => (
  <div style={{ padding: '24px', border: '1px solid #eaeaea', borderRadius: '12px', marginBottom: '24px', backgroundColor: '#fdfdfd' }}>
    <h3 style={{ ...sectionTitle, fontSize: '20px', textAlign: 'center', marginTop: 0, marginBottom: '24px' }}>
      {title}
    </h3>
    {quote.lineItems.map((lineItem, index) => (
      <div key={index} style={{...item, paddingLeft: lineItem.description.startsWith('  -') || lineItem.description.startsWith('Party:') ? '20px' : '0' }}>
        <span style={itemDescription}>{lineItem.description.replace(/  - /g, '')}</span>
        <span style={itemPrice}>${lineItem.price.toFixed(2)}</span>
      </div>
    ))}
    <div style={totalStyle}>
      <span style={{...itemDescription, color: '#333'}}>Subtotal</span>
      <span style={itemPrice}>${quote.subtotal.toFixed(2)}</span>
    </div>
    <div style={{ ...item, paddingTop: '5px' }}>
      <span style={{...itemDescription, color: '#333'}}>GST ({(GST_RATE * 100).toFixed(0)}%)</span>
      <span style={itemPrice}>${quote.tax.toFixed(2)}</span>
    </div>
    <div style={grandTotalStyle}>
      <span style={grandTotalLabel}>Grand Total</span>
      <span style={grandTotalPrice}>${quote.total.toFixed(2)}</span>
    </div>
  </div>
);

const QuoteEmailTemplate: React.FC<Readonly<QuoteEmailTemplateProps>> = ({ quote, baseUrl }) => (
  <div style={main}>
    <div style={container}>
      <div style={header}>
        <h1 style={heading}>Looks by Anum</h1>
        <p style={{...paragraph, color: '#6c757d', marginBottom: 0}}>Your Personalized Makeup Quote</p>
      </div>

      <div style={section}>
        <p style={paragraph}>
          Hi {quote.contact.name},
        </p>
        <p style={paragraph}>
          Thank you for your interest! We've prepared a personalized quote based on your selections. Please find all the details below.
        </p>
        
        <div style={instructionBox}>
            <p style={bookingIdLabel}>Your Booking ID:</p>
            <p style={bookingIdText}>{quote.id}</p>
            <p style={{ ...paragraph, marginTop: 0, marginBottom: '24px', color: '#7c2d3a' }}>
              To finalize your appointment, please visit our website and use the "Find Your Quote" feature with this ID.
            </p>
            <a href={baseUrl} target="_blank" rel="noopener noreferrer" style={button}>
                Proceed to Website
            </a>
        </div>
      </div>

      <div style={section}>
        <h2 style={sectionTitle}>Booking Summary</h2>
        
        {quote.booking.days.map((day, index) => (
          <div key={index} style={bookingSummaryCard}>
            <p style={bookingSummaryTitle}>Day {index + 1}: {day.serviceName}</p>
            <p style={bookingSummarySubtitle}>{day.date} at {day.getReadyTime}</p>
            <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '16px 0' }} />
            <p style={bookingSummaryDetail}><span style={bulletPoint}>&bull;</span>Style: {day.serviceOption}</p>
            <p style={bookingSummaryDetail}><span style={bulletPoint}>&bull;</span>Location: {day.location}</p>
            {day.addOns.length > 0 && 
                <div style={{ ...bookingSummaryDetail, marginTop: '16px' }}>
                    <p style={{ margin: 0, fontWeight: 500, color: '#333' }}>Add-ons:</p>
                    <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', listStyleType: "'- '", color: '#555' }}>
                         {day.addOns.map((addon, i) => <li key={i} style={{ marginBottom: '4px' }}>{addon}</li>)}
                    </ul>
                </div>
            }
          </div>
        ))}

        {quote.booking.trial && (
           <div style={bookingSummaryCard}>
             <p style={bookingSummaryTitle}>Bridal Trial</p>
             <p style={bookingSummarySubtitle}>{quote.booking.trial.date} at {quote.booking.trial.time}</p>
          </div>
        )}

        {quote.booking.bridalParty && quote.booking.bridalParty.services.length > 0 && (
          <div style={bookingSummaryCard}>
            <p style={bookingSummaryTitle}>Bridal Party Services</p>
             <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '16px 0' }} />
            {quote.booking.bridalParty.services.map((partySvc, i) => (
              <p key={i} style={bookingSummaryDetail}><span style={bulletPoint}>&bull;</span> {partySvc.service} (x{partySvc.quantity})</p>
            ))}
            {quote.booking.bridalParty.airbrush > 0 && <p style={bookingSummaryDetail}><span style={bulletPoint}>&bull;</span>Airbrush Service (x{quote.booking.bridalParty.airbrush})</p>}
          </div>
        )}

        {quote.booking.address && (
          <div style={bookingSummaryCard}>
            <p style={bookingSummaryTitle}>Service Address</p>
             <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '16px 0' }} />
            <p style={{...paragraph, margin: 0, fontStyle: 'italic', color: '#555' }}>
              {quote.booking.address.street},<br/>
              {quote.booking.address.city}, {quote.booking.address.province}, {quote.booking.address.postalCode}
            </p>
          </div>
        )}
      </div>
      
      <div style={section}>
        <h2 style={sectionTitle}>Price Details</h2>
        <p style={paragraph}>Below are the two pricing options available for your selected services. You will be able to choose your preferred tier when confirming your booking on our website.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <PriceBreakdown quote={quote.quotes.lead} title="Option 1: Anum - Lead Artist"/>
          <PriceBreakdown quote={quote.quotes.team} title="Option 2: Team"/>
        </div>
      </div>
      
      <p style={{ ...paragraph, fontSize: '14px', color: '#6c757d', textAlign: 'center', marginBottom: 0 }}>
        This quote is valid for 7 days. If you have any questions, please reply directly to this email.
      </p>
      
      <div style={footer}>
        <p>&copy; {new Date().getFullYear()} Looks by Anum. All rights reserved.</p>
        <p>Powered by <a href="https://www.instagram.com/sellayadigital" target="_blank" rel="noopener noreferrer" style={{color: '#999', textDecoration: 'underline'}}>Sellaya</a>.</p>
      </div>
    </div>
  </div>
);

export default QuoteEmailTemplate;
