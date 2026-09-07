import { CartItem, Product, StoreSettings } from '../types';

export const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const calculateDiscountPercentage = (price: number, originalPrice: number): number => {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
};

export const generateWhatsAppOrderUrl = (
  items: CartItem[],
  total: number,
  settings: StoreSettings,
  customerDetails?: { name: string; phone: string; address: string; city: string; pincode: string }
): string => {
  const cleanPhone = settings.whatsappNumber.replace(/[^0-9]/g, '');
  
  let text = `⚡ *NEW ORDER INQUIRY - ASK ENTERPRISES*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  text += `📦 *ITEMS ORDERED:*\n`;
  items.forEach((item, index) => {
    text += `${index + 1}. *${item.product.name}*\n`;
    text += `   ↳ Qty: ${item.quantity} x ${formatINR(item.product.price)} = ${formatINR(item.product.price * item.quantity)}\n`;
  });
  
  text += `\n💰 *Total Amount:* ${formatINR(total)}\n`;
  
  if (customerDetails && customerDetails.name) {
    text += `\n👤 *Customer Details:*\n`;
    text += `• Name: ${customerDetails.name}\n`;
    text += `• Phone: ${customerDetails.phone}\n`;
    text += `• Address: ${customerDetails.address}, ${customerDetails.city} - ${customerDetails.pincode}\n`;
  }
  
  text += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `Please confirm my order availability & delivery schedule. Thank you!`;
  
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
};

export const generateWhatsAppProductInquiryUrl = (product: Product, settings: StoreSettings): string => {
  const cleanPhone = settings.whatsappNumber.replace(/[^0-9]/g, '');
  const text = `Hi ASK ENTERPRISES! 👋\n\nI am interested in buying:\n⚡ *${product.name}*\n🏷️ Price: *${formatINR(product.price)}* (Category: ${product.category})\n\nIs this available in stock? Please share delivery details to my location.`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
};

export const formatOrderDate = (dateString?: string): string => {
  if (!dateString) return 'Recent';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};
