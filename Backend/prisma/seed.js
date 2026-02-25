// Seed script to populate database with sample data
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...\n');

    // Clear existing data (in correct order to respect foreign keys)
    console.log('🗑️  Clearing existing data...');
    await prisma.deliveryAssignment.deleteMany();
    await prisma.income.deleteMany();
    await prisma.expense.deleteMany();
    await prisma.vehicleLoad.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.inventory.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Existing data cleared.\n');

    // ─── 1. USERS (1 Admin + 5 Agents) ───
    console.log('👤 Creating users...');
    const hashedPassword = await bcrypt.hash('1234', 10);

    const admin = await prisma.user.create({
        data: {
            name: 'Admin',
            email: 'admin@aquatrack.com',
            password: hashedPassword,
            role: 'admin',
            phone: '0771234567',
        }
    });

    const agents = [];
    const agentData = [
        { name: 'Rajesh Kumar', email: 'rajesh@aquatrack.com', phone: '0779876543', monthlySales: 150000 },
        { name: 'Priya Sharma', email: 'priya@aquatrack.com', phone: '0771112233', monthlySales: 180000 },
        { name: 'Nimesh Perera', email: 'nimesh@aquatrack.com', phone: '0774445566', monthlySales: 120000 },
        { name: 'Dilanka Silva', email: 'dilanka@aquatrack.com', phone: '0777788899', monthlySales: 200000 },
        { name: 'Kasun Fernando', email: 'kasun@aquatrack.com', phone: '0773216547', monthlySales: 95000 },
    ];

    for (const agent of agentData) {
        const created = await prisma.user.create({
            data: {
                name: agent.name,
                email: agent.email,
                password: hashedPassword,
                role: 'agent',
                phone: agent.phone,
                monthlySales: agent.monthlySales,
            }
        });
        agents.push(created);
    }
    console.log(`✅ Created 1 admin + ${agents.length} agents.\n`);

    // ─── 2. VEHICLES (5 vehicles – each agent gets 1) ───
    console.log('🚛 Creating vehicles...');
    const vehicleData = [
        { id: 'WP-KA-1234', vehicleType: 'Tata Ace', capacity: '1 Ton', location: 'Colombo Warehouse', fuelLevel: 85 },
        { id: 'WP-KB-5678', vehicleType: 'Isuzu ELF', capacity: '3 Tons', location: 'Negombo Branch', fuelLevel: 60 },
        { id: 'SP-CA-9012', vehicleType: 'Mitsubishi Canter', capacity: '2 Tons', location: 'Kandy Depot', fuelLevel: 45 },
        { id: 'NW-GA-3456', vehicleType: 'Toyota Dyna', capacity: '1.5 Tons', location: 'Kurunegala Hub', fuelLevel: 92 },
        { id: 'EP-BA-7890', vehicleType: 'Tata Ace', capacity: '1 Ton', location: 'Batticaloa Branch', fuelLevel: 30 },
    ];

    const vehicles = [];
    for (let i = 0; i < vehicleData.length; i++) {
        const v = await prisma.vehicle.create({
            data: {
                ...vehicleData[i],
                status: i === 4 ? 'Maintenance' : (i === 2 ? 'Loading' : 'Active'),
                driverId: agents[i].id,  // 1 agent per vehicle
            }
        });
        vehicles.push(v);
    }
    console.log(`✅ Created ${vehicles.length} vehicles (each assigned to 1 agent).\n`);

    // ─── 3. VEHICLE LOADS ───
    console.log('📦 Creating vehicle loads...');
    const loadData = [
        { vehicleId: vehicles[0].id, item: 'Water Bottles 500ml', quantity: '50 cases' },
        { vehicleId: vehicles[0].id, item: 'Water Bottles 1L', quantity: '30 cases' },
        { vehicleId: vehicles[1].id, item: 'Pepsi 300ml', quantity: '40 cases' },
        { vehicleId: vehicles[1].id, item: 'Coca-Cola 500ml', quantity: '25 cases' },
        { vehicleId: vehicles[2].id, item: 'Mineral Water 1.5L', quantity: '60 cases' },
        { vehicleId: vehicles[3].id, item: 'Red Bull Energy 250ml', quantity: '20 cases' },
        { vehicleId: vehicles[3].id, item: 'Sprite 500ml', quantity: '35 cases' },
    ];

    for (const load of loadData) {
        await prisma.vehicleLoad.create({ data: load });
    }
    console.log(`✅ Created ${loadData.length} vehicle loads.\n`);

    // ─── 4. INVENTORY (15 products) ───
    console.log('🏪 Creating inventory...');
    const inventoryData = [
        { name: 'Water Bottles 500ml', category: 'Packaged Water', stock: 500, unit: 'Cases', price: 200, supplier: 'CeylonAqua', status: 'In Stock' },
        { name: 'Water Bottles 1L', category: 'Packaged Water', stock: 350, unit: 'Cases', price: 350, supplier: 'CeylonAqua', status: 'In Stock' },
        { name: 'Mineral Water 1.5L', category: 'Packaged Water', stock: 8, unit: 'Cases', price: 480, supplier: 'CeylonAqua', status: 'Low Stock' },
        { name: 'Mineral Water 5L', category: 'Packaged Water', stock: 120, unit: 'Bottles', price: 150, supplier: 'CeylonAqua', status: 'In Stock' },
        { name: 'Pepsi 300ml', category: 'Soft Drinks', stock: 6, unit: 'Cases', price: 600, supplier: 'Lanka Beverages', status: 'Low Stock' },
        { name: 'Pepsi 1.5L', category: 'Soft Drinks', stock: 200, unit: 'Cases', price: 900, supplier: 'Lanka Beverages', status: 'In Stock' },
        { name: 'Coca-Cola 500ml', category: 'Soft Drinks', stock: 280, unit: 'Cases', price: 650, supplier: 'Lanka Beverages', status: 'In Stock' },
        { name: 'Coca-Cola 1.5L', category: 'Soft Drinks', stock: 0, unit: 'Cases', price: 950, supplier: 'Lanka Beverages', status: 'Out of Stock' },
        { name: 'Sprite 500ml', category: 'Soft Drinks', stock: 150, unit: 'Cases', price: 600, supplier: 'Lanka Beverages', status: 'In Stock' },
        { name: 'Red Bull Energy 250ml', category: 'Energy Drinks', stock: 5, unit: 'Cases', price: 2400, supplier: 'Island Imports', status: 'Low Stock' },
        { name: 'Monster Energy 500ml', category: 'Energy Drinks', stock: 90, unit: 'Cases', price: 1800, supplier: 'Island Imports', status: 'In Stock' },
        { name: 'Elephant House Ginger', category: 'Soft Drinks', stock: 220, unit: 'Cases', price: 550, supplier: 'EH Productions', status: 'In Stock' },
        { name: 'Elephant House Cream Soda', category: 'Soft Drinks', stock: 180, unit: 'Cases', price: 550, supplier: 'EH Productions', status: 'In Stock' },
        { name: 'Fresh Fruit Juice 1L', category: 'Juices', stock: 75, unit: 'Bottles', price: 320, supplier: 'MD Lanka', status: 'In Stock' },
        { name: 'Orange Juice 500ml', category: 'Juices', stock: 12, unit: 'Cases', price: 480, supplier: 'MD Lanka', status: 'Low Stock' },
    ];

    for (const item of inventoryData) {
        await prisma.inventory.create({ data: item });
    }
    console.log(`✅ Created ${inventoryData.length} inventory items.\n`);

    // ─── 5. CUSTOMERS (12 customers) ───
    console.log('🏬 Creating customers...');
    const customerData = [
        { shopName: 'Saman Grocery', ownerName: 'Saman Jayasinghe', phone: '0712345678', email: 'saman@gmail.com', address: '123 Galle Rd', city: 'Colombo', area: 'Bambalapitiya', businessType: 'Retail', distance: 3.5 },
        { shopName: 'Nimal Supermart', ownerName: 'Nimal Bandara', phone: '0723456789', email: 'nimal@gmail.com', address: '45 Kandy Rd', city: 'Colombo', area: 'Borella', businessType: 'Supermarket', distance: 5.2 },
        { shopName: 'Lucky Restaurant', ownerName: 'Chaminda Perera', phone: '0734567890', email: 'lucky@gmail.com', address: '78 Main Street', city: 'Negombo', area: 'Town Center', businessType: 'Restaurant', distance: 12.8 },
        { shopName: 'Royal Hotel', ownerName: 'Dinesh Fernando', phone: '0745678901', email: 'royal@hotel.lk', address: '200 Beach Rd', city: 'Negombo', area: 'Beach Area', businessType: 'Hotel', distance: 14.5 },
        { shopName: 'Perera & Sons', ownerName: 'Lakshman Perera', phone: '0756789012', email: null, address: '56 Temple Rd', city: 'Kandy', area: 'Peradeniya', businessType: 'Wholesale', distance: 25.0 },
        { shopName: 'City Mart', ownerName: 'Aruna Silva', phone: '0767890123', email: 'citymart@gmail.com', address: '12 D.S. Senanayake', city: 'Kandy', area: 'City Center', businessType: 'Supermarket', distance: 22.3 },
        { shopName: 'Malini Kadey', ownerName: 'Malini Herath', phone: '0778901234', email: null, address: '34 Market Lane', city: 'Kurunegala', area: 'Pola Junction', businessType: 'Retail', distance: 35.0 },
        { shopName: 'Green Valley Resort', ownerName: 'Sunil Abeyrathne', phone: '0789012345', email: 'green@resort.lk', address: '8 Hill Rd', city: 'Nuwara Eliya', area: 'Town Center', businessType: 'Hotel', distance: 45.0 },
        { shopName: 'Amara Wholesale', ownerName: 'Amara Dissanayake', phone: '0790123456', email: 'amara@wholesale.lk', address: '90 Industrial Zone', city: 'Colombo', area: 'Peliyagoda', businessType: 'Wholesale', distance: 8.0 },
        { shopName: 'New Gemunu Stores', ownerName: 'Gemunu Wijesinghe', phone: '0711234567', email: null, address: '15 Station Rd', city: 'Gampaha', area: 'Near Station', businessType: 'Retail', distance: 18.5 },
        { shopName: 'Sunshine Cafe', ownerName: 'Thilini Gamage', phone: '0722345678', email: 'sunshine@gmail.com', address: '3 Lake Rd', city: 'Colombo', area: 'Beira Lake', businessType: 'Restaurant', distance: 2.0 },
        { shopName: 'Eastern Traders', ownerName: 'Fathima Nazeer', phone: '0733456789', email: 'eastern@traders.lk', address: '120 Main Rd', city: 'Batticaloa', area: 'Town Center', businessType: 'Wholesale', distance: 65.0, status: 'Inactive' },
    ];

    const customers = [];
    for (const c of customerData) {
        const created = await prisma.customer.create({
            data: {
                shopName: c.shopName,
                ownerName: c.ownerName,
                phone: c.phone,
                email: c.email,
                address: c.address,
                city: c.city,
                area: c.area,
                businessType: c.businessType,
                status: c.status || 'Active',
                distance: c.distance,
                updatedAt: new Date(),
            }
        });
        customers.push(created);
    }
    console.log(`✅ Created ${customers.length} customers.\n`);

    // ─── 6. DELIVERY ASSIGNMENTS (15 deliveries with various statuses) ───
    console.log('🚚 Creating delivery assignments...');
    const deliveryData = [
        { vehicleId: vehicles[0].id, customerId: customers[0].id, productName: 'Water Bottles 500ml', quantity: '10 cases', status: 'Delivered', deliveredBy: agents[0].id, unitPrice: 200, totalAmount: 2000 },
        { vehicleId: vehicles[0].id, customerId: customers[1].id, productName: 'Water Bottles 1L', quantity: '15 cases', status: 'Delivered', deliveredBy: agents[0].id, unitPrice: 350, totalAmount: 5250 },
        { vehicleId: vehicles[0].id, customerId: customers[10].id, productName: 'Mineral Water 1.5L', quantity: '5 cases', status: 'Pending', deliveredBy: null, unitPrice: 480, totalAmount: 2400 },
        { vehicleId: vehicles[1].id, customerId: customers[2].id, productName: 'Pepsi 300ml', quantity: '20 cases', status: 'Delivered', deliveredBy: agents[1].id, unitPrice: 600, totalAmount: 12000 },
        { vehicleId: vehicles[1].id, customerId: customers[3].id, productName: 'Coca-Cola 500ml', quantity: '15 cases', status: 'In Transit', deliveredBy: null, unitPrice: 650, totalAmount: 9750 },
        { vehicleId: vehicles[1].id, customerId: customers[8].id, productName: 'Pepsi 1.5L', quantity: '30 cases', status: 'Pending', deliveredBy: null, unitPrice: 900, totalAmount: 27000 },
        { vehicleId: vehicles[2].id, customerId: customers[4].id, productName: 'Mineral Water 5L', quantity: '40 bottles', status: 'Delivered', deliveredBy: agents[2].id, unitPrice: 150, totalAmount: 6000 },
        { vehicleId: vehicles[2].id, customerId: customers[5].id, productName: 'Sprite 500ml', quantity: '25 cases', status: 'Delivered', deliveredBy: agents[2].id, unitPrice: 600, totalAmount: 15000 },
        { vehicleId: vehicles[3].id, customerId: customers[6].id, productName: 'Red Bull Energy 250ml', quantity: '8 cases', status: 'Delivered', deliveredBy: agents[3].id, unitPrice: 2400, totalAmount: 19200 },
        { vehicleId: vehicles[3].id, customerId: customers[7].id, productName: 'Elephant House Ginger', quantity: '12 cases', status: 'In Transit', deliveredBy: null, unitPrice: 550, totalAmount: 6600 },
        { vehicleId: vehicles[3].id, customerId: customers[9].id, productName: 'Monster Energy 500ml', quantity: '6 cases', status: 'Pending', deliveredBy: null, unitPrice: 1800, totalAmount: 10800 },
        { vehicleId: vehicles[0].id, customerId: customers[0].id, productName: 'Fresh Fruit Juice 1L', quantity: '20 bottles', status: 'Delivered', deliveredBy: agents[0].id, unitPrice: 320, totalAmount: 6400 },
        { vehicleId: vehicles[1].id, customerId: customers[2].id, productName: 'Orange Juice 500ml', quantity: '10 cases', status: 'Failed', deliveredBy: null, unitPrice: 480, totalAmount: 4800 },
        { vehicleId: vehicles[2].id, customerId: customers[5].id, productName: 'Coca-Cola 500ml', quantity: '20 cases', status: 'Delivered', deliveredBy: agents[2].id, unitPrice: 650, totalAmount: 13000 },
        { vehicleId: vehicles[3].id, customerId: customers[6].id, productName: 'Elephant House Cream Soda', quantity: '15 cases', status: 'Delivered', deliveredBy: agents[3].id, unitPrice: 550, totalAmount: 8250 },
    ];

    const deliveries = [];
    for (const d of deliveryData) {
        const created = await prisma.deliveryAssignment.create({
            data: {
                vehicleId: d.vehicleId,
                customerId: d.customerId,
                productName: d.productName,
                quantity: d.quantity,
                status: d.status,
                deliveredBy: d.deliveredBy,
                unitPrice: d.unitPrice,
                totalAmount: d.totalAmount,
                deliveredAt: d.status === 'Delivered' ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
                updatedAt: new Date(),
            }
        });
        deliveries.push(created);
    }
    console.log(`✅ Created ${deliveries.length} delivery assignments.\n`);

    // ─── 7. INCOME (from delivered orders + manual entries) ───
    console.log('💰 Creating income records...');
    const incomeData = [
        { type: 'Sales', category: 'Product Sales', amount: 2000, description: 'Water Bottles 500ml - 10 cases to Saman Grocery', customerId: customers[0].id, agentId: agents[0].id, paymentMethod: 'Cash' },
        { type: 'Sales', category: 'Product Sales', amount: 5250, description: 'Water Bottles 1L - 15 cases to Nimal Supermart', customerId: customers[1].id, agentId: agents[0].id, paymentMethod: 'Bank Transfer' },
        { type: 'Sales', category: 'Product Sales', amount: 12000, description: 'Pepsi 300ml - 20 cases to Lucky Restaurant', customerId: customers[2].id, agentId: agents[1].id, paymentMethod: 'Cash' },
        { type: 'Sales', category: 'Product Sales', amount: 6000, description: 'Mineral Water 5L - 40 bottles to Perera & Sons', customerId: customers[4].id, agentId: agents[2].id, paymentMethod: 'Cheque' },
        { type: 'Sales', category: 'Product Sales', amount: 15000, description: 'Sprite 500ml - 25 cases to City Mart', customerId: customers[5].id, agentId: agents[2].id, paymentMethod: 'Cash' },
        { type: 'Sales', category: 'Product Sales', amount: 19200, description: 'Red Bull Energy - 8 cases to Malini Kadey', customerId: customers[6].id, agentId: agents[3].id, paymentMethod: 'Cash' },
        { type: 'Sales', category: 'Product Sales', amount: 6400, description: 'Fresh Fruit Juice - 20 bottles to Saman Grocery', customerId: customers[0].id, agentId: agents[0].id, paymentMethod: 'Cash' },
        { type: 'Sales', category: 'Product Sales', amount: 13000, description: 'Coca-Cola 500ml - 20 cases to City Mart', customerId: customers[5].id, agentId: agents[2].id, paymentMethod: 'Bank Transfer' },
        { type: 'Sales', category: 'Product Sales', amount: 8250, description: 'EH Cream Soda - 15 cases to Malini Kadey', customerId: customers[6].id, agentId: agents[3].id, paymentMethod: 'Cash' },
        { type: 'Other', category: 'Commission', amount: 5000, description: 'Monthly commission from Lanka Beverages partnership', customerId: null, agentId: null, paymentMethod: 'Bank Transfer' },
    ];

    for (const inc of incomeData) {
        await prisma.income.create({
            data: {
                type: inc.type,
                category: inc.category,
                amount: inc.amount,
                description: inc.description,
                customerId: inc.customerId,
                agentId: inc.agentId,
                paymentMethod: inc.paymentMethod,
                date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                updatedAt: new Date(),
            }
        });
    }
    console.log(`✅ Created ${incomeData.length} income records.\n`);

    // ─── 8. EXPENSES ───
    console.log('💸 Creating expense records...');
    const expenseData = [
        { type: 'Operational', category: 'Fuel', amount: 15000, description: 'Diesel for WP-KA-1234 - weekly refuel', vehicleId: vehicles[0].id, agentId: agents[0].id, approvedBy: admin.id },
        { type: 'Operational', category: 'Fuel', amount: 22000, description: 'Diesel for WP-KB-5678 - long route refuel', vehicleId: vehicles[1].id, agentId: agents[1].id, approvedBy: admin.id },
        { type: 'Operational', category: 'Fuel', amount: 12000, description: 'Diesel for SP-CA-9012 - Kandy routes', vehicleId: vehicles[2].id, agentId: agents[2].id, approvedBy: admin.id },
        { type: 'Maintenance', category: 'Vehicle Repair', amount: 35000, description: 'Engine service for EP-BA-7890', vehicleId: vehicles[4].id, agentId: null, approvedBy: admin.id },
        { type: 'Maintenance', category: 'Tire Replacement', amount: 48000, description: 'New tires (4) for WP-KB-5678', vehicleId: vehicles[1].id, agentId: null, approvedBy: admin.id },
        { type: 'Operational', category: 'Salary', amount: 45000, description: 'Agent salary - Rajesh Kumar (Jan 2026)', vehicleId: null, agentId: agents[0].id, approvedBy: admin.id },
        { type: 'Operational', category: 'Salary', amount: 45000, description: 'Agent salary - Priya Sharma (Jan 2026)', vehicleId: null, agentId: agents[1].id, approvedBy: admin.id },
        { type: 'Operational', category: 'Salary', amount: 45000, description: 'Agent salary - Nimesh Perera (Jan 2026)', vehicleId: null, agentId: agents[2].id, approvedBy: admin.id },
        { type: 'Operational', category: 'Salary', amount: 45000, description: 'Agent salary - Dilanka Silva (Jan 2026)', vehicleId: null, agentId: agents[3].id, approvedBy: admin.id },
        { type: 'Operational', category: 'Salary', amount: 45000, description: 'Agent salary - Kasun Fernando (Jan 2026)', vehicleId: null, agentId: agents[4].id, approvedBy: admin.id },
        { type: 'Operational', category: 'Utilities', amount: 8500, description: 'Warehouse electricity bill - January', vehicleId: null, agentId: null, approvedBy: admin.id },
        { type: 'Operational', category: 'Rent', amount: 65000, description: 'Colombo warehouse monthly rent', vehicleId: null, agentId: null, approvedBy: admin.id },
        { type: 'Maintenance', category: 'Vehicle Repair', amount: 12000, description: 'Brake pad replacement - NW-GA-3456', vehicleId: vehicles[3].id, agentId: null, approvedBy: admin.id },
    ];

    for (const exp of expenseData) {
        await prisma.expense.create({
            data: {
                type: exp.type,
                category: exp.category,
                amount: exp.amount,
                description: exp.description,
                vehicleId: exp.vehicleId,
                agentId: exp.agentId,
                approvedBy: exp.approvedBy,
                billNumber: `BILL-${Math.floor(1000 + Math.random() * 9000)}`,
                date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                updatedAt: new Date(),
            }
        });
    }
    console.log(`✅ Created ${expenseData.length} expense records.\n`);

    // ─── SUMMARY ───
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Database seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   👤 Users:      1 admin + ${agents.length} agents`);
    console.log(`   🚛 Vehicles:   ${vehicles.length} (each with 1 agent)`);
    console.log(`   📦 Loads:      ${loadData.length}`);
    console.log(`   🏪 Inventory:  ${inventoryData.length} products`);
    console.log(`   🏬 Customers:  ${customers.length}`);
    console.log(`   🚚 Deliveries: ${deliveries.length}`);
    console.log(`   💰 Income:     ${incomeData.length} records`);
    console.log(`   💸 Expenses:   ${expenseData.length} records`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📌 Login credentials:');
    console.log('   Admin:  admin@aquatrack.com / 1234');
    console.log('   Agents: rajesh@aquatrack.com / 1234');
    console.log('           priya@aquatrack.com / 1234');
    console.log('           nimesh@aquatrack.com / 1234');
    console.log('           dilanka@aquatrack.com / 1234');
    console.log('           kasun@aquatrack.com / 1234');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
