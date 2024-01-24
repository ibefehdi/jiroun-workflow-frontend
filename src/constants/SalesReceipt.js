import React from 'react';
import "./SalesReceipt.css"
const SalesReceipt = ({ apiResponse }) => {
    // Format the date for printing
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="sales-receipt">
            <header>
                {/* Company header info here */}
                <h1>Jiroun</h1>
                <p>123 Anywhere St., Any City, ST 12345</p>
                {/* ... other header information */}
            </header>

            <section className="receipt-body">
                {/* Buyer info */}
                <div className="buyer-info">
                    <p>Name: {apiResponse?.contractorForPayment?.fName + ' ' + apiResponse?.contractorForPayment?.lName}</p>
                    <p>Address: { /* Address here if available */}</p>
                    <p>Date: {formatDate(new Date()) /* Current date or from apiResponse */}</p>
                </div>

                <h2>Cash Sales Receipt</h2>

                {/* Items Table */}
                <table>
                    <thead>
                        <tr>
                            <th>QTY</th>
                            <th>DESCRIPTION OF GOODS</th>
                            <th>RATE</th>
                            <th>UNIT</th>
                            <th>PRICE</th>
                            <th>REF.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {apiResponse?.items?.map((item, index) => (
                            <tr key={index}>
                                <td>{item.itemQuantity}</td>
                                <td>{item.itemName}</td>
                                <td>{item.unitPrice}</td>
                                <td>{/* Unit goes here */}</td>
                                <td>{item.totalPrice}</td>
                                <td>{item.boqId}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Total */}
                <div className="total">
                    <p>Total: {/* Calculate total here */}</p>
                </div>
            </section>

            <footer>
                {/* Footer info */}
                <p>Make sure to received the above mentioned goods in good condition.</p>
                <p>No refund of money after payment.</p>
                {/* ... other footer information */}
            </footer>
        </div>
    );
};

export default SalesReceipt;
