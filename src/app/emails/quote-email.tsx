import * as React from 'react';
import type { FinalQuote } from '@/lib/types';

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


const QuoteEmailTemplate: React.FC<Readonly<QuoteEmailTemplateProps>> = ({ quote }) => (
  <div style={main}>
    <div style={container}>
      <h1 style={heading}>GlamBook Pro</h1>
      <p style={paragraph}>
        Hi {quote.contact.name},
      </p>
      <p style={paragraph}>
        Thank you for your interest! Here is the personalized quote you requested.
      </p>

      <div style={section}>
        <h2 style={{ ...heading, fontSize: '20px', marginBottom: '15px' }}>Booking Summary</h2>
        {quote.booking.days.map((day, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <p style={{...item, fontWeight: 500}}>
              <span>{day.date} at {day.getReadyTime}</span>
              <span>{day.serviceName}</span>
            </p>
            <p style={{...itemDescription, marginLeft: '10px'}}>- {day.serviceOption}</p>
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
         <div style={{...item, marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #e5e5e5'}}>
             <span style={{...itemDescription, color: '#777'}}>Location:</span>
             <span style={{...itemPrice, color: '#777'}}>{quote.booking.location}</span>
         </div>
      </div>
      
      <div style={section}>
        <h2 style={{ ...heading, fontSize: '20px', marginBottom: '15px' }}>Price Breakdown</h2>
        {quote.quote.lineItems.map((item, index) => (
          <div key={index} style={item}>
            <p style={{ ...itemDescription, paddingLeft: item.description.startsWith('  -') ? '15px' : '0' }}>{item.description}</p>
            <p style={itemPrice}>${item.price.toFixed(2)}</p>
          </div>
        ))}
        {quote.quote.surcharge && (
            <>
                <div style={{height: '1px', backgroundColor: '#e5e5e5', margin: '15px 0'}} />
                <div style={item}>
                    <p style={{...itemDescription, fontWeight: 500}}>{quote.quote.surcharge.description}</p>
                    <p style={itemPrice}>${quote.quote.surcharge.price.toFixed(2)}</p>
                </div>
            </>
        )}
      </div>

      <div style={{...section, backgroundColor: '#f9f9f9'}}>
         <div style={totalStyle}>
            <p style={totalDescription}>Grand Total</p>
            <p style={totalPrice}>${quote.quote.total.toFixed(2)}</p>
         </div>
      </div>
      
      <p style={{ ...paragraph, fontSize: '14px', color: '#999' }}>
        Ready to book? You can return to the website to finalize your appointment. This quote is valid for 7 days.
      </p>
      <p style={{ ...paragraph, fontSize: '12px', color: '#ccc' }}>
        &copy; {new Date().getFullYear()} GlamBook Pro. All rights reserved.
      </p>
    </div>
  </div>
);

export default QuoteEmailTemplate;
