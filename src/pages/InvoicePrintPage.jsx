// ============================================================
//  src/pages/InvoicePrintPage.jsx
//  FBR Invoice Print — IRN + QR Code ke saath
// ============================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';

export default function InvoicePrintPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading]  = useState(true);

  useEffect(() => {
    API.get(`/invoices/${id}`)
      .then(r => setInvoice(r.data))
      .catch(() => toast.error('Invoice nahi mili'))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => window.print();

  if (loading) return <div style={{ display:'flex', justifyContent:'center', paddingTop:60 }}><div className="spinner"/></div>;
  if (!invoice) return <div style={{ padding:40, textAlign:'center' }}>Invoice nahi mili</div>;

  const customer = invoice.customerId;
  const items    = invoice.items || [];
  const qrData   = invoice.irn
    ? `IRN:${invoice.irn}|INV:${invoice.invoiceNumber}|DATE:${invoice.invoiceDate}|AMT:${invoice.totalAmount}`
    : `INV:${invoice.invoiceNumber}|DATE:${invoice.invoiceDate}|AMT:${invoice.totalAmount}`;

  // QR Code URL — Google Charts API use karte hain
  const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=120x120&chl=${encodeURIComponent(qrData)}&choe=UTF-8`;

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
          .print-page { padding: 20px !important; box-shadow: none !important; }
        }
        @media screen {
          body { background: #f0f0f0; }
          .print-page { max-width: 800px; margin: 20px auto; background: #fff; padding: 32px; box-shadow: 0 2px 20px rgba(0,0,0,.1); border-radius: 8px; }
        }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px 10px; border: 1px solid #ddd; font-size: 12px; text-align: left; }
        th { background: #f5f5f5; font-weight: 600; }
      `}</style>

      {/* Action buttons — print mein nahi aayenge */}
      <div className="no-print" style={{ maxWidth:800, margin:'20px auto', display:'flex', gap:8, justifyContent:'flex-end' }}>
        <button className="btn" onClick={() => navigate(-1)}>← Wapas</button>
        <button className="btn btn-primary" onClick={handlePrint}>🖨️ Print / Save PDF</button>
      </div>

      <div className="print-page">

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, borderBottom:'2px solid #1a6b45', paddingBottom:16 }}>
          <div>
            <div style={{ fontSize:22, fontWeight:700, color:'#1a6b45' }}>SALES INVOICE</div>
            <div style={{ fontSize:11, color:'#666', marginTop:2 }}>FBR Digital Invoice</div>
          </div>
          <div style={{ textAlign:'right' }}>
            {/* QR Code */}
            <img src={qrUrl} alt="QR Code" style={{ width:100, height:100 }} />
            <div style={{ fontSize:9, color:'#999', marginTop:2 }}>Scan to verify</div>
          </div>
        </div>

        {/* IRN Box */}
        {invoice.irn && (
          <div style={{ background:'#e8f5ee', border:'1px solid #1a6b45', borderRadius:6, padding:'8px 14px', marginBottom:16, display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ fontSize:11, color:'#1a6b45', fontWeight:600 }}>FBR Invoice Reference No (IRN):</div>
            <div style={{ fontFamily:'monospace', fontSize:13, fontWeight:700, color:'#134f33' }}>{invoice.irn}</div>
          </div>
        )}

        {/* Seller & Buyer */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
          {/* Seller */}
          <div style={{ border:'1px solid #ddd', borderRadius:6, padding:12 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#666', marginBottom:6, textTransform:'uppercase' }}>Seller</div>
            <div style={{ fontWeight:600, fontSize:13 }}>{customer?.businessName || invoice.sellerBusinessName}</div>
            <div style={{ fontSize:12, color:'#555', marginTop:3 }}>NTN: {customer?.ntn || invoice.sellerNTNCNIC}</div>
            <div style={{ fontSize:12, color:'#555' }}>STRN: {customer?.strn || '—'}</div>
            {(customer?.address || invoice.sellerAddress) && (
              <div style={{ fontSize:12, color:'#555' }}>{customer?.address || invoice.sellerAddress}</div>
            )}
            {(customer?.province || invoice.sellerProvince) && (
              <div style={{ fontSize:12, color:'#555' }}>{customer?.province || invoice.sellerProvince}</div>
            )}
          </div>

          {/* Buyer */}
          <div style={{ border:'1px solid #ddd', borderRadius:6, padding:12 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#666', marginBottom:6, textTransform:'uppercase' }}>Buyer</div>
            <div style={{ fontWeight:600, fontSize:13 }}>{invoice.buyerBusinessName || invoice.buyerName}</div>
            <div style={{ fontSize:12, color:'#555', marginTop:3 }}>
              NTN/CNIC: {invoice.buyerNTNCNIC || invoice.buyerNtn || '—'}
            </div>
            <div style={{ fontSize:12, color:'#555' }}>
              Type: {invoice.buyerRegistrationType || '—'}
            </div>
            {invoice.buyerProvince && (
              <div style={{ fontSize:12, color:'#555' }}>{invoice.buyerProvince}</div>
            )}
          </div>
        </div>

        {/* Invoice Details */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:20 }}>
          {[
            { label:'Invoice No',   value: invoice.invoiceNumber },
            { label:'Invoice Date', value: invoice.invoiceDate?.slice(0,10) },
            { label:'Invoice Type', value: invoice.invoiceType || 'Sale Invoice' },
            { label:'Scenario ID',  value: invoice.scenarioId || '—' },
          ].map(f => (
            <div key={f.label} style={{ border:'1px solid #ddd', borderRadius:6, padding:'8px 12px' }}>
              <div style={{ fontSize:10, color:'#999', textTransform:'uppercase' }}>{f.label}</div>
              <div style={{ fontSize:13, fontWeight:600, marginTop:2 }}>{f.value}</div>
            </div>
          ))}
        </div>

        {/* Items Table */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:12, fontWeight:700, marginBottom:6, color:'#333' }}>ITEMS</div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Description</th>
                <th>HS Code</th>
                <th>UOM</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Sale Value</th>
                <th>Tax</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? items.map((item, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{item.productDescription || '—'}</td>
                  <td style={{ fontFamily:'monospace', fontSize:11 }}>{item.hsCode || '—'}</td>
                  <td>{item.uoM || '—'}</td>
                  <td style={{ textAlign:'right' }}>{item.quantity?.toLocaleString()}</td>
                  <td style={{ textAlign:'right' }}>{item.rate || '—'}</td>
                  <td style={{ textAlign:'right' }}>{item.valueSalesExcludingST?.toLocaleString()}</td>
                  <td style={{ textAlign:'right' }}>{item.salesTaxApplicable?.toLocaleString()}</td>
                  <td style={{ textAlign:'right', fontWeight:600 }}>{item.totalValues?.toLocaleString()}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={9} style={{ textAlign:'center', color:'#999' }}>No items</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:24 }}>
          <div style={{ width:280 }}>
            {[
              { label:'Sale Value (excl. Tax)', value: invoice.saleValue },
              { label:'Sales Tax',              value: invoice.taxAmount },
            ].map(r => (
              <div key={r.label} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid #eee', fontSize:13 }}>
                <span style={{ color:'#555' }}>{r.label}</span>
                <span style={{ fontWeight:500 }}>PKR {r.value?.toLocaleString()}</span>
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', fontSize:15, fontWeight:700, color:'#1a6b45', borderTop:'2px solid #1a6b45', marginTop:4 }}>
              <span>Total Amount</span>
              <span>PKR {invoice.totalAmount?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid #eee', paddingTop:12 }}>
          <div style={{ fontSize:11, color:'#999' }}>
            Generated by FBR Invoice Portal
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:11, color:'#999' }}>Status:</span>
            <span style={{
              fontSize:12, fontWeight:600, padding:'3px 10px', borderRadius:20,
              background: invoice.status==='accepted' ? '#e8f5ee' : invoice.status==='rejected' ? '#fdf0ef' : '#fef9ec',
              color: invoice.status==='accepted' ? '#1a6b45' : invoice.status==='rejected' ? '#c0392b' : '#b7770d',
            }}>
              {invoice.status?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* FBR Note */}
        <div style={{ marginTop:16, padding:10, background:'#f9f9f9', borderRadius:6, fontSize:10, color:'#999', textAlign:'center' }}>
          This is a computer generated invoice. Verify at iris.fbr.gov.pk using the IRN number above.
        </div>

      </div>
    </>
  );
}
