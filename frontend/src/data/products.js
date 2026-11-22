
import {
  Sparkles,
  Laptop,
  Smartphone,
  Armchair,
  Pencil,
  BookOpen,
  Headphones,
} from "lucide-react";

export const categories = [
  {
    name: "All",
    icon: Sparkles,
    count: "Everything worth keeping",
    image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=900&q=85",
  },
  {
    name: "Electronics",
    icon: Laptop,
    count: "Devices & gadgets",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900&q=85",
  },
  {
    name: "Mobiles",
    icon: Smartphone,
    count: "Phones & accessories",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900&q=85",
  },
  {
    name: "Furniture",
    icon: Armchair,
    count: "Furniture & decor",
    image: "https://images.unsplash.com/photo-1503602642458-232111445657?w=900&q=85",
  },
  {
    name: "Stationery",
    icon: Pencil,
    count: "Creative essentials",
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=900&q=85",
  },
  {
    name: "Books",
    icon: BookOpen,
    count: "Stories & knowledge",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=900&q=85",
  },
  {
    name: "Audio",
    icon: Headphones,
    count: "Sound & music",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=85",
  },
];

// Shared RELOOP policy for demo listings.
// Confirm the policy before using it for real customer orders.
const reloopGuarantee =
  "1-year RELOOP guarantee with a 7-day return policy. Eligible issues during the guarantee period will be handled according to RELOOP's return, repair or replacement policy.";

