
import * as React from 'react';
import type { FinalQuote, Quote, PriceTier } from '@/lib/types';

interface QuoteEmailTemplateProps {
  quote: FinalQuote;
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
};

const heading = {
  fontSize: '32px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#484848',
};

const paragraph = {
  fontSize: '18px',
  lineHeight: '1.4',
  color: '#484848',
};

const section = {
  border: '1px solid #e5e5e5',
  borderRadius: '3px',
  padding: '20px',
  marginBottom: '20px',
};

const item = {
  display: 'flex',
  justifyContent: 'space-between',
};

const itemDescription = {
  fontSize: '14px',
  color: '#555',
};

const itemPrice = {
  fontSize: '14px',
  color: '#555',
  fontWeight: 500,
};

const totalStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '20px',
  paddingTop: '20px',
  borderTop: '1px solid #e5e5e5',
};

const totalDescription = {
  fontSize: '18px',
  color: '#484848',
  fontWeight: 700,
};

const totalPrice = {
  fontSize: '24px',
  color: '#484848',
  fontWeight: 700,
};

const button = {
  backgroundColor: '#5E5DF0',
  borderRadius: '999px',
  color: '#fff',
  fontSize: '15px',
  fontWeight: 'bold',
  lineHeight: '1.4',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '12px 24px',
  display: 'block',
  margin: '20px auto',
};

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';


const PriceBreakdown = ({ quote, title }: { quote: Quote, title: string }) => (
  <div style={{ ...section, marginBottom: '10px' }}>
    <h2 style={{ ...heading, fontSize: '20px', marginBottom: '15px' }}>
      {title}
    </h2>
    {quote.lineItems.map((item, index) => (
      <div key={index} style={item}>
        <p style={{ ...itemDescription, paddingLeft: item.description.startsWith('  -') || item.description.startsWith('Party:') ? '15px' : '0' }}>
          {item.description}
        </p>
        <p style={itemPrice}>${item.price.toFixed(2)}</p>
      </div>
    ))}
    <div style={totalStyle}>
      <p style={totalDescription}>Grand Total</p>
      <p style={totalPrice}>${quote.total.toFixed(2)}</p>
    </div>
  </div>
);


const QuoteEmailTemplate: React.FC<Readonly<QuoteEmailTemplateProps>> = ({ quote }) => (
  <div style={main}>
    <div style={container}>
      <h1 style={heading}>Sellaya</h1>
      <p style={paragraph}>
        Hi {quote.contact.name},
      </p>

      {quote.status === 'confirmed' ? (
        <p style={paragraph}>
          Thank you for your booking! Your appointment with {' '}
          {quote.selectedQuote === 'lead' ? 'Anum - Lead Artist' : 'the Team'} is confirmed.
        </p>
      ) : (
        <p style={paragraph}>
          Thank you for your interest! Here are the personalized quotes you requested.
          When you're ready, you can confirm your booking details and proceed to payment using the link below.
        </p>
      )}


       {quote.status === 'quoted' && (
        <a href={`${baseUrl}/book/${quote.id}`} style={button}>
          View and Confirm Your Booking
        </a>
      )}


      <div style={section}>
        <h2 style={{ ...heading, fontSize: '20px', marginBottom: '15px' }}>Booking Summary</h2>
        <p style={{ ...itemDescription, color: '#777', marginBottom: '15px' }}>Booking ID: {quote.id}</p>
        {quote.booking.days.map((day, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <p style={{...item, fontWeight: 500}}>
              <span>{day.date} at {day.getReadyTime}</span>
              <span>{day.serviceName}</span>
            </p>
            <p style={{...itemDescription, marginLeft: '10px'}}>- {day.serviceOption}</p>
            <p style={{...itemDescription, marginLeft: '10px'}}>- Location: {day.location}</p>
            {day.addOns.map((addon, i) => (
              <p key={i} style={{...itemDescription, marginLeft: '10px'}}>- {addon}</p>
            ))}
          </div>
        ))}
         {quote.booking.trial && (
             <div>
                <p style={{...item, fontWeight: 500}}>
                    <span>Bridal Trial: {quote.booking.trial.date} at {quote.booking.trial.time}</span>
                </p>
             </div>
         )}
         {quote.booking.bridalParty && (
            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
                <p style={{...item, fontWeight: 500, marginBottom: '5px'}}>
                    <span>Bridal Party Services</span>
                </p>
                {quote.booking.bridalParty.services.map((partySvc, i) => (
                    <p key={i} style={{...itemDescription, marginLeft: '10px'}}>- {partySvc.service} (x{partySvc.quantity})</p>
                ))}
                {quote.booking.bridalParty.airbrush > 0 && <p style={{...itemDescription, marginLeft: '10px'}}>- Airbrush Service (x{quote.booking.bridalParty.airbrush})</p>}
            </div>
         )}
         {quote.booking.address && (
              <div style={{...item, marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #e5e5e5'}}>
                 <span style={{...itemDescription, color: '#777'}}>Service Address:</span>
                 <span style={{...itemPrice, color: '#777', textAlign: 'right'}}>{quote.booking.address.street},<br/>{quote.booking.address.city}, {quote.booking.address.province}, {quote.booking.address.postalCode}</span>
             </div>
         )}
      </div>
      
      {quote.status === 'confirmed' && quote.selectedQuote ? (
          <PriceBreakdown 
            quote={quote.quotes[quote.selectedQuote]}
            title={`Confirmed Quote: ${quote.selectedQuote === 'lead' ? 'Anum - Lead Artist' : 'Team'}`}
          />
      ) : (
        <>
            <PriceBreakdown quote={quote.quotes.lead} title="Quote: Anum - Lead Artist"/>
            <PriceBreakdown quote={quote.quotes.team} title="Quote: Team"/>
        </>
      )}

      
      <p style={{ ...paragraph, fontSize: '14px', color: '#999' }}>
        This quote is valid for 7 days. If you have any questions, please reply to this email.
      </p>
      <p style={{ ...paragraph, fontSize: '12px', color: '#ccc' }}>
        &copy; {new Date().getFullYear()} Sellaya.ca. All rights reserved.
      </p>
    </div>
  </div>
);

export default QuoteEmailTemplate;
