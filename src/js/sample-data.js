// Initialize sample parcel data if none exists
function initializeSampleData() {
  if (!localStorage.getItem('parcels')) {
    const sampleParcels = [
      {
        id: 'PF123456789GB',
        sender: 'John Doe',
        receiver: 'Jane Smith',
        address: '123 Main St, London, UK',
        phone: '+44 1234 567890',
        email: 'jane@example.com',
        status: [
          {
            status: 'Processing',
            location: 'London Hub',
            timestamp: new Date().toISOString()
          }
        ]
      },
      {
        id: 'PF987654321GB',
        sender: 'Acme Corp',
        receiver: 'Bob Johnson',
        address: '456 High St, Manchester, UK',
        phone: '+44 9876 543210',
        email: 'bob@example.com',
        status: [
          {
            status: 'In Transit',
            location: 'Birmingham Depot',
            timestamp: new Date().toISOString()
          }
        ]
      },
      {
        id: 'PF112233445GB',
        sender: 'Global Imports',
        receiver: 'Sarah Williams',
        address: '789 Park Ave, Edinburgh, UK',
        phone: '+44 1122 334455',
        email: 'sarah@example.com',
        status: [
          {
            status: 'Out for Delivery',
            location: 'Edinburgh Central',
            timestamp: new Date().toISOString()
          }
        ]
      }
    ];
    localStorage.setItem('parcels', JSON.stringify(sampleParcels));
    console.log('Sample parcel data initialized');
  }
}

// Call the function when the script loads
initializeSampleData();
