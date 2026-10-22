export interface MenuItemOption {
  id: string;
  name: string;
  priceDelta: number;
}

export interface MenuItemOptionGroup {
  id: string;
  name: string;
  required: boolean;
  options: MenuItemOption[];
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  basePrice: number;
  isVeg: boolean;
  isVegan?: boolean;
  isChefSpecial?: boolean;
  isAvailable: boolean;
  imageUrl?: string;
  optionGroups?: MenuItemOptionGroup[];
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
}

export interface TableConfig {
  id: string;
  label: string;
  qrToken: string;
  capacity: number;
}

export interface CafeConfig {
  identity: {
    name: string;
    tagline: string;
    description: string;
    instagramHandle: string;
    instagramUrl: string;
    phone: string;
    whatsappNumber: string;
    address: {
      street: string;
      area: string;
      city: string;
      state: string;
      pincode: string;
      coordinates: {
        lat: number;
        lng: number;
      };
      googleMapsUrl: string;
    };
    operatingHours: {
      schedule: string;
      daysOpen: string;
      openTime: string;
      closeTime: string;
      closedDay: string;
    };
  };
  fiscal: {
    currency: string;
    currencySymbol: string;
    taxRate: number; // 0.00% default
    taxInclusive: boolean;
    gstin: string | null;
  };
  tables: TableConfig[];
  categories: MenuCategory[];
  menuItems: MenuItem[];
}

