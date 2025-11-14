
import * as React from 'react';
import type { FinalQuote, Quote, PriceTier } from '@/lib/types';
import { GST_RATE } from '@/lib/services';

interface QuoteEmailTemplateProps {
  quote: FinalQuote;
  baseUrl: string;
}

// --- Inline CSS Styles for a Professional Look ---
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  padding: '24px',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '24px',
  width: '100%',
  maxWidth: '600px',
  border: '1px solid #dfe3e8',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
};

const header = {
  textAlign: 'center' as const,
  paddingBottom: '20px',
  borderBottom: '1px solid #e8e8e8',
};

const heading = {
  fontSize: '32px',
  lineHeight: '1.2',
  fontWeight: '700',
  color: '#212529',
  margin: '0 0 10px 0',
  fontFamily: 'Georgia, serif',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#495057',
  margin: '0 0 24px 0',
};

const section = {
  padding: '24px 0',
  borderBottom: '1px solid #e8e8e8',
};

const sectionTitle = {
  fontSize: '22px',
  fontWeight: 600,
  color: '#212529',
  marginBottom: '20px',
};

const item = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '15px',
  color: '#495057',
  marginBottom: '8px',
};

const itemDescription = {
  fontWeight: 500,
};

const itemPrice = {
  fontWeight: 600,
  fontFamily: 'monospace',
};

const subItem = {
  ...item,
  paddingLeft: '20px',
  color: '#6c757d',
  fontSize: '14px',
};

const totalStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '16px',
  paddingTop: '16px',
  borderTop: '1px solid #e8e8e8',
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
  color: '#E11D48', // primary color
};

const footer = {
  padding: '20px 0 0 0',
  textAlign: 'center' as const,
  fontSize: '12px',
  color: '#999',
};

const instructionBox = {
    background: '#fffbe6', // A light yellow
    border: '1px solid #ffe58f',
    borderRadius: '8px',
    padding: '24px',
    textAlign: 'center' as const,
    margin: '24px 0',
};

const bookingIdLabel = {
    fontSize: '16px',
    color: '#856404',
    marginBottom: '8px',
};

const bookingIdText = {
    fontSize: '24px',
    fontWeight: 700,
    color: '#856404',
    fontFamily: 'monospace',
    margin: '0 0 20px 0',
};

const button = {
  backgroundColor: '#E11D48',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '14px 24px',
  display: 'inline-block',
};

const PriceBreakdown = ({ quote, title }: { quote: Quote; title: string }) => (
  <div style={{ padding: '24px', border: '1px solid #e8e8e8', borderRadius: '12px', marginBottom: '20px', backgroundColor: '#fcfcfd' }}>
    <h3 style={{ ...sectionTitle, fontSize: '20px', textAlign: 'center', marginTop: 0, marginBottom: '24px' }}>
      {title}
    </h3>
    {quote.lineItems.map((lineItem, index) => (
      <div key={index} style={lineItem.description.startsWith('  -') || lineItem.description.startsWith('Party:') ? subItem : item}>
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
        {quote.status === 'confirmed' ? (
          <p style={paragraph}>
            Thank you for your booking! Your appointment with{' '}
            <strong>{quote.selectedQuote === 'lead' ? 'Anum - Lead Artist' : 'the Team'}</strong> is confirmed. A summary is below for your records.
          </p>
        ) : (
          <p style={paragraph}>
            Thank you for your interest! Here is the personalized quote you requested. Please review the details and follow the instructions below to confirm your booking.
          </p>
        )}
        
        {quote.status === 'quoted' && (
            <div style={instructionBox}>
                <p style={bookingIdLabel}>Your Booking ID is:</p>
                <p style={bookingIdText}>{quote.id}</p>
                <p style={{ ...paragraph, marginTop: 0, marginBottom: '24px', color: '#856404' }}>
                  To finalize your appointment, please visit our website and use the "Find Your Quote" feature with this ID.
                </p>
                <a href={baseUrl} target="_blank" rel="noopener noreferrer" style={button}>
                    Proceed to Website
                </a>
            </div>
        )}
      </div>

      <div style={section}>
        <h2 style={sectionTitle}>Booking Summary</h2>
        
        {quote.booking.days.map((day, index) => (
          <div key={index} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px dashed #e8e8e8' }}>
            <p style={{...item, fontWeight: 700, color: '#333', fontSize: '16px'}}>
              <span>Day {index + 1}: {day.serviceName}</span>
              <span>{day.date} at {day.getReadyTime}</span>
            </p>
            <p style={subItem}>&bull; Style: {day.serviceOption}</p>
            <p style={subItem}>&bull; Location: {day.location}</p>
            {day.addOns.length > 0 && day.addOns.map((addon, i) => (
              <p key={i} style={subItem}>&bull; Add-on: {addon}</p>
            ))}
          </div>
        ))}

        {quote.booking.trial && (
           <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px dashed #e8e8e8' }}>
            <p style={{...item, fontWeight: 700, color: '#333', fontSize: '16px'}}>
              <span>Bridal Trial</span>
              <span>{quote.booking.trial.date} at {quote.booking.trial.time}</span>
            </p>
          </div>
        )}

        {quote.booking.bridalParty && quote.booking.bridalParty.services.length > 0 && (
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed #e0e0e0' }}>
            <p style={{...itemDescription, fontWeight: 700, color: '#333', fontSize: '16px', marginBottom: '10px'}}>
              Bridal Party Services
            </p>
            {quote.booking.bridalParty.services.map((partySvc, i) => (
              <p key={i} style={subItem}>&bull; {partySvc.service} (x{partySvc.quantity})</p>
            ))}
            {quote.booking.bridalParty.airbrush > 0 && <p style={subItem}>&bull; Airbrush Service (x{quote.booking.bridalParty.airbrush})</p>}
          </div>
        )}

        {quote.booking.address && (
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed #e0e0e0' }}>
            <p style={{...itemDescription, fontWeight: 700, color: '#333', fontSize: '16px', marginBottom: '5px'}}>
              Service Address
            </p>
            <p style={{...subItem, fontStyle: 'italic', lineHeight: '1.5'}}>
              {quote.booking.address.street},<br/>
              {quote.booking.address.city}, {quote.booking.address.province}, {quote.booking.address.postalCode}
            </p>
          </div>
        )}
      </div>
      
      <div style={section}>
        <h2 style={sectionTitle}>Price Details</h2>
        {quote.status === 'confirmed' && quote.selectedQuote ? (
          <PriceBreakdown 
            quote={quote.quotes[quote.selectedQuote]}
            title={`Confirmed Quote: ${quote.selectedQuote === 'lead' ? 'Anum - Lead Artist' : 'Team'}`}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <PriceBreakdown quote={quote.quotes.lead} title="Quote: Anum - Lead Artist"/>
            <PriceBreakdown quote={quote.quotes.team} title="Quote: Team"/>
          </div>
        )}
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

    