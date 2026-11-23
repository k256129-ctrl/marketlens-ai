import random
from typing import Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.core.database import SessionLocal

router = APIRouter(prefix="/products", tags=["Products"])

MALL_CATEGORIES = [
    {
        "category": "Electronics",
        "items": [
            "4K Ultra HD Smart LED TV 55-Inch", "Active Noise Cancelling Wireless Headphones",
            "Portable Bluetooth Party Speaker", "True Wireless Earbuds Pro",
            "Smart Home Wi-Fi Security Camera", "Digital Inverter Microwave Oven",
            "Robotic Vacuum & Mop Cleaner", "4K Action Waterproof Camera",
            "Smart Air Purifier HEPA-13", "Soundbar Home Theater 2.1 System",
            "Universal GaN 65W Fast Charger", "Smart LED Strip Ambient Lights",
            "Mini Portable HD Projector", "Digital Blood Pressure & Pulse Monitor",
            "Rechargeable Handheld Garment Steamer", "Smart Wi-Fi Power Strip",
            "Wireless Charging Pad 3-in-1", "Noise Isolating Studio Monitor Headphones",
            "Portable Power Station 300W", "Digital Kitchen Weighing Scale",
            "Smart Doorbell Video Intercom", "USB-C Multiport Docking Station",
            "Cordless Cyclonic Stick Vacuum", "Smart Plug Energy Monitor",
            "Bluetooth FM Car Transmitter"
        ],
        "price_pkr": (2500, 145000),
        "images": [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80",
        ],
    },
    {
        "category": "Mobile Phones",
        "items": [
            "Galaxy S24 Ultra 5G 256GB", "iPhone 15 Pro Max Titanium 256GB",
            "Redmi Note 13 Pro+ 5G 12GB", "Tecno Camon 30 Premier 5G",
            "Infinix Zero 30 5G AMOLED", "Oppo Reno 11F 5G 256GB",
            "Vivo V30 Pro Zeiss Portrait", "Realme 12 Pro+ Periscope Edition",
            "Samsung Galaxy A55 5G Awesome Navy", "Google Pixel 8 Pro Obsidian",
            "OnePlus 12R 16GB Snapdragon", "iPhone 14 Midnight 128GB",
            "Xiaomi 14 Ultra Leica Camera", "Tecno Spark 20 Pro+ Curved",
            "Infinix Note 40 Pro Wireless Charge", "Samsung Galaxy Z Flip 5",
            "Realme C67 108MP Dual SIM", "Vivo Y100 80W FlashCharge",
            "Oppo A79 5G Glowing Green", "Redmi 13C 8GB/256GB",
            "Nothing Phone (2a) Glyph Edition", "Poco X6 Pro 5G HyperOS",
            "Samsung Galaxy S23 FE 5G", "iPhone 13 Starlight 128GB",
            "Motorola Edge 50 Fusion"
        ],
        "price_pkr": (28500, 465000),
        "images": [
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80",
        ],
    },
    {
        "category": "Laptops & Computers",
        "items": [
            "MacBook Air M2 13.6-Inch 8GB/256GB", "HP EliteBook 840 G10 Core i7",
            "Dell XPS 13 Plus OLED Touch", "Lenovo ThinkPad X1 Carbon Gen 11",
            "ASUS ROG Strix G16 RTX 4060", "Acer Nitro V15 Gaming Core i5",
            "MacBook Pro 14 M3 Pro Space Black", "Lenovo IdeaPad Slim 5 Ryzen 7",
            "HP Victus 15 Gaming RTX 3050", "Dell Inspiron 15 3530 Core i7",
            "MSI Katana 15 RTX 4070 Laptop", "ASUS Zenbook 14 OLED Ultra",
            "27-Inch 2K IPS Frameless Monitor", "NVMe M.2 1TB Gen4 Internal SSD",
            "24-Inch 165Hz Curved Gaming Monitor", "Wireless Ergonomic Vertical Mouse",
            "16GB DDR5 5600MHz Laptop RAM", "Wi-Fi 6 AX3000 Dual-Band Router",
            "2TB Portable External Hard Drive", "1080p Autofocus Ring-Light Webcam",
            "Aluminum Adjustable Laptop Stand", "All-in-One Wireless Ink Tank Printer",
            "UPS 1000VA Pure Sine Wave Backup", "USB-C Thunderbolt 4 NVMe Enclosure",
            "32-Inch 4K Graphic Design Monitor"
        ],
        "price_pkr": (6500, 420000),
        "images": [
            "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80",
        ],
    },
    {
        "category": "Fashion & Clothing",
        "items": [
            "Unisex Oversized Heavyweight Hoodie", "Classic Vintage Washed Denim Jacket",
            "Organic Cotton Crewneck T-Shirt Pack", "Water-Resistant Windbreaker Jacket",
            "Relaxed Fit Fleece Tracksuit Set", "Merino Blend Winter Cardigan",
            "Linen Resort Button-Up Shirt", "Stretch Slim Cargo Joggers",
            "Quilted Puffer Winter Vest", "Breathable Bamboo Lounge Pajama Set",
            "Classic Trench Raincoat", "Knitted Striped Pullover Sweater",
            "Athletic Dry-Fit Training Tee", "Corduroy Overshirt Jacket",
            "Tailored Wide-Leg Trousers", "Thermal Winter Base Layer Set",
            "Embroidered Varsity Bomber Jacket", "Pure Cotton Oxford Dress Shirt",
            "Lightweight Summer Linen Shorts", "Cashmere Touch Winter Scarf",
            "Unisex Canvas Utility Apron", "Woven Stretch Braided Belt",
            "No-Show Combed Cotton Socks 6-Pack", "Classic Panama Straw Sun Hat",
            "Polarized UV400 Wayfarer Sunglasses"
        ],
        "price_pkr": (1450, 14500),
        "images": [
            "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80",
        ],
    },
    {
        "category": "Men's Fashion",
        "items": [
            "Men's Wash & Wear Shalwar Kameez Suit", "Slim-Fit Navy 2-Piece Formal Suit",
            "Embroidered Cotton Eid Kurta", "Charcoal Tailored Executive Blazer",
            "Pique Cotton Tipped Polo Shirt", "Selvedge Dark Indigo Slim Jeans",
            "Boski Silk Festive Shalwar Suit", "Stretch Cotton Chino Trousers",
            "Banarasi Jamawar Wedding Waistcoat", "Oxford Button-Down Formal Shirt",
            "Raw Silk Prince Coat Jacket", "Khaddar Winter Shalwar Kameez",
            "Flannel Checkered Casual Overshirt", "Tailored Pleated Dress Pants",
            "Mandarin Collar Linen Kurta", "Genuine Leather Reversible Belt",
            "Silk Jacquard Tie & Cufflinks Set", "Chikankari Self-Embroidered Kurta",
            "Slim Fit Black Tuxedo Suit", "Karandi Winter Men's Unstitched Suit",
            "Quarter-Zip Merino Wool Sweater", "Pathani Collar Cotton Suit",
            "Tapered Utility Cargo Pants", "Double-Breasted Wool Overcoat",
            "Handloom Khadi Casual Kurta"
        ],
        "price_pkr": (2200, 38000),
        "images": [
            "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80",
        ],
    },
    {
        "category": "Women's Fashion",
        "items": [
            "Embroidered Lawn 3-Piece Unstitched Suit", "Chiffon Festive Formal Dupatta Set",
            "Silk Digital Printed Kurti Tunic", "Velvet Zari Embroidered Winter Shawl Suit",
            "Organza Party Wear Anarkali Frock", "Cotton Chikankari A-Line Shirt",
            "Pleated Floral Midi Summer Dress", "Nida Silk Open Front Dubai Abaya",
            "Pashmina Kani Woven Winter Shawl", "Tailored Women's Blazer & Trouser Co-ord",
            "Cambric Printed Daily Wear 2-Piece", "Jacquard Festive Stitched Kurti",
            "Silk Satin Evening Blouse", "High-Waist Wide Leg Palazzo Trousers",
            "Linen Embroidered Winter 3-Piece", "Bridal Net Embellished Lehenga Choli",
            "Chiffon Pearl Hijab & Scarf Set", "Block Print Cotton Angrakha",
            "Knit Ribbed Turtleneck Sweater", "Denim Cropped Jacket & Skirt Set",
            "Georgette Sequin Party Saree", "Velvet Bridal Clutch & Shawl Combo",
            "Khaddar Digital Printed Winter Suit", "Lace Cuff Modest Maxi Dress",
            "Cotton Net Festive Dupatta"
        ],
        "price_pkr": (2400, 45000),
        "images": [
            "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=600&q=80",
        ],
    },
    {
        "category": "Shoes & Sneakers",
        "items": [
            "Men's Air Cushion Running Sneakers", "Women's Pointed-Toe Stiletto Heels",
            "Handcrafted Charsadda Peshawari Chappal", "Minimalist White Leather Court Sneakers",
            "Women's Embroidered Bridal Khussa", "Men's Full-Grain Leather Oxford Shoes",
            "Suede Penny Driving Loafers", "Women's Block Heel Ankle Boots",
            "Lightweight Mesh Marathon Trainers", "Men's Chelsea Suede Boots",
            "Women's Strappy Metallic Party Sandals", "Orthopedic Memory Foam Walking Shoes",
            "High-Top Retro Basketball Sneakers", "Men's Monk Strap Formal Dress Shoes",
            "Women's Platform Chunky Sneakers", "Waterproof Trail Hiking Boots",
            "Women's Crystal Slingback Heels", "Men's Breathable Canvas Slip-Ons",
            "Leather Fisherman Summer Sandals", "Women's Suede Comfort Mules",
            "Men's Velvet Embroidered Wedding Loafer", "Kids Light-Up Velcro Sneakers",
            "Non-Slip Gym Cross-Training Shoes", "Women's Cushioned Ballet Flats",
            "Men's Classic Leather Slide Sandals"
        ],
        "price_pkr": (2200, 24000),
        "images": [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80",
        ],
    },
    {
        "category": "Watches",
        "items": [
            "Stainless Steel Chronograph Men's Watch", "Women's Rose Gold Milanese Mesh Watch",
            "AMOLED GPS Fitness Smartwatch Pro", "Automatic Skeleton Mechanical Diver Watch",
            "Classic Roman Dial Brown Leather Watch", "Women's Mother-of-Pearl Crystal Watch",
            "Digital Rugged Shockproof Sports Watch", "Minimalist Ultra-Thin Sapphire Watch",
            "Gold-Tone Presidential Link Watch", "Smart Calling Watch with Heart Monitor",
            "Women's Petite Square Vintage Watch", "Aviator Tachymeter Pilot Watch",
            "Two-Tone Jubilee Bracelet Watch", "Kids GPS Safe-Tracker Smartwatch",
            "Ceramic White Luxury Women's Watch", "Titanium Solar-Powered Field Watch",
            "Couple His & Hers Matching Watch Set", "Open-Heart Tourbillon Style Watch",
            "Silicone Strap Hybrid Fitness Watch", "Rose Gold Bangle Cuff Watch",
            "Moonphase Calendar Dress Watch", "6-Slot Leather Watch Organizer Box",
            "Waterproof 100M Swimmer Digital Watch", "Carbon Fiber Racing Chronograph",
            "Antique Pocket Watch with Chain"
        ],
        "price_pkr": (2800, 68000),
        "images": [
            "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=600&q=80",
        ],
    },
    {
        "category": "Beauty & Personal Care",
        "items": [
            "Hyaluronic Acid 2% Hydrating Face Serum", "Velvet Matte Liquid Lipstick Gift Set",
            "Royal Oud Wood Eau De Parfum 100ml", "Vitamin C 15% Brightening Glow Cream",
            "24H Full Coverage Silk Foundation", "Ionic Ceramic Hair Straightener Pro",
            "SPF 50+ PA++++ Matte Gel Sunscreen", "Rose Gold 18-Shade Eyeshadow Palette",
            "Organic Sandalwood Beard Growth Oil", "Niacinamide 10% + Zinc Pore Serum",
            "Rechargeable Cordless Hair & Beard Trimmer", "Keratin & Argan Repair Hair Mask",
            "Waterproof Lash Volume Mascara", "Activated Charcoal Deep Pore Face Wash",
            "Floral Musk Luxury Body Mist 250ml", "Professional 12-Piece Makeup Brush Set",
            "Salicylic Acid Anti-Acne Cleanser", "2200W Salon Ionic Hair Dryer",
            "Shea Butter Intensive Hand & Foot Cream", "Micellar Waterproof Makeup Remover",
            "Aloe Vera & Tea Tree Soothing Gel", "Sonic Silicone Facial Cleansing Brush",
            "Men's Fresh Aquatic Intense Cologne", "Under-Eye Caffeine Peptide Roll-On",
            "Rosewater Hydrating Facial Toner"
        ],
        "price_pkr": (850, 18500),
        "images": [
            "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80",
        ],
    },
    {
        "category": "Home & Kitchen",
        "items": [
            "Digital Touch Air Fryer 6.5L XL", "Non-Stick Granite 12-Piece Cookware Set",
            "15-Bar Espresso & Cappuccino Coffee Maker", "Stainless Steel Electric Kettle 1.8L",
            "3-in-1 Heavy Duty Blender & Grinder", "Egyptian Cotton 400TC King Bedsheet Set",
            "Vacuum Insulated Stainless Thermal Flask", "24-Piece Porcelain Gold-Rim Dinner Set",
            "2-Slice Stainless Pop-Up Bread Toaster", "3-Tier Bamboo Spice & Pantry Rack",
            "Microfiber Fluffy All-Season Comforter", "Chef's German Steel 6-Piece Knife Block",
            "Airtight Glass Food Storage Containers 10pc", "Automatic Sensor Liquid Soap Dispenser",
            "Blackout Thermal Insulated Window Curtains", "Electric Roti & Chapati Maker Non-Stick",
            "Cast Iron Pre-Seasoned Skillet Pan 12in", "Turkish Cotton Bath Towel 4-Piece Set",
            "Rechargeable Touch Bedside Table Lamp", "Wall-Mounted Magnetic Knife & Utensil Bar",
            "Handheld Milk Frother Foam Maker", "360-Degree Spin Mop & Bucket System",
            "Aromatherapy Ultrasonic Essential Oil Diffuser", "Stainless Steel Pressure Cooker 7L",
            "Silicone Baking Mat & Pastry Tool Kit"
        ],
        "price_pkr": (1200, 48000),
        "images": [
            "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1584990347449-fd98bc063110?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80",
        ],
    },
    {
        "category": "Furniture",
        "items": [
            "Ergonomic Mesh Executive Office Chair", "Modern 3-Seater Velvet Chesterfield Sofa",
            "Solid Sheesham Wood King Bed Frame", "Motorized Height-Adjustable Standing Desk",
            "6-Seater Marble Top Dining Table Set", "Scandinavian Wooden TV Media Console",
            "5-Tier Industrial Metal & Wood Bookshelf", "Tufted Storage Ottoman Bench",
            "L-Shaped Corner Computer Study Desk", "Orthopedic Pocket Spring King Mattress",
            "Rattan Boho Accent Lounge Armchair", "3-Door Sliding Wardrobe with Mirror",
            "Nesting Round Gold & Marble Coffee Tables", "Shoe Cabinet Rack with Cushioned Seat",
            "Recliner Leatherette Home Cinema Chair", "Minimalist Wooden Bedside Nightstand",
            "Foldable Wall-Mounted Study Table", "4-Tier Wooden Corner Plant Stand",
            "Velvet Vanity Dressing Table with LED Mirror", "Outdoor Patio Wicker 4-Piece Sofa Set",
            "Kids Study Table & Adjustable Chair Set", "Floating Wall Shelves Set of 3",
            "Bar Stools Adjustable Swivel Set of 2", "Entryway Coat & Bag Hall Tree Stand",
            "Bean Bag Lounger Chair XXL"
        ],
        "price_pkr": (4500, 165000),
        "images": [
            "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80",
        ],
    },
    {
        "category": "Grocery & Food",
        "items": [
            "Super Kernel Aged Basmati Rice 5kg", "Extra Virgin Cold-Pressed Olive Oil 1L",
            "Pure Sidr Raw Organic Honey 1kg", "Premium Irani Dates Ajwa & Mazafati Box",
            "Roasted California Almonds & Cashews 500g", "Himalayan Pink Salt Grinder Jar",
            "Single-Origin Arabica Roasted Coffee Beans", "Organic Cold-Pressed Mustard Oil 3L",
            "Assorted Baklava & Turkish Delight Gift Box", "Pure Desi Cow Ghee 1kg Tin",
            "Kashmiri Pink Chai & Green Tea Leaves", "Dark 70% Belgian Chocolate Bar Pack",
            "Quinoa & Chia Superfood Seeds Combo", "Whole Wheat Organic Chakki Atta 10kg",
            "Peshawari Kahwa Cardamom Tea Tin", "Natural Peanut Butter Crunchy 500g",
            "Multani Sohan Halwa Traditional Gift Tin", "Sun-Dried Apricots & Figs Dry Fruit Pack",
            "Organic Apple Cider Vinegar with Mother", "Spiced BBQ & Biryani Masala Chef Box",
            "Imported Italian Durum Wheat Pasta Pack", "Stevia Zero-Calorie Natural Sweetener",
            "Roasted Pistachios Salted Premium 500g", "Pure Saffron Kashmiri Zafran 2g",
            "Oats & Honey Crunchy Granola Cereal"
        ],
        "price_pkr": (450, 8500),
        "images": [
            "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=600&q=80",
        ],
    },
    {
        "category": "Sports & Fitness",
        "items": [
            "Adjustable Cast Iron Dumbbell Set 20kg", "6mm Non-Slip TPE Yoga & Exercise Mat",
            "English Willow Grade-1 Cricket Bat", "FIFA Quality Thermal Bonded Football",
            "Motorized Folding Home Treadmill", "5-Level Heavy Duty Resistance Bands Set",
            "Carbon Fiber Badminton Racket Pair", "Doorway Pull-Up & Chin-Up Gym Bar",
            "Digital Counter Weighted Jump Rope", "100% Whey Protein Isolate Chocolate 2lbs",
            "26-Inch 21-Speed Alloy Mountain Bike", "Padded Leather Weightlifting Gym Belt",
            "Table Tennis Bat & 3-Star Ball Set", "Foam Roller Deep Tissue Muscle Massager",
            "1-Gallon Motivational Gym Water Bottle", "Boxing Gloves & Hand Wraps Training Set",
            "Ab Roller Wheel with Knee Pad", "Kettlebell Vinyl Coated 12kg",
            "Swimming Anti-Fog UV Goggles & Cap", "Grip Strength Forearm Exerciser",
            "Portable Pop-Up Football Goal Net", "Cycling Breathable Padded Half Gloves",
            "Agility Speed Training Ladder & Cones", "Ankle & Wrist Adjustable Weights 2kg",
            "Gym Duffel Bag with Shoe Compartment"
        ],
        "price_pkr": (950, 95000),
        "images": [
            "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&q=80",
        ],
    },
    {
        "category": "Toys & Games",
        "items": [
            "1000-Piece Architecture City Building Blocks", "4WD High-Speed Off-Road RC Monster Truck",
            "Magnetic Educational STEM Tiles 100pc", "Wooden Classic Chess & Checkers Board",
            "1:24 Die-Cast Metal Sports Car Model", "Foldable Drone with 1080p HD Camera",
            "Interactive Talking Learning Tablet for Kids", "Plush Giant Teddy Bear Soft Toy 3ft",
            "Family Strategy Monopoly Board Game", "120-Piece Washable Art & Crayons Case",
            "Kids 3-Wheel LED Light-Up Kick Scooter", "Remote Control Rechargeable Robotic Dog",
            "Jenga Wooden Tumbling Tower Game", "Junior Microscope Science Lab Kit",
            "Play-Doh 24-Color Modeling Compound Pack", "Kids Inflatable Backyard Splash Pool",
            "Uno & Classic Playing Card Game Bundle", "Solar-Powered 12-in-1 Robot Kit",
            "Dollhouse Wooden 3-Story Playset", "Foosball Tabletop Mini Soccer Game",
            "Rubik's Speed Cube 3x3 Magnetic", "Kids Indoor Basketball Hoop Stand",
            "Musical Electronic Keyboard Piano 61-Key", "Kinetic Sand Castle Play Set 2kg",
            "Puzzle World Map 500 Pieces"
        ],
        "price_pkr": (800, 22000),
        "images": [
            "https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80",
        ],
    },
    {
        "category": "Books & Stationery",
        "items": [
            "Atomic Habits Hardcover Bestseller", "Executive Leatherette Undated Daily Planner",
            "The Psychology of Money Paperback", "Fountain Pen Luxury Metal Gift Set",
            "A4 80gsm Premium Printing Paper 500 Sheets", "48-Color Dual-Tip Alcohol Art Markers",
            "Rich Dad Poor Dad Financial Classic", "Spiral Dotted Bullet Journal Notebook A5",
            "Scientific Engineering Calculator FX-991", "Deep Work Rules for Focused Success",
            "Acrylic Paint 24-Tube Artist Canvas Kit", "5-Compartment Metal Mesh Desk Organizer",
            "Sapiens A Brief History of Humankind", "Gel Ink Smooth Rollerball Pens 12-Pack",
            "Magnetic Whiteboard 2x3 Feet with Markers", "The Alchemist Collector's Edition",
            "Pastel Sticky Notes & Index Tabs Set", "Heavy Duty Stapler & Hole Punch Combo",
            "Geometry & Technical Drawing Compass Set", "Zero to One Startup Innovation Book",
            "Watercolor Cold-Press Sketchpad A4", "Laminating Machine A4 Thermal Pouch",
            "Calligraphy Brush Pen Set 20 Colors", "Desktop Tape Dispenser & Scissors Kit",
            "World Atlas & Illustrated Encyclopedia"
        ],
        "price_pkr": (350, 9500),
        "images": [
            "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=600&q=80",
        ],
    },
    {
        "category": "Bags & Accessories",
        "items": [
            "Anti-Theft USB Laptop Backpack 17-Inch", "Women's Quilted Chain Crossbody Bag",
            "24-Inch Polycarbonate Hardshell Spinner Suitcase", "Full-Grain Leather RFID Bifold Wallet",
            "Structured Executive Leather Tote Bag", "Waterproof Travel Dopp Kit Toiletry Bag",
            "Pearl Embellished Bridal Evening Clutch", "Carbon Fiber Slim Metal Cardholder",
            "3-Piece Cabin & Check-In Luggage Set", "Men's Leather Messenger Crossbody Bag",
            "Convertible Canvas Weekender Duffel Bag", "Women's Croc-Effect Top Handle Purse",
            "Polarized Aviator Metal Frame Sunglasses", "Passport & Travel Document RFID Holder",
            "Mini Saddle Designer Shoulder Bag", "Padded DSLR Camera & Lens Backpack",
            "Silk Printed Square Neck Scarf", "3-Pack Compression Packing Cubes",
            "Men's Reversible Formal Leather Belt", "Keychain Multi-Tool & Leather Key Organizer",
            "Insulated Thermal Lunch Tote Bag", "Jewelry Travel Organizer Zip Case",
            "Foldable Waterproof Backpack 25L", "Women's Zip-Around Continental Wallet",
            "TSA Approved Luggage Combination Lock"
        ],
        "price_pkr": (1100, 34000),
        "images": [
            "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80",
        ],
    },
    {
        "category": "Baby Products",
        "items": [
            "Lightweight Foldable Travel Baby Stroller", "Multi-Function Diaper Backpack with Changing Pad",
            "Anti-Colic PPSU Baby Feeding Bottles 3-Pack", "Electric Steam Bottle Sterilizer & Dryer",
            "5-Piece 100% Organic Cotton Newborn Romper Set", "Convertible ISOFIX Toddler Car Seat",
            "Portable Wooden & Mesh Baby Crib Cot", "Non-Toxic XPE Foldable Crawling Play Mat",
            "Digital Non-Contact Infrared Baby Thermometer", "Automatic Electric Breast Pump Quiet",
            "Soft Hooded Bamboo Baby Bath Towel", "Foldable Baby High Feeding Chair",
            "Musical Starry Night Crib Mobile Toy", "Silicone Baby Weaning Spoon & Bowl Set",
            "Ergonomic 360 Baby Hip-Seat Carrier", "Baby Nail Electric Trimmer Safe File",
            "Hypoallergenic Baby Wipes 6-Pack Bundle", "Plush Baby Rocker & Bouncer Chair",
            "Teething Silicone Fruit Feeder & Rings", "Mosquito Net Foldable Baby Bed Tent",
            "Baby Bath Tub with Temperature Sensor", "Toddler Training Sippy Cup Spill-Proof",
            "Soft Cotton Swaddle Blankets 4-Pack", "Baby Safety Corner Guards & Cabinet Locks",
            "Interactive Musical Baby Walker"
        ],
        "price_pkr": (900, 42000),
        "images": [
            "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=600&q=80",
        ],
    },
    {
        "category": "Automotive Accessories",
        "items": [
            "Dual-Lens 4K Front & Rear Car Dash Cam", "12V Digital Portable Car Tire Inflator",
            "7D Custom-Fit Waterproof Car Floor Mats", "Magnetic MagSafe Car Air Vent Phone Mount",
            "Heavy-Duty Car Jump Starter Power Bank", "Cordless High-Suction Handheld Car Vacuum",
            "Microfiber Car Wash & Wax Detailing Kit", "PU Leather Breathable Car Seat Covers",
            "Waterproof Oxford UV Car Body Cover", "LED H4/H7 Super Bright Car Headlight Bulbs",
            "2-in-1 Emergency Seatbelt Cutter & Hammer", "Foldable Trunk Cargo Organizer Box",
            "Solar Tire Pressure Monitoring System TPMS", "Ceramic Nano Liquid Car Scratch Polish",
            "Retractable Windshield UV Sunshade", "Memory Foam Car Neck & Lumbar Pillow",
            "Blind Spot Wide-Angle Convex Mirrors", "100W Dual USB-C Fast Car Charger",
            "Car Interior LED Ambient Footwell Lights", "Heavy-Duty Steel Steering Wheel Lock",
            "Rain-Repellent Silicone Wiper Blades Pair", "Car A/C Vent Solar Aromatherapy Diffuser",
            "OBD2 Bluetooth Car Fault Code Scanner", "Motorcycle Waterproof Mobile Holder",
            "Anti-Slip Dashboard Sticky Gel Pad"
        ],
        "price_pkr": (750, 26000),
        "images": [
            "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=600&q=80",
        ],
    },
    {
        "category": "Health & Lifestyle",
        "items": [
            "Deep Tissue Percussion Massage Gun", "Smart Bluetooth Body Composition Scale",
            "Digital Upper-Arm Blood Pressure Monitor", "Fingertip Pulse Oximeter LED Display",
            "Orthopedic Memory Foam Cervical Neck Pillow", "Adjustable Magnetic Posture Corrector",
            "Ultrasonic Cool Mist Room Humidifier", "Electric Heating Pad for Back & Shoulder",
            "Weekly 7-Day Am/Pm Pill Organizer Box", "Compression Knee Support Sleeve Pair",
            "Himalayan Rock Salt Natural Glow Lamp", "Blue-Light Blocking Computer Glasses",
            "Portable Mesh Nebulizer Quiet Inhaler", "Acupressure Reflexology Foot Massage Mat",
            "Weighted Calming Anxiety Blanket 7kg", "Copper Ayurvedic Wellness Water Bottle",
            "Silk Contoured 3D Blackout Sleep Mask", "Digital Infrared Forehead Thermometer",
            "Lumbar Support Mesh Back Cushion", "Essential Oils Relaxation 6-Bottle Set",
            "Reusable Gel Hot & Cold Therapy Pack", "Smart Posture & Hydration Reminder",
            "Ergonomic Gel Seat Cushion for Sciatica", "First Aid 120-Piece Emergency Travel Kit",
            "White Noise Sleep Sound Machine"
        ],
        "price_pkr": (900, 19500),
        "images": [
            "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
        ],
    },
    {
        "category": "Gaming Accessories",
        "items": [
            "RGB Hot-Swappable Mechanical Gaming Keyboard", "Ultra-Light 58g Wireless Esports Gaming Mouse",
            "7.1 Surround Sound RGB Gaming Headset", "Dual-Sense Wireless Pro Gamepad Controller",
            "XL Extended World-Map RGB Gaming Mouse Pad", "Ergonomic Racing Leatherette Gaming Chair",
            "USB Condenser Cardioid Streaming Microphone", "4K 60fps HDMI Game Capture Card",
            "PS5 Dual Controller Fast Charging Dock", "Adjustable RGB Headphone Stand with USB Hub",
            "Semiconductor Magnetic Phone Gaming Cooler", "1080p 60fps Ring-Light Streamer Webcam",
            "Nintendo Switch Protective Travel Case & Grips", "PCIe 4.0 Heatsink 2TB PS5/PC Gaming SSD",
            "60% Compact Mechanical Tactile Keyboard", "Force-Feedback Racing Steering Wheel & Pedals",
            "Blue-Light Anti-Glare Pro Gamer Glasses", "Custom PBT Keycaps 135-Key Set",
            "Laptop 5-Fan Turbo Cooling Pad Stand", "VR Headset Comfort Head Strap & Face Pad",
            "Stream Macro Programmable 15-Key Deck", "Braided Paracord Mouse Bungee Holder",
            "Xbox Series X/S Rechargeable Battery Pack", "Acoustic Foam Wall Panels 12-Pack Studio",
            "Multi-Platform Arcade Fight Stick Controller"
        ],
        "price_pkr": (1500, 65000),
        "images": [
            "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1600861194942-f883de0dfe96?auto=format&fit=crop&w=600&q=80",
        ],
    },
]


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_500_mall_products(db: Session):
    try:
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS marketlenz_catalog (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sku TEXT,
                name TEXT NOT NULL,
                category TEXT,
                description TEXT,
                price REAL DEFAULT 0,
                original_price REAL DEFAULT 0,
                discount_percent INTEGER DEFAULT 0,
                bulk_price REAL DEFAULT 0,
                stock INTEGER DEFAULT 25,
                rating REAL DEFAULT 4.5,
                review_count INTEGER DEFAULT 24,
                currency TEXT DEFAULT 'PKR',
                image_url TEXT
            )
        """))
        db.commit()

        # Safely add new mall columns if upgrading from an older table
        cols = [row[1] for row in db.execute(text("PRAGMA table_info(marketlenz_catalog)")).fetchall()]
        for col_name, col_def in [
            ("original_price", "REAL DEFAULT 0"),
            ("discount_percent", "INTEGER DEFAULT 0"),
            ("rating", "REAL DEFAULT 4.5"),
            ("review_count", "INTEGER DEFAULT 24"),
            ("currency", "TEXT DEFAULT 'PKR'"),
        ]:
            if col_name not in cols:
                db.execute(text(f"ALTER TABLE marketlenz_catalog ADD COLUMN {col_name} {col_def}"))
                db.commit()

        # Check if 500 multi-category PKR mall items already exist
        count = db.execute(text("SELECT COUNT(*) FROM marketlenz_catalog")).scalar() or 0
        has_mall = db.execute(
            text("SELECT COUNT(*) FROM marketlenz_catalog WHERE category = 'Mobile Phones'")
        ).scalar() or 0

        if count >= 500 and has_mall > 0:
            return

        # Upgrade catalog cleanly to 500 unique items across all 20 categories
        if count > 0:
            db.execute(text("DELETE FROM marketlenz_catalog"))
            db.commit()

        rng = random.Random(2026)
        sku_num = 1001
        inserted = 0

        # 20 categories x 25 unique items = 500 unique products (zero duplicates)
        for cat_group in MALL_CATEGORIES:
            cat_name = cat_group["category"]
            low_pkr, high_pkr = cat_group["price_pkr"]
            cat_images = cat_group["images"]

            for idx, item_title in enumerate(cat_group["items"]):
                if inserted >= 500:
                    break

                # Round PKR price cleanly to nearest 50
                raw_price = rng.randint(low_pkr // 50, high_pkr // 50) * 50
                discount_pct = rng.choice([0, 10, 12, 15, 18, 20, 25, 30])
                if discount_pct > 0:
                    orig_price = round((raw_price / (1 - discount_pct / 100.0)) / 50) * 50
                else:
                    orig_price = raw_price

                bulk_pkr = round((raw_price * 0.85) / 10) * 10
                stock_qty = rng.randint(10, 150)
                rating_val = round(rng.uniform(4.1, 5.0), 1)
                reviews_val = rng.randint(14, 680)
                img_url = cat_images[idx % len(cat_images)]

                desc = (
                    f"Authentic {item_title} from our {cat_name} department. "
                    f"Quality-verified with nationwide warranty and fast delivery across Pakistan."
                )

                db.execute(
                    text("""
                        INSERT INTO marketlenz_catalog (
                            sku, name, category, description, price, original_price,
                            discount_percent, bulk_price, stock, rating, review_count, currency, image_url
                        ) VALUES (
                            :sku, :name, :category, :description, :price, :original_price,
                            :discount_percent, :bulk_price, :stock, :rating, :review_count, 'PKR', :image_url
                        )
                    """),
                    {
                        "sku": f"ML-{sku_num}",
                        "name": item_title,
                        "category": cat_name,
                        "description": desc,
                        "price": float(raw_price),
                        "original_price": float(orig_price),
                        "discount_percent": discount_pct,
                        "bulk_price": float(bulk_pkr),
                        "stock": stock_qty,
                        "rating": rating_val,
                        "review_count": reviews_val,
                        "image_url": img_url,
                    },
                )
                sku_num += 1
                inserted += 1

        db.commit()
    except Exception:
        db.rollback()


# Keep alias for backwards compatibility with inventory.py / seed.py
ensure_200_products = ensure_500_mall_products


def serialize_product(row) -> dict:
    d = dict(row._mapping)
    price = float(d.get("price") or 0.0)
    orig = float(d.get("original_price") or price)
    disc = int(d.get("discount_percent") or 0)
    if disc == 0 and orig > price > 0:
        disc = round(((orig - price) / orig) * 100)
    bulk = float(d.get("bulk_price") or round(price * 0.85, 2))
    stock_val = int(d.get("stock") or 0)

    return {
        "id": d.get("id"),
        "sku": d.get("sku") or f"ML-{1000 + int(d.get('id') or 0)}",
        "name": d.get("name") or "Unnamed Product",
        "category": d.get("category") or "General",
        "description": d.get("description") or "",
        "price": price,
        "retail_price": price,
        "original_price": orig,
        "discount_percent": disc,
        "bulk_price": bulk,
        "stock": stock_val,
        "quantity": stock_val,
        "rating": float(d.get("rating") or 4.5),
        "review_count": int(d.get("review_count") or 0),
        "currency": d.get("currency") or "PKR",
        "image_url": d.get("image_url") or "",
    }


class ProductCreate(BaseModel):
    name: str
    category: str = "Electronics"
    description: str = ""
    price: float
    original_price: Optional[float] = None
    discount_percent: Optional[int] = 0
    bulk_price: Optional[float] = None
    stock: int = 25
    image_url: Optional[str] = ""


@router.get("")
@router.get("/")
def list_products(
    q: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    limit: int = Query(500, ge=1, le=2000),
    db: Session = Depends(get_db),
):
    ensure_500_mall_products(db)
    query = "SELECT * FROM marketlenz_catalog WHERE 1=1"
    params = {}

    if q and q.strip():
        query += " AND (name LIKE :q OR category LIKE :q OR description LIKE :q OR sku LIKE :q)"
        params["q"] = f"%{q.strip()}%"
    if category and category.strip() and category.strip().lower() != "all":
        query += " AND category = :category"
        params["category"] = category.strip()

    query += " ORDER BY id ASC LIMIT :limit"
    params["limit"] = limit

    rows = db.execute(text(query), params).fetchall()
    items = [serialize_product(r) for r in rows]
    return {"items": items, "products": items, "total": len(items)}


@router.post("", status_code=201)
@router.post("/", status_code=201)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    ensure_500_mall_products(db)
    orig = payload.original_price if payload.original_price else payload.price
    disc = payload.discount_percent or (round(((orig - payload.price) / orig) * 100) if orig > payload.price else 0)
    bulk = payload.bulk_price if payload.bulk_price is not None else round(payload.price * 0.85, 2)

    res = db.execute(
        text("""
            INSERT INTO marketlenz_catalog (
                sku, name, category, description, price, original_price,
                discount_percent, bulk_price, stock, rating, review_count, currency, image_url
            ) VALUES (
                :sku, :name, :category, :description, :price, :original_price,
                :discount_percent, :bulk_price, :stock, 4.8, 1, 'PKR', :image_url
            )
        """),
        {
            "sku": f"ML-{random.randint(2000, 9999)}",
            "name": payload.name.strip(),
            "category": payload.category.strip(),
            "description": payload.description.strip() or f"Verified {payload.category} item.",
            "price": payload.price,
            "original_price": orig,
            "discount_percent": disc,
            "bulk_price": bulk,
            "stock": payload.stock,
            "image_url": payload.image_url or "",
        },
    )
    db.commit()
    row = db.execute(text("SELECT * FROM marketlenz_catalog WHERE id = :id"), {"id": res.lastrowid}).fetchone()
    return serialize_product(row)


@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db.execute(text("DELETE FROM marketlenz_catalog WHERE id = :id"), {"id": product_id})
    db.commit()
    return {"status": "deleted", "id": product_id}