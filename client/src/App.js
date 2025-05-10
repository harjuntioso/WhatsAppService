import React, { useState, useEffect } from 'react';
import axios from 'axios';
import QRCode from 'qrcode.react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Configure Axios
axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true;

function App() {
  const [status, setStatus] = useState('disconnected');
  const [qrData, setQrData] = useState('');
  const [formData, setFormData] = useState({
    number: '',
    message: ''
  });

  // Check WhatsApp status periodically
  const checkStatus = async () => {
    try {
      const response = await axios.get('/api/whatsapp/status');
      setStatus(response.data.status);
      if (response.data.qr_code) {
        setQrData(response.data.qr_code);
      }
    } catch (error) {
      //toast.error('Failed to check status: ' + error.message);
    }
  };

  // Set up polling
  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/whatsapp/send', formData);
      toast.success(`Message sent! ID: ${response.data.messageId}`);
      setFormData({ ...formData, message: '' }); // Clear message field
    } catch (error) {
      toast.error(`Failed to send: ${error.response?.data?.message || error.message}`);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="App bg-gray-100 min-h-screen flex flex-col items-center">
      <header className="my-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">WhatsApp Message Sender</h1>
        
        {/* Status Indicator */}
        <div className={`status text-lg font-medium mb-4 ${status === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
          Status: {status === 'connected' ? '✅ Ready' : '❌ Disconnected'}
        </div>

        {/* QR Code Display */}
        {status !== 'connected' && qrData && (
          <div className="qr-container text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Scan QR Code</h3>
            <img 
              src={`data:image/png;base64,${qrData}`} 
              alt="WhatsApp QR Code" 
              className="mx-auto mb-4"
              style={{ width: 256, height: 256 }}
            />
            <p className="text-gray-600">Open WhatsApp → Linked Devices → Scan QR Code</p>
          </div>
        )}

        {/* Message Form */}
        <form onSubmit={handleSubmit} className="message-form bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md mx-auto">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Phone Number (with country code):</label>
            <input
              type="text"
              name="number"
              value={formData.number}
              onChange={handleChange}
              placeholder="6281234567890"
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Message:</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows="4"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <button 
            type="submit" 
            disabled={status !== 'connected'}
            className={`w-full py-2 px-4 rounded text-white font-bold ${
              status === 'connected' ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Send Message
          </button>
        </form>

        <ToastContainer position="bottom-right" />
      </header>
    </div>
  );
}

export default App;