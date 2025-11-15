
import * as React from 'react';
import type { FinalQuote, Quote } from '@/lib/types';
import { GST_RATE } from '@/lib/services';

interface QuoteEmailTemplateProps {
  quote: FinalQuote;
  baseUrl: string;
}

// --- Inline CSS Styles using the App's Theme Colors ---
const main = {
  backgroundColor: 'hsl(345, 60%, 98%)', // Light Gray/Off-white from --background
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
  color: 'hsl(345, 80%, 50%)', // Deep Purple-Pink from --primary
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

const bookingSummaryCard = {
    padding: '24px',
    border: '1px solid hsl(345, 20%, 90%)', // --border
    borderRadius: '12px',
    backgroundColor: 'hsl(345, 60%, 98%)', // --background
    marginBottom: '20px',
}

const bookingSummaryTitle = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'hsl(345, 80%, 50%)', // --primary
    margin: '0 0 4px 0',
    fontFamily: "'Belleza', sans-serif",
};
const bookingSummarySubtitle = {
    fontSize: '16px',
    color: '#777',
    margin: '0 0 16px 0',
}

const bookingSummaryDetail = {
    fontSize: '15px',
    color: 'hsl(240, 10%, 3.9%)', // --foreground
    margin: '12px 0 0 0',
    paddingLeft: '20px',
    position: 'relative' as const,
}
const bulletPoint = {
    position: 'absolute' as const,
    left: '0px',
    top: '2px',
    color: 'hsl(345, 80%, 50%)', // --primary
    fontSize: '12px',
}

const priceBox = { 
  padding: '24px', 
  border: '1px solid hsl(345, 20%, 90%)', // --border
  borderRadius: '12px', 
  marginBottom: '24px', 
  backgroundColor: '#ffffff' 
};

const priceTitle = { 
  ...sectionTitle, 
  fontSize: '22px', 
  textAlign: 'center' as const,
  marginTop: 0, 
  marginBottom: '24px',
  color: 'hsl(345, 80%, 50%)', // --primary
};

const priceTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const priceItemCell = {
  padding: '8px 0',
  fontSize: '15px',
  color: 'hsl(240, 10%, 3.9%)',
};

const priceValueCell = {
  ...priceItemCell,
  textAlign: 'right' as const,
  fontWeight: 600,
  fontFamily: 'monospace',
};

const totalRow = {
  borderTop: '1px solid hsl(345, 20%, 90%)',
};

const totalCell = {
  padding: '16px 0 8px 0',
  fontSize: '15px',
};

const grandTotalRow = {
  borderTop: '2px solid hsl(240, 10%, 3.9%)',
};

const grandTotalLabelCell = {
  ...totalCell,
  fontSize: '18px',
  fontWeight: 700,
};

const grandTotalPriceCell = {
  ...grandTotalLabelCell,
  textAlign: 'right' as const,
  color: 'hsl(345, 80%, 50%)',
  fontSize: '24px',
};


const footer = {
  padding: '30px 0 0 0',
  textAlign: 'center' as const,
  fontSize: '13px',
  color: '#999',
};