export const products = [
  {
    id: 1,
    name: "MacBook Air M1",
    category: "Electronics",
    price: 34999,
    original: 52900,
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900&q=85",
    note: "Lightweight. Ready for more.",

    gallery: [
      "/products/macbook/mac1.avif",
      "/products/macbook/mac2.jpg",
      "/products/macbook/mac3.jpeg",
    ],

    usageDuration: "2 years",
    purchaseYear: "2024",
    sellingReason:
      "The previous owner switched to another device that better suits their current work requirements.",

    reloopGuarantee,

    description:
      "The MacBook Air M1 combines portability with impressive everyday performance. Powered by Apple's M1 processor, it is suitable for browsing, studying, office work, multitasking and creative applications. Its Retina display delivers sharp visuals, while the backlit keyboard and Touch ID provide a comfortable and convenient experience. Its slim design makes it easy to carry between home, college and work.",

    specifications: [
      { label: "Brand", value: "Apple" },
      { label: "Model", value: "MacBook Air M1" },
      { label: "Processor", value: "Apple M1" },
      { label: "RAM", value: "8 GB" },
      { label: "Storage", value: "256 GB" },
      { label: "Colour", value: "Gray" },
    ],

    inspection: [
      "Display inspection",
      "Keyboard and trackpad inspection",
      "Battery health check",
      "Charging and port inspection",
    ],
  },

  {
    id: 2,
    name: "Minimal Study Chair",
    category: "Furniture",
    price: 4299,
    original: 6999,
    condition: "Very Good",
    image: "https://images.unsplash.com/photo-1503602642458-232111445657?w=900&q=85",
    note: "A comfortable second chapter.",

     gallery: [
      "/products/macbook/stool1.jpeg",
      "/products/macbook/stool2.jpg",
    ],

    usageDuration: "Approximately 1 year",
    purchaseYear: "2025",
    sellingReason:
      "The previous owner is rearranging their workspace and no longer needs this chair.",

    reloopGuarantee,

    description:
      "Create a comfortable workspace with this minimal study chair. Its simple design makes it suitable for study rooms, home offices and everyday workspaces. The clean appearance blends easily with different interior styles. It is a practical choice for anyone looking to refresh their workspace without paying the price of a brand-new chair.",

    specifications: [
      { label: "Product type", value: "Study chair" },
      { label: "Material", value: "Refer to product inspection" },
      { label: "Design", value: "Minimal contemporary" },
      { label: "Usage", value: "Study and home office" },
      { label: "Colour", value: "As shown in product image" },
    ],

    inspection: [
      "Frame stability inspection",
      "Seat and backrest inspection",
      "Leg and joint inspection",
      "Surface and visible wear inspection",
    ],
  },

  {
    id: 3,
    name: "Classic Digital Camera",
    category: "Electronics",
    price: 12999,
    original: 18999,
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=900&q=85",
    note: "Made for new memories.",

     gallery: [
      "/products/macbook/cam1.jpeg",
      "/products/macbook/cam2.png",
      "/products/macbook/cam3.png",
    ],

    usageDuration: "Approximately 1 year",
    purchaseYear: "2025",
    sellingReason:
      "The previous owner has upgraded to a newer camera and no longer uses this device regularly.",

    reloopGuarantee,

    description:
      "Rediscover photography with this classic digital camera. Designed for capturing everyday moments, travel memories and special occasions, it offers a dedicated camera experience in a compact form. Its physical controls make adjusting settings convenient, while its portable design makes it easy to carry on outings and trips.",

    specifications: [
      { label: "Product type", value: "Digital camera" },
      { label: "Camera style", value: "Compact digital" },
      { label: "Lens", value: "Refer to exact model" },
      { label: "Display", value: "Built-in camera display" },
      { label: "Connectivity", value: "Refer to exact model" },
    ],

    inspection: [
      "Lens and glass inspection",
      "Display inspection",
      "Buttons and control inspection",
      "Battery and charging inspection",
      "Photo capture test",
    ],
  },

  {
    id: 4,
    name: "Everyday Notebook Set",
    category: "Stationery",
    price: 399,
    original: 699,
    condition: "Like New",
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=900&q=85",
    note: "Fresh pages, less waste.",

     gallery: [
      "/products/macbook/note1.jpeg",
      "/products/macbook/note2.jpg",
    ],

    usageDuration: "Less than 3 months",
    purchaseYear: "2026",
    sellingReason:
      "The previous owner purchased extra notebooks and decided to sell the unused set.",

    reloopGuarantee,

    description:
      "Keep your thoughts, plans and ideas organised with this everyday notebook set. Suitable for notes, journaling, study work, planning and creative writing, these notebooks are useful for students and professionals alike. Their simple design makes them easy to carry and use at home, college or the office.",

    specifications: [
      { label: "Product type", value: "Notebook set" },
      { label: "Category", value: "Stationery" },
      { label: "Usage", value: "Writing and note-taking" },
      { label: "Paper details", value: "Refer to product inspection" },
      { label: "Quantity", value: "As shown in product images" },
    ],

    inspection: [
      "Page condition inspection",
      "Cover and binding inspection",
      "Writing surface inspection",
      "Quantity verification",
    ],
  },

  {
    id: 5,
    name: "Wireless Headphones",
    category: "Audio",
    price: 2499,
    original: 3999,
    condition: "Very Good",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=85",
    note: "Your soundtrack, renewed.",

     gallery: [
      "/products/macbook/head1.jpg",
      "/products/macbook/head2.jpg",
      "/products/macbook/head3.avif",
    ],

    usageDuration: "Approximately 1 year",
    purchaseYear: "2025",
    sellingReason:
      "The previous owner received another pair of headphones and no longer needs this one.",

    reloopGuarantee,

    description:
      "Enjoy music, videos and calls with these wireless headphones. Their over-ear style provides a comfortable listening experience for everyday use, whether you are studying, travelling or relaxing. The wireless design helps keep your setup free from cable clutter and makes them convenient to carry.",

    specifications: [
      { label: "Product type", value: "Wireless headphones" },
      { label: "Design", value: "Over-ear style" },
      { label: "Connectivity", value: "Wireless; exact version to be verified" },
      { label: "Controls", value: "Refer to product inspection" },
      { label: "Colour", value: "As shown in product image" },
    ],

    inspection: [
      "Left and right audio test",
      "Bluetooth connectivity test",
      "Button and control inspection",
      "Charging and battery check",
      "Ear cushion inspection",
    ],
  },

  {
    id: 6,
    name: "Oppo A7 5G",
    category: "Mobiles",
    price: 8999,
    original: 13999,
    condition: "Good",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900&q=85",
    note: "A smart way to upgrade.",

     gallery: [
      "/products/macbook/mobile1.jpg",
      "/products/macbook/mobile2.jpg",
    ],

    usageDuration: "Approximately 2 years",
    purchaseYear: "2024",
    sellingReason:
      "The previous owner upgraded to a newer smartphone and is selling the older device.",

    reloopGuarantee,

    description:
      "A practical smartphone for everyday communication, browsing, entertainment and essential applications. Its touchscreen design makes it convenient to stay connected, access information and manage daily tasks. This pre-owned device offers an affordable alternative for customers looking for a functional everyday smartphone.",

    specifications: [
      { label: "Product type", value: "Smartphone" },
      { label: "Display", value: "Touchscreen; exact size to be verified" },
      { label: "Processor", value: "Snapdragon 888" },
      { label: "RAM", value: "8 GB" },
      { label: "Storage", value: "128 GB" },
    ],

    inspection: [
      "Touchscreen and display test",
      "Camera functionality test",
      "Speaker and microphone test",
      "Charging port inspection",
      "Battery and network checks",
    ],
  },

  {
    id: 7,
    name: "Modern Reading Chair",
    category: "Furniture",
    price: 5799,
    original: 8999,
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1598300056393-4aac492f4344?w=900&q=85",
    note: "A new favourite corner.",

     gallery: [
      "/products/macbook/chair1.avif",
      "/products/macbook/chair2.jpeg",
      "/products/macbook/chair3.jpeg",
    ],

    usageDuration: "Approximately 1 year",
    purchaseYear: "2025",
    sellingReason:
      "The previous owner is changing the room layout and replacing some furniture.",

    reloopGuarantee,

    description:
      "Make a cosy reading corner with this modern reading chair. Its inviting design is suitable for reading, relaxing or adding a comfortable seating option to your living space. It can complement bedrooms, living rooms and personal study corners while giving pre-owned furniture a new home.",

    specifications: [
      { label: "Product type", value: "Reading chair" },
      { label: "Design", value: "Modern contemporary" },
      { label: "Material", value: "Refer to product inspection" },
      { label: "Usage", value: "Indoor seating" },
      { label: "Colour", value: "As shown in product image" },
    ],

    inspection: [
      "Frame and structural inspection",
      "Seat comfort and support check",
      "Fabric or surface inspection",
      "Leg and joint stability check",
    ],
  },

  {
    id: 8,
    name: "The Design of Everyday Things",
    category: "Books",
    price: 299,
    original: 599,
    condition: "Very Good",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=900&q=85",
    note: "Good ideas deserve rereading.",

     gallery: [
      "/products/macbook/book1.webp",
      "/products/macbook/book2.jpg",
    ],

    usageDuration: "Approximately 1 year",
    purchaseYear: "2025",
    sellingReason:
      "The previous owner has finished reading the book and wants another reader to enjoy it.",

    reloopGuarantee,

    description:
      "The Design of Everyday Things by Don Norman explores how thoughtful design influences the way people interact with everyday objects. It introduces ideas about usability, user experience, feedback and intuitive design. A valuable read for students, designers and anyone interested in understanding why some products are easier to use than others.",

    specifications: [
      { label: "Title", value: "The Design of Everyday Things" },
      { label: "Author", value: "Don Norman" },
      { label: "Category", value: "Design and usability" },
      { label: "Format", value: "Refer to physical copy" },
      { label: "Language", value: "Refer to physical copy" },
    ],

    inspection: [
      "Cover and spine inspection",
      "Page completeness check",
      "Page condition inspection",
      "Binding strength check",
    ],
  },

  {
    id: 9,
    name: "Premium Bluetooth Speaker",
    category: "Audio",
    price: 1799,
    original: 2999,
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=900&q=85",
    note: "Bring every moment to life.",

    usageDuration: "Approximately 8 months",
    purchaseYear: "2025",
    sellingReason:
      "The previous owner is reducing unused gadgets and no longer needs this additional speaker.",

    reloopGuarantee,

    description:
      "Enjoy your favourite music and audio content with this premium Bluetooth speaker. Its compact speaker design makes it suitable for personal listening, small gatherings and everyday entertainment. Wireless connectivity offers flexibility, while its portable form makes it convenient to move between rooms.",

    specifications: [
      { label: "Product type", value: "Bluetooth speaker" },
      { label: "Connectivity", value: "Bluetooth; exact version to be verified" },
      { label: "Audio", value: "Wireless audio playback" },
      { label: "Controls", value: "Refer to product inspection" },
      { label: "Power", value: "Refer to exact model" },
    ],

    inspection: [
      "Audio output test",
      "Bluetooth pairing test",
      "Button and control inspection",
      "Charging port inspection",
      "Battery performance check",
    ],
  },

  {
    id: 10,
    name: "Classic Mechanical Keyboard",
    category: "Electronics",
    price: 2499,
    original: 3999,
    condition: "Very Good",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=900&q=85",
    note: "A better feel for every keystroke.",

    usageDuration: "Approximately 1 year",
    purchaseYear: "2025",
    sellingReason:
      "The previous owner changed their desk setup and moved to a different keyboard.",

    reloopGuarantee,

    description:
      "Improve your typing setup with this classic mechanical keyboard. Designed for everyday typing, coding, writing and gaming, it offers a dedicated keyboard experience with individual key switches. Its practical layout makes it suitable for home offices, workstations and study desks.",

    specifications: [
      { label: "Product type", value: "Mechanical keyboard" },
      { label: "Layout", value: "Refer to exact model" },
      { label: "Switch type", value: "Refer to exact model" },
      { label: "Connectivity", value: "Refer to exact model" },
      { label: "Compatibility", value: "Refer to exact model" },
    ],

    inspection: [
      "Individual key functionality test",
      "Connection and typing test",
      "Keycap condition inspection",
      "Cable and port inspection",
    ],
  },

  {
    id: 11,
    name: "Minimal Wooden Side Table",
    category: "Furniture",
    price: 1899,
    original: 3299,
    condition: "Good",
    image: "https://images.unsplash.com/photo-1499933374294-4584851497cc?w=900&q=85",
    note: "Simple design, lasting charm.",

    usageDuration: "Approximately 2 years",
    purchaseYear: "2024",
    sellingReason:
      "The previous owner is rearranging their living space and no longer needs this side table.",

    reloopGuarantee,

    description:
      "Add a simple and practical touch to your home with this minimal wooden side table. It can be placed beside a sofa, reading chair or bed to keep everyday essentials within reach. Its understated design works well with modern, minimal and traditional interiors.",

    specifications: [
      { label: "Product type", value: "Side table" },
      { label: "Primary material", value: "Wood; exact type to be verified" },
      { label: "Design", value: "Minimal" },
      { label: "Usage", value: "Indoor furniture" },
      { label: "Colour", value: "As shown in product image" },
    ],

    inspection: [
      "Tabletop surface inspection",
      "Leg stability check",
      "Joint and frame inspection",
      "Visible scratch and wear assessment",
    ],
  },

  {
    id: 12,
    name: "Vintage Reading Collection",
    category: "Books",
    price: 499,
    original: 899,
    condition: "Very Good",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=900&q=85",
    note: "Stories worth passing on.",

    usageDuration: "Approximately 2 years",
    purchaseYear: "2024",
    sellingReason:
      "The previous owner is making space for new books and wants these titles to find another reader.",

    reloopGuarantee,

    description:
      "Discover the joy of reading with this vintage reading collection. A pre-owned book collection can offer a more affordable way to explore stories, ideas and different perspectives. These books are suitable for personal reading, building a home library or sharing with fellow book lovers.",

    specifications: [
      { label: "Product type", value: "Book collection" },
      { label: "Category", value: "Reading collection" },
      { label: "Titles", value: "Refer to collection images" },
      { label: "Format", value: "Refer to physical copies" },
      { label: "Quantity", value: "To be confirmed" },
    ],

    inspection: [
      "Book count verification",
      "Cover and spine inspection",
      "Page completeness check",
      "Page condition assessment",
    ],
  },

  {
    id: 13,
    name: "Wireless Charging Stand",
    category: "Mobiles",
    price: 899,
    original: 1499,
    condition: "Like New",
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=900&q=85",
    note: "A smarter everyday essential.",

    usageDuration: "Less than 6 months",
    purchaseYear: "2026",
    sellingReason:
      "The previous owner changed their charging setup and no longer needs this stand.",

    reloopGuarantee,

    description:
      "Keep your charging area organised with this wireless charging stand. Its stand-style design is intended to hold a compatible device while charging, making it convenient for a desk, bedside table or workspace. Before purchasing, check that your smartphone supports the charging standard and alignment required by this model.",

    specifications: [
      { label: "Product type", value: "Wireless charging stand" },
      { label: "Charging method", value: "Wireless; compatibility to be verified" },
      { label: "Device support", value: "Compatible devices only" },
      { label: "Power output", value: "Refer to exact model" },
      { label: "Connectivity", value: "Power connection required" },
    ],

    inspection: [
      "Charging functionality test",
      "Power cable inspection",
      "Device placement stability check",
      "Surface and connector inspection",
    ],
  },

  {
    id: 14,
    name: "Creative Desk Organizer",
    category: "Stationery",
    price: 349,
    original: 599,
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=900&q=85",
    note: "Make room for fresh ideas.",

    usageDuration: "Approximately 6 months",
    purchaseYear: "2025",
    sellingReason:
      "The previous owner reorganised their workspace and no longer needs this organizer.",

    reloopGuarantee,

    description:
      "Bring a little more order to your desk with this creative desk organizer. It is suitable for keeping stationery, small accessories and everyday work essentials arranged neatly. Its practical design helps make study spaces and home offices feel more organised.",

    specifications: [
      { label: "Product type", value: "Desk organizer" },
      { label: "Category", value: "Stationery accessory" },
      { label: "Material", value: "Refer to product inspection" },
      { label: "Usage", value: "Desk and workspace organisation" },
      { label: "Compartments", value: "Refer to product images" },
    ],

    inspection: [
      "Surface condition inspection",
      "Compartment condition check",
      "Structural stability inspection",
      "Visible damage assessment",
    ],
  },

  {
    id: 15,
    name: "Compact Digital Camera",
    category: "Electronics",
    price: 8999,
    original: 12999,
    condition: "Very Good",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=900&q=85",
    note: "Capture another chapter.",

    usageDuration: "Approximately 1 year",
    purchaseYear: "2025",
    sellingReason:
      "The previous owner moved to smartphone photography and uses this camera less frequently.",

    reloopGuarantee,

    description:
      "This compact digital camera is a convenient option for capturing everyday moments, trips and personal memories. Its dedicated camera controls offer an alternative to taking pictures on a smartphone. Its compact form makes it easy to carry, making it suitable for casual photography and travel.",

    specifications: [
      { label: "Product type", value: "Compact digital camera" },
      { label: "Camera format", value: "Digital compact" },
      { label: "Lens", value: "Refer to exact model" },
      { label: "Display", value: "Built-in camera display" },
      { label: "Storage support", value: "Refer to exact model" },
    ],

    inspection: [
      "Lens and screen inspection",
      "Photo capture test",
      "Zoom and button functionality test",
      "Battery and charging inspection",
      "Storage card slot check",
    ],
  },

  {
    id: 16,
    name: "Contemporary Lounge Chair",
    category: "Furniture",
    price: 6499,
    original: 9999,
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=900&q=85",
    note: "Comfort finds a new home.",

    usageDuration: "Approximately 1 year",
    purchaseYear: "2025",
    sellingReason:
      "The previous owner is updating their interior and replacing some of their existing furniture.",

    reloopGuarantee,

    description:
      "Bring comfort and contemporary style into your home with this lounge chair. Its relaxed seating design makes it suitable for living rooms, reading corners and personal spaces. It can work as a standalone accent piece or complement an existing seating arrangement.",

    specifications: [
      { label: "Product type", value: "Lounge chair" },
      { label: "Design", value: "Contemporary" },
      { label: "Material", value: "Refer to product inspection" },
      { label: "Usage", value: "Indoor seating" },
      { label: "Colour", value: "As shown in product image" },
    ],

    inspection: [
      "Frame and structural stability check",
      "Seat and backrest inspection",
      "Fabric or surface condition check",
      "Leg and joint inspection",
    ],
  },
];
