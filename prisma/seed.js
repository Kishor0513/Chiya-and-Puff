/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const adminName = 'admin';
    const existing = await prisma.user.findFirst({ where: { name: adminName } });

    if (!existing) {
        const password = await bcrypt.hash('admin123', 10);
        await prisma.user.create({
            data: {
                name: adminName,
                password,
                role: 'ADMIN'
            }
        });
        console.log('Created super admin account: admin / admin123');
    }

    const waiterName = 'waiter1';
    const existingWaiter = await prisma.user.findFirst({ where: { name: waiterName } });

    if (!existingWaiter) {
        const password = await bcrypt.hash('waiter123', 10);
        await prisma.user.create({
            data: {
                name: waiterName,
                password,
                role: 'WAITER'
            }
        });
        console.log('Created waiter account: waiter1 / waiter123');
    }

    const chefName = 'chef';
    const existingChef = await prisma.user.findFirst({ where: { name: chefName } });

    if (!existingChef) {
        const password = await bcrypt.hash('chef123', 10);
        await prisma.user.create({
            data: {
                name: chefName,
                password,
                role: 'CHEF'
            }
        });
        console.log('Created chef account: chef / chef123');
    }
    // Seed Nepalese Menu Items
    const existingMenu = await prisma.menuItem.count();
    if (existingMenu === 0) {
        const defaultMenu = [
            // Momo 
            { name: 'Chicken Momo (Steamed)', description: 'Classic Nepalese chicken dumplings served with spicy tomato achar.', price: 200, category: 'Mains', available: true },
            { name: 'Chicken Momo (Fried)', description: 'Crispy fried chicken dumplings with authentic local spices.', price: 250, category: 'Mains', available: true },
            { name: 'Chicken Momo (Jhol)', description: 'Chicken dumplings dipped in a rich, tangy sesame and tomato soup.', price: 280, category: 'Mains', available: true },
            { name: 'Chicken Momo (C)', description: 'Spicy chili pan-fried chicken dumplings with bell peppers.', price: 300, category: 'Mains', available: true },
            { name: 'Buff Momo (Steamed)', description: 'Traditional buffalo meat dumplings.', price: 180, category: 'Mains', available: true },
            { name: 'Buff Momo (Fried)', description: 'Crispy fried buffalo dumplings.', price: 230, category: 'Mains', available: true },
            { name: 'Buff Momo (C)', description: 'Spicy chili buffalo dumplings.', price: 250, category: 'Mains', available: true },
            { name: 'Veg Momo (Steamed)', description: 'Steamed dumplings filled with mixed vegetables and paneer.', price: 150, category: 'Mains', available: true },
            { name: 'Veg Momo (Jhol)', description: 'Vegetable dumplings in a tangy soup.', price: 200, category: 'Mains', available: true },

            // Noodles
            { name: 'Veg Chowmein', description: 'Stir-fried noodles with fresh vegetables and soy sauce.', price: 150, category: 'Mains', available: true },
            { name: 'Chicken Chowmein', description: 'Stir-fried noodles with chicken slices and vegetables.', price: 200, category: 'Mains', available: true },
            { name: 'Buff Chowmein', description: 'Stir-fried noodles with buffalo meat slices.', price: 180, category: 'Mains', available: true },
            { name: 'Mixed Chowmein', description: 'Noodles stir-fried with chicken, buff, egg, and vegetables.', price: 250, category: 'Mains', available: true },
            { name: 'Veg Thukpa', description: 'Hearty Himalayan noodle soup with vegetables.', price: 180, category: 'Mains', available: true },
            { name: 'Chicken Thukpa', description: 'Hearty Himalayan noodle soup with chicken and herbs.', price: 220, category: 'Mains', available: true },

            // Snacks / Starters
            { name: 'Aloo Sadeko', description: 'Spicy and tangy marinated potato salad, perfect as a starter.', price: 120, category: 'Starters', available: true },
            { name: 'Wai Wai Sadeko', description: 'Spicy dry noodle snack mixed with onions, tomatoes, and herbs.', price: 100, category: 'Starters', available: true },
            { name: 'Bhatmas Sadeko', description: 'Crispy roasted soybeans tossed in spices and lemon.', price: 100, category: 'Starters', available: true },
            { name: 'Peanut Sadeko', description: 'Spicy roasted peanuts with chopped onions and chilies.', price: 120, category: 'Starters', available: true },
            { name: 'Chicken Chilli', description: 'Crispy battered chicken chunks tossed in spicy soy-chili sauce.', price: 350, category: 'Starters', available: true },
            { name: 'Pork Roast', description: 'Slow-roasted pork belly slices with traditional dipping sauce.', price: 400, category: 'Starters', available: true },
            { name: 'Chicken Choila', description: 'Newari style grilled chicken tossed in authentic spices and mustard oil.', price: 300, category: 'Starters', available: true },
            { name: 'Buff Choila', description: 'Spicy grilled buffalo meat mixed with garlic, ginger, and mustard oil.', price: 280, category: 'Starters', available: true },
            { name: 'Sekuwa (Mutton)', description: 'Roasted and spiced mutton skewers straight from the grill.', price: 450, category: 'Starters', available: true },
            { name: 'Sekuwa (Chicken)', description: 'Grilled chicken skewers marinated in local spices.', price: 350, category: 'Starters', available: true },
            { name: 'Pani Puri', description: 'Crispy hollow puris filled with spicy, tangy flavored water.', price: 100, category: 'Starters', available: true },
            { name: 'Chatpate', description: 'Spicy, tangy mixture of puffed rice, instant noodles, and herbs.', price: 80, category: 'Starters', available: true },

            // Traditional Sets
            { name: 'Nepalese Veg Thali', description: 'Complete meal with rice, lentil soup (dal), seasonal vegetable curries, saag, and achar.', price: 250, category: 'Mains', available: true },
            { name: 'Chicken Thali', description: 'Nepalese thali served with chicken curry.', price: 350, category: 'Mains', available: true },
            { name: 'Mutton Thali', description: 'Nepalese thali served with rich mutton curry.', price: 450, category: 'Mains', available: true },

            // Drinks
            { name: 'Masala Chiya', description: 'Traditional milk tea brewed with warming spices.', price: 50, category: 'Drinks', available: true },
            { name: 'Black Chiya', description: 'Simple traditional black tea.', price: 40, category: 'Drinks', available: true },
            { name: 'Lemon Tea', description: 'Hot black tea with freshly squeezed lemon.', price: 60, category: 'Drinks', available: true },
            { name: 'Black Coffee', description: 'Freshly brewed strong black coffee.', price: 80, category: 'Drinks', available: true },
            { name: 'Milk Coffee', description: 'Classic milk coffee.', price: 100, category: 'Drinks', available: true },
            { name: 'Cold Coffee', description: 'Sweetened iced coffee.', price: 150, category: 'Drinks', available: true },
            { name: 'Lassi (Sweet)', description: 'Traditional sweet yogurt drink.', price: 120, category: 'Drinks', available: true },
            { name: 'Banana Lassi', description: 'Yogurt drink blended with fresh bananas.', price: 150, category: 'Drinks', available: true },
            { name: 'Coke / Sprite / Fanta', description: 'Chilled carbonated beverage.', price: 60, category: 'Drinks', available: true },

            // Desserts
            { name: 'Juju Dhau', description: 'King curd (sweetened yogurt) traditional to Bhaktapur.', price: 100, category: 'Desserts', available: true },
            { name: 'Lal Mohan', description: 'Deep fried milk dough balls soaked in sugar syrup.', price: 80, category: 'Desserts', available: true },
            { name: 'Rasbari', description: 'Soft cheese balls in light sugar syrup.', price: 80, category: 'Desserts', available: true },
            { name: 'Sikarni', description: 'Sweetened yogurt flavored with cardamom and nuts.', price: 120, category: 'Desserts', available: true }
        ];

        for (const item of defaultMenu) {
            await prisma.menuItem.create({ data: item });
        }
        console.log('Seeded traditional Nepalese menu items.');
    } // End of existingMenu if block

    // Seed Default Tables (1-5)
    const existingTables = await prisma.table.count();
    if (existingTables === 0) {
        const crypto = require('crypto');
        for (let i = 1; i <= 5; i++) {
            await prisma.table.create({
                data: {
                    tableNumber: i,
                    qrData: crypto.randomBytes(8).toString('hex'),
                    status: 'AVAILABLE'
                }
            });
        }
        console.log('Seeded 5 default tables.');
    }
} // End of main function

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
