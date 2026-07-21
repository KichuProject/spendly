require('dotenv').config();
const { connectDB } = require('./src/config/database');
const User = require('./src/models/User');
const Expense = require('./src/models/Expense');
const { generatePDF } = require('./src/services/pdfGenerator');
const fs = require('fs');
const path = require('path');

async function run() {
  console.log('Connecting to database...');
  await connectDB();
  
  console.log('Fetching a user...');
  const user = await User.findOne({});
  if (!user) {
    console.error('No user found in DB!');
    process.exit(1);
  }
  console.log(`Found user: ${user.name} (${user.email})`);
  
  console.log('Fetching transactions...');
  const txns = await Expense.find({ userId: user._id }).limit(20).lean();
  console.log(`Found ${txns.length} transactions.`);
  
  console.log('Generating PDF...');
  try {
    const buffer = await generatePDF(user, txns, {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      openingBalance: 5000,
      dataType: 'expenses',
    });
    console.log('PDF Generated Successfully! Buffer size:', buffer.length);
    fs.writeFileSync(path.join(__dirname, 'debug_output.pdf'), buffer);
    console.log('Saved statement to debug_output.pdf');
  } catch (err) {
    console.error('Error generating PDF:', err);
  }
  
  process.exit(0);
}

run();