export const CAFE_CONFIG: CafeConfig = {
  identity: {
    name: "Meeva Greens",
    tagline: "Nourish. Brew. Gather.",
    description:
      "A botanical cafe and specialty coffee house nestled in Pimpri-Chinchwad. Dedicated to single-origin brews, fresh seasonal produce, and soulful slow living.",
    instagramHandle: "@meevagreens",
    instagramUrl: "https://www.instagram.com/meevagreens/",
    phone: "+91 98230 45678",
    whatsappNumber: "+919823045678",
    address: {
      street: "Shop 4-6, Green Promenade",
      area: "Near Spine Road",
      city: "Pimpri-Chinchwad",
      state: "Maharashtra",
      pincode: "411033",
      coordinates: {
        lat: 18.650537,
        lng: 73.7658824,
      },
      googleMapsUrl: "https://maps.google.com/?q=18.650537,73.7658824",
    },
    operatingHours: {
      schedule: "8:00 AM – 10:30 PM",
      daysOpen: "Tuesday – Sunday",
      openTime: "08:00",
      closeTime: "22:30",
      closedDay: "Monday",
    },
  },
  fiscal: {
    currency: "INR",
    currencySymbol: "₹",
    taxRate: 0.0, // Default 0% GST pending CA registration
    taxInclusive: false,
    gstin: null,
  },
  tables: [
    { id: "tbl-01", label: "Table 1", qrToken: "token-mg-t01-dinein", capacity: 2 },
    { id: "tbl-02", label: "Table 2", qrToken: "token-mg-t02-dinein", capacity: 2 },
    { id: "tbl-03", label: "Table 3", qrToken: "token-mg-t03-dinein", capacity: 4 },
    { id: "tbl-04", label: "Table 4", qrToken: "token-mg-t04-dinein", capacity: 4 },
    { id: "tbl-05", label: "Table 5", qrToken: "token-mg-t05-dinein", capacity: 4 },
    { id: "tbl-06", label: "Table 6", qrToken: "token-mg-t06-dinein", capacity: 6 },
    { id: "tbl-07", label: "Table 7", qrToken: "token-mg-t07-dinein", capacity: 2 },
    { id: "tbl-08", label: "Table 8", qrToken: "token-mg-t08-dinein", capacity: 2 },
    { id: "tbl-09", label: "Table 9", qrToken: "token-mg-t09-dinein", capacity: 4 },
    { id: "tbl-10", label: "Table 10 (Garden)", qrToken: "token-mg-t10-dinein", capacity: 6 },
  ],
  categories: [
    { id: "cat-coffee", name: "Specialty Coffee", description: "Ethically sourced Arabica & slow cold brews", displayOrder: 1 },
    { id: "cat-tea", name: "Artisanal Teas & Matcha", description: "Ceremonial grade and botanical infusions", displayOrder: 2 },
    { id: "cat-brunch", name: "Botanical Brunch", description: "Sourdough toasts, slow eggs & shakshuka", displayOrder: 3 },
    { id: "cat-sandwiches", name: "Gourmet Paninis", description: "Stone-baked ciabatta & pressed sourdough", displayOrder: 4 },
    { id: "cat-bowls", name: "Nourish & Grain Bowls", description: "Farm fresh superfoods, grains & greens", displayOrder: 5 },
    { id: "cat-pastries", name: "Patisserie & Desserts", description: "Freshly baked morning croissants and tarts", displayOrder: 6 },
  ],
  menuItems: [
    {
      id: "item-espresso-tonic",
      categoryId: "cat-coffee",
      name: "Botanical Espresso Tonic",
      description: "Double shot of single-origin espresso over artisanal citrus tonic water with bruised rosemary.",
      basePrice: 220,
      isVeg: true,
      isVegan: true,
      isChefSpecial: true,
      isAvailable: true,
      optionGroups: [
        {
          id: "opt-ice",
          name: "Ice Preference",
          required: true,
          options: [
            { id: "ice-reg", name: "Standard Ice", priceDelta: 0 },
            { id: "ice-less", name: "Light Ice", priceDelta: 0 },
          ],
        },
      ],
    },
    {
      id: "item-flat-white",
      categoryId: "cat-coffee",
      name: "Velvet Flat White",
      description: "Silky micro-foam poured over a double ristretto blend from Chikmagalur estates.",
      basePrice: 190,
      isVeg: true,
      isVegan: false,
      isAvailable: true,
      optionGroups: [
        {
          id: "opt-milk",
          name: "Milk Selection",
          required: false,
          options: [
            { id: "milk-dairy", name: "Whole Dairy Milk", priceDelta: 0 },
            { id: "milk-oat", name: "Oat Milk (Barista Blend)", priceDelta: 40 },
            { id: "milk-almond", name: "Almond Milk", priceDelta: 40 },
          ],
        },
      ],
    },
    {
      id: "item-ceremonial-matcha",
      categoryId: "cat-tea",
      name: "Uji Ceremonial Matcha Latte",
      description: "Stone-ground Japanese green tea whisked with silky warm milk and light wildflower honey.",
      basePrice: 240,
      isVeg: true,
      isVegan: false,
      isChefSpecial: true,
      isAvailable: true,
      optionGroups: [
        {
          id: "opt-sweetness",
          name: "Sweetness Level",
          required: false,
          options: [
            { id: "sw-none", name: "Unsweetened", priceDelta: 0 },
            { id: "sw-med", name: "Regular Honey", priceDelta: 0 },
            { id: "sw-extra", name: "Extra Sweet", priceDelta: 0 },
          ],
        },
      ],
    },
    {
      id: "item-avocado-sourdough",
      categoryId: "cat-brunch",
      name: "Hass Avocado & Dukkah Toast",
      description: "Crushed Hass avocado on toasted country sourdough with toasted Egyptian dukkah, feta & micro greens.",
      basePrice: 320,
      isVeg: true,
      isVegan: false,
      isChefSpecial: true,
      isAvailable: true,
      optionGroups: [
        {
          id: "opt-egg-addon",
          name: "Add Protein",
          required: false,
          options: [
            { id: "opt-poached-egg", name: "Add Free-Range Poached Egg", priceDelta: 50 },
            { id: "opt-extra-feta", name: "Extra Crumbled Feta", priceDelta: 40 },
          ],
        },
      ],
    },
    {
      id: "item-truffle-mushroom-panini",
      categoryId: "cat-sandwiches",
      name: "Wild Truffle Mushroom Ciabatta",
      description: "Sauteed portobello and button mushrooms, caramelized onions, smoked scamorza, and black truffle aioli.",
      basePrice: 340,
      isVeg: true,
      isVegan: false,
      isAvailable: true,
    },
    {
      id: "item-meeva-green-bowl",
      categoryId: "cat-bowls",
      name: "Meeva Signature Harvest Bowl",
      description: "Warm quinoa, roasted sweet potatoes, edamame, baby spinach, crisp chickpeas, and tahini green goddess drizzle.",
      basePrice: 310,
      isVeg: true,
      isVegan: true,
      isChefSpecial: true,
      isAvailable: true,
    },
    {
      id: "item-almond-croissant",
      categoryId: "cat-pastries",
      name: "Twice-Baked Almond Croissant",
      description: "Flaky butter croissant filled with frangipane almond cream and topped with toasted flaked almonds.",
      basePrice: 210,
      isVeg: true,
      isVegan: false,
      isAvailable: true,
    },
  ],
};