const PriceBreakdown = ({ quote, title }: { quote: Quote; title: string }) => (
  <div style={priceBox}>
    <h3 style={priceTitle}>{title}</h3>
    <table style={priceTable}>
      <tbody>
        {quote.lineItems.map((lineItem, index) => (
          <tr key={index}>
            <td style={{...priceItemCell, paddingLeft: lineItem.description.startsWith('  -') || lineItem.description.startsWith('Party:') ? '20px' : '0' }}>
              {lineItem.description.replace(/  - /g, '')}
            </td>
            <td style={priceValueCell}>: ${lineItem.price.toFixed(2)}</td>
          </tr>
        ))}
        <tr style={totalRow}>
          <td style={totalCell}>Subtotal</td>
          <td style={{...priceValueCell, ...totalCell}}>: ${quote.subtotal.toFixed(2)}</td>
        </tr>
        <tr>
          <td style={priceItemCell}>GST ({(GST_RATE * 100).toFixed(0)}%)</td>
          <td style={priceValueCell}>: ${quote.tax.toFixed(2)}</td>
        </tr>
        <tr style={grandTotalRow}>
          <td style={grandTotalLabelCell}>Grand Total</td>
          <td style={grandTotalPriceCell}>: ${quote.total.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  </div>
);

const QuoteEmailTemplate: React.FC<Readonly<QuoteEmailTemplateProps>> = ({ quote, baseUrl }) => {
  const isConfirmed = quote.status === 'confirmed';

  return (
    <div style={main}>
      <div style={container}>
        <div style={header}>
          <h1 style={heading}>Looks by Anum</h1>
          <p style={{...paragraph, color: '#6c757d', fontSize: '18px', marginBottom: 0}}>
            {isConfirmed ? "Your Booking is Confirmed!" : "Your Personalized Makeup Quote"}
          </p>
        </div>

        <div style={section}>
          <p style={paragraph}>
            Hi {quote.contact.name},
          </p>
          <p style={paragraph}>
            {isConfirmed 
              ? "Thank you for confirming your booking! We are thrilled to be a part of your special day. Please review your confirmed service details below."
              : "Thank you for your interest! We've prepared a personalized quote based on your selections. Please find all the details below and follow the link to finalize your booking."
            }
          </p>
          
          {!isConfirmed && (
            <div style={{ textAlign: 'center', margin: '40px 0' }}>
                <a href={baseUrl} target="_blank" rel="noopener noreferrer" style={button}>
                    Complete Your Booking
                </a>
                <p style={{ fontSize: '14px', color: '#777', marginTop: '16px' }}>
                    Use Booking ID: <strong style={{color: 'hsl(240, 10%, 3.9%)'}}>{quote.id}</strong>
                </p>
            </div>
          )}
        </div>

        <div style={{ ...section, paddingTop: 0 }}>
          <h2 style={sectionTitle}>Booking Summary</h2>
          
          {quote.booking.days.map((day, index) => (
            <div key={index} style={bookingSummaryCard}>
              <p style={bookingSummaryTitle}>Day {index + 1}: {day.serviceName}</p>
              <p style={bookingSummarySubtitle}>{day.date} at {day.getReadyTime}</p>
              <hr style={{ border: 'none', borderTop: '1px solid hsl(345, 20%, 92%)', margin: '16px 0' }} />
              <p style={bookingSummaryDetail}><span style={bulletPoint}>&#9679;</span> Style: {day.serviceOption}</p>
              <p style={bookingSummaryDetail}><span style={bulletPoint}>&#9679;</span> Location: {day.location}</p>
              {day.addOns.length > 0 && 
                  <div style={{ ...bookingSummaryDetail, marginTop: '16px' }}>
                      <p style={{ margin: 0, fontWeight: 'bold', color: 'hsl(240, 10%, 3.9%)' }}>Add-ons:</p>
                      <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', listStyleType: "'— '" }}>
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
               <hr style={{ border: 'none', borderTop: '1px solid hsl(345, 20%, 92%)', margin: '16px 0' }} />
              {quote.booking.bridalParty.services.map((partySvc, i) => (
                <p key={i} style={bookingSummaryDetail}><span style={bulletPoint}>&#9679;</span> {partySvc.service} (x{partySvc.quantity})</p>
              ))}
              {quote.booking.bridalParty.airbrush > 0 && <p style={bookingSummaryDetail}><span style={bulletPoint}>&#9679;</span>Airbrush Service (x{quote.booking.bridalParty.airbrush})</p>}
            </div>
          )}

          {quote.booking.address && (
            <div style={bookingSummaryCard}>
              <p style={bookingSummaryTitle}>Service Address</p>
               <hr style={{ border: 'none', borderTop: '1px solid hsl(345, 20%, 92%)', margin: '16px 0' }} />
              <p style={{...paragraph, margin: 0, fontStyle: 'italic' }}>
                {quote.booking.address.street},<br/>
                {quote.booking.address.city}, {quote.booking.address.province}, {quote.booking.address.postalCode}
              </p>
            </div>
          )}
        </div>
        
        <div style={{ ...section, borderBottom: 'none', paddingTop: 0 }}>
          <h2 style={sectionTitle}>{isConfirmed ? "Final Price" : "Price Details"}</h2>
           {isConfirmed && quote.selectedQuote ? (
             <PriceBreakdown quote={quote.quotes[quote.selectedQuote]} title={quote.selectedQuote === 'lead' ? "Anum - Lead Artist" : "Team Artist"}/>
           ) : (
            <>
              <p style={{...paragraph, textAlign: 'center', marginTop: '-20px', paddingBottom: '20px' }}>Below are the two pricing options available for your selected services. You can choose your preferred tier when confirming your booking.</p>
              <div style={{display: 'block'}}>
                <PriceBreakdown quote={quote.quotes.lead} title="Option 1: Anum - Lead Artist"/>
                <PriceBreakdown quote={quote.quotes.team} title="Option 2: Team Artist"/>
              </div>
            </>
           )}
        </div>
        
        <p style={{ ...paragraph, fontSize: '14px', color: '#6c757d', textAlign: 'center', marginBottom: 0, marginTop: '20px' }}>
          {isConfirmed ? "We look forward to seeing you!" : "This quote is valid for 7 days. If you have any questions, please reply directly to this email."}
        </p>
        
        <div style={footer}>
          <p>&copy; {new Date().getFullYear()} Looks by Anum. All rights reserved.</p>
          <p>Powered by <a href="https://www.instagram.com/sellayadigital" target="_blank" rel="noopener noreferrer" style={{color: '#999', textDecoration: 'underline'}}>Sellaya</a>.</p>
        </div>
      </div>
    </div>
  );
}

export default QuoteEmailTemplate;
