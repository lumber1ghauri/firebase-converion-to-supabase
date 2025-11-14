
import * as React from 'react';
import type { FinalQuote, Quote, PriceTier } from '@/lib/types';
import { GST_RATE } from '@/lib/services';

interface QuoteEmailTemplateProps {
  quote: FinalQuote;
}

// --- Inline CSS Styles ---
const main = {
  backgroundColor: '#f9f9f9',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  padding: '20px 0',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px',
  width: '100%',
  maxWidth: '600px',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
};

const header = {
  textAlign: 'center' as const,
  paddingBottom: '20px',
  borderBottom: '1px solid #e0e0e0',
};

const heading = {
  fontSize: '28px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#333',
  margin: '0 0 10px 0',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.5',
  color: '#555',
};

const section = {
  padding: '20px 0',
  borderBottom: '1px solid #e0e0e0',
};

const sectionTitle = {
  fontSize: '20px',
  fontWeight: 600,
  color: '#333',
  marginBottom: '15px',
};

const item = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '14px',
  color: '#555',
  marginBottom: '5px',
};

const itemDescription = {
  fontWeight: 500,
};

const itemPrice = {
  fontWeight: 600,
};

const subItem = {
  ...item,
  paddingLeft: '20px',
  color: '#777',
};

const totalStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '10px',
  paddingTop: '10px',
  borderTop: '1px solid #e0e0e0',
};

const grandTotalStyle = {
  ...totalStyle,
  borderTop: '2px solid #333',
  marginTop: '10px',
  paddingTop: '10px',
};

const grandTotalLabel = {
  fontSize: '18px',
  fontWeight: 700,
  color: '#333',
};

const grandTotalPrice = {
  fontSize: '22px',
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
    background: '#fafafa',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center' as const,
    margin: '20px 0',
};

const bookingIdText = {
    fontSize: '18px',
    fontWeight: 700,
    color: '#333',
    margin: '0 0 10px 0',
};


const PriceBreakdown = ({ quote, title }: { quote: Quote; title: string }) => (
  <div style={{ padding: '15px', border: '1px solid #eee', borderRadius: '8px', marginBottom: '20px' }}>
    <h3 style={{ ...sectionTitle, fontSize: '18px', textAlign: 'center', marginTop: 0 }}>
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

const QuoteEmailTemplate: React.FC<Readonly<QuoteEmailTemplateProps>> = ({ quote }) => (
  <div style={main}>
    <div style={container}>
      <div style={header}>
        <h1 style={heading}>Looks by Anum</h1>
        <p style={{...paragraph, color: '#777'}}>Your Personalized Makeup Quote</p>
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
            Thank you for your interest! Here is the personalized quote you requested. Please review the details below.
          </p>
        )}
        {quote.status === 'quoted' && (
            <div style={instructionBox}>
                <p style={{ ...paragraph, marginTop: 0 }}>To confirm your booking, please visit our website and use the "Find Your Quote" feature with your Booking ID:</p>
                <p style={bookingIdText}>{quote.id}</p>
            </div>
        )}
      </div>

      <div style={section}>
        <h2 style={sectionTitle}>Booking Summary</h2>
        <p style={{ ...paragraph, fontSize: '12px', color: '#999', margin: '-10px 0 15px 0' }}>Booking ID: {quote.id}</p>
        
        {quote.booking.days.map((day, index) => (
          <div key={index} style={{ marginBottom: '15px', padding: '10px', background: '#fafafa', borderRadius: '4px' }}>
            <p style={{...item, fontWeight: 700, color: '#333', fontSize: '15px'}}>
              <span>Day {index + 1}: {day.serviceName}</span>
              <span>{day.date} at {day.getReadyTime}</span>
            </p>
            <p style={subItem}>- Style: {day.serviceOption}</p>
            <p style={subItem}>- Location: {day.location}</p>
            {day.addOns.length > 0 && day.addOns.map((addon, i) => (
              <p key={i} style={subItem}>- Add-on: {addon}</p>
            ))}
          </div>
        ))}

        {quote.booking.trial && (
          <div style={{ marginBottom: '15px', padding: '10px', background: '#fafafa', borderRadius: '4px' }}>
            <p style={{...item, fontWeight: 700, color: '#333', fontSize: '15px'}}>
              <span>Bridal Trial</span>
              <span>{quote.booking.trial.date} at {quote.booking.trial.time}</span>
            </p>
          </div>
        )}

        {quote.booking.bridalParty && quote.booking.bridalParty.services.length > 0 && (
          <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #e0e0e0' }}>
            <p style={{...itemDescription, fontWeight: 700, color: '#333', fontSize: '15px', marginBottom: '10px'}}>
              Bridal Party Services
            </p>
            {quote.booking.bridalParty.services.map((partySvc, i) => (
              <p key={i} style={subItem}>- {partySvc.service} (x{partySvc.quantity})</p>
            ))}
            {quote.booking.bridalParty.airbrush > 0 && <p style={subItem}>- Airbrush Service (x{quote.booking.bridalParty.airbrush})</p>}
          </div>
        )}

        {quote.booking.address && (
          <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #e0e0e0' }}>
            <p style={{...itemDescription, fontWeight: 700, color: '#333', fontSize: '15px', marginBottom: '5px'}}>
              Service Address
            </p>
            <p style={{...subItem, fontStyle: 'italic'}}>
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
          <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
            <PriceBreakdown quote={quote.quotes.lead} title="Quote: Anum - Lead Artist"/>
            <PriceBreakdown quote={quote.quotes.team} title="Quote: Team"/>
          </div>
        )}
      </div>
      
      <p style={{ ...paragraph, fontSize: '14px', color: '#777', textAlign: 'center' }}>
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
