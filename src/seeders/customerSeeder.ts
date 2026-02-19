import db from '../config/database.js';

export const seedCustomers = () => {
  const database = db.getDatabase();

  const customers = [
    {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@email.com',
      phone: '555-0101',
      address: '123 Main St, New York, NY 10001'
    },
    {
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@email.com',
      phone: '555-0102',
      address: '456 Oak Ave, Los Angeles, CA 90001'
    },
    {
      first_name: 'Michael',
      last_name: 'Johnson',
      email: 'michael.j@email.com',
      phone: '555-0103',
      address: '789 Pine Rd, Chicago, IL 60601'
    },
    {
      first_name: 'Emily',
      last_name: 'Williams',
      email: 'emily.w@email.com',
      phone: '555-0104',
      address: '321 Elm St, Houston, TX 77001'
    },
    {
      first_name: 'David',
      last_name: 'Brown',
      email: 'david.brown@email.com',
      phone: '555-0105',
      address: '654 Maple Dr, Phoenix, AZ 85001'
    },
    {
      first_name: 'Sarah',
      last_name: 'Davis',
      email: 'sarah.davis@email.com',
      phone: '555-0106',
      address: '987 Cedar Ln, Philadelphia, PA 19101'
    },
    {
      first_name: 'Robert',
      last_name: 'Miller',
      email: 'robert.m@email.com',
      phone: '555-0107',
      address: '147 Birch Ct, San Antonio, TX 78201'
    },
    {
      first_name: 'Lisa',
      last_name: 'Wilson',
      email: 'lisa.wilson@email.com',
      phone: '555-0108',
      address: '258 Walnut St, San Diego, CA 92101'
    }
  ];

  const insertCustomer = database.prepare(
    `INSERT INTO customers (first_name, last_name, email, phone, address)
     VALUES (?, ?, ?, ?, ?)`
  );

  const insertMany = database.transaction((customers) => {
    for (const customer of customers) {
      insertCustomer.run(
        customer.first_name,
        customer.last_name,
        customer.email,
        customer.phone,
        customer.address
      );
    }
  });

  insertMany(customers);
  console.log(`✅ ${customers.length} clientes insertados`);
};