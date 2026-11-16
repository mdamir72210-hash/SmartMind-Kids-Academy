import { PictureCategoryId, PictureItem } from '../types/learning';

export interface PictureCategoryMeta {
  id: PictureCategoryId;
  title: string;
  bengaliTitle: string;
  accentBg: string;
  accentText: string;
}

export const PICTURE_CATEGORIES: PictureCategoryMeta[] = [
  { id: 'animals', title: 'Animals', bengaliTitle: 'পশু ও প্রাণী', accentBg: 'bg-amber-50', accentText: 'text-amber-800' },
  { id: 'birds', title: 'Birds', bengaliTitle: 'পাখি', accentBg: 'bg-sky-50', accentText: 'text-sky-800' },
  { id: 'fruits', title: 'Fruits', bengaliTitle: 'ফল', accentBg: 'bg-rose-50', accentText: 'text-rose-800' },
  { id: 'vegetables', title: 'Vegetables', bengaliTitle: 'সবজি', accentBg: 'bg-emerald-50', accentText: 'text-emerald-800' },
  { id: 'colors', title: 'Colors', bengaliTitle: 'রং', accentBg: 'bg-violet-50', accentText: 'text-violet-800' },
  { id: 'vehicles', title: 'Vehicles', bengaliTitle: 'যানবাহন', accentBg: 'bg-blue-50', accentText: 'text-blue-800' },
  { id: 'body', title: 'Body Parts', bengaliTitle: 'শরীরের অঙ্গ', accentBg: 'bg-orange-50', accentText: 'text-orange-800' },
  { id: 'objects', title: 'Everyday Objects', bengaliTitle: 'দৈনন্দিন জিনিস', accentBg: 'bg-teal-50', accentText: 'text-teal-800' },
];

export const PICTURE_ITEMS: PictureItem[] = [
  // Animals
  { id: 'ani-lion', category: 'animals', english: 'Lion', bengali: 'সিংহ', phonetic: 'Singho', artKey: 'lion' },
  { id: 'ani-tiger', category: 'animals', english: 'Tiger', bengali: 'বাঘ', phonetic: 'Bagh', artKey: 'tiger' },
  { id: 'ani-elephant', category: 'animals', english: 'Elephant', bengali: 'হাতি', phonetic: 'Hati', artKey: 'elephant' },
  { id: 'ani-cat', category: 'animals', english: 'Cat', bengali: 'বিড়াল', phonetic: 'Biral', artKey: 'cat' },
  { id: 'ani-dog', category: 'animals', english: 'Dog', bengali: 'কুকুর', phonetic: 'Kukur', artKey: 'dog' },
  { id: 'ani-cow', category: 'animals', english: 'Cow', bengali: 'গরু', phonetic: 'Goru', artKey: 'cow' },
  { id: 'ani-rabbit', category: 'animals', english: 'Rabbit', bengali: 'খরগোশ', phonetic: 'Khorgosh', artKey: 'rabbit' },
  { id: 'ani-zebra', category: 'animals', english: 'Zebra', bengali: 'জেব্রা', phonetic: 'Zebra', artKey: 'zebra' },

  // Birds
  { id: 'bird-hen', category: 'birds', english: 'Hen', bengali: 'মুরগি', phonetic: 'Murgi', artKey: 'hen' },
  { id: 'bird-eagle', category: 'birds', english: 'Eagle', bengali: 'ঈগল', phonetic: 'Eegol', artKey: 'eagle' },
  { id: 'bird-peacock', category: 'birds', english: 'Peacock', bengali: 'ময়ূর', phonetic: 'Moyur', artKey: 'peacock' },
  { id: 'bird-owl', category: 'birds', english: 'Owl', bengali: 'পেঁচা', phonetic: 'Pencha', artKey: 'owl' },
  { id: 'bird-duck', category: 'birds', english: 'Duck', bengali: 'হাঁস', phonetic: 'Hansh', artKey: 'duck' },
  { id: 'bird-parrot', category: 'birds', english: 'Parrot', bengali: 'টিয়া পাখি', phonetic: 'Tiya Pakhi', artKey: 'parrot' },

  // Fruits
  { id: 'fru-apple', category: 'fruits', english: 'Apple', bengali: 'আপেল', phonetic: 'Apel', artKey: 'apple' },
  { id: 'fru-mango', category: 'fruits', english: 'Mango', bengali: 'আম', phonetic: 'Aam', artKey: 'mango' },
  { id: 'fru-banana', category: 'fruits', english: 'Banana', bengali: 'কলা', phonetic: 'Kola', artKey: 'banana' },
  { id: 'fru-orange', category: 'fruits', english: 'Orange', bengali: 'কমলালেবু', phonetic: 'Komalalebu', artKey: 'orange' },
  { id: 'fru-grapes', category: 'fruits', english: 'Grapes', bengali: 'আঙুর', phonetic: 'Angur', artKey: 'grapes' },
  { id: 'fru-watermelon', category: 'fruits', english: 'Watermelon', bengali: 'তরমুজ', phonetic: 'Tormuj', artKey: 'watermelon' },

  // Vegetables
  { id: 'veg-tomato', category: 'vegetables', english: 'Tomato', bengali: 'টমেটো', phonetic: 'Tomato', artKey: 'tomato' },
  { id: 'veg-potato', category: 'vegetables', english: 'Potato', bengali: 'আলু', phonetic: 'Alu', artKey: 'potato' },
  { id: 'veg-carrot', category: 'vegetables', english: 'Carrot', bengali: 'গাজর', phonetic: 'Gajor', artKey: 'carrot' },
  { id: 'veg-brinjal', category: 'vegetables', english: 'Eggplant', bengali: 'বেগুন', phonetic: 'Begun', artKey: 'eggplant' },
  { id: 'veg-onion', category: 'vegetables', english: 'Onion', bengali: 'পেঁয়াজ', phonetic: 'Peyaj', artKey: 'onion' },
  { id: 'veg-spinach', category: 'vegetables', english: 'Spinach', bengali: 'পালং শাক', phonetic: 'Palong Shak', artKey: 'leafy' },

  // Colors
  { id: 'col-red', category: 'colors', english: 'Red', bengali: 'লাল', phonetic: 'Lal', artKey: 'color-swatch', colorHex: '#EF4444' },
  { id: 'col-blue', category: 'colors', english: 'Blue', bengali: 'নীল', phonetic: 'Neel', artKey: 'color-swatch', colorHex: '#3B82F6' },
  { id: 'col-green', category: 'colors', english: 'Green', bengali: 'সবুজ', phonetic: 'Sobuj', artKey: 'color-swatch', colorHex: '#22C55E' },
  { id: 'col-yellow', category: 'colors', english: 'Yellow', bengali: 'হলুদ', phonetic: 'Holud', artKey: 'color-swatch', colorHex: '#FACC15' },
  { id: 'col-orange', category: 'colors', english: 'Orange', bengali: 'কমলা', phonetic: 'Komola', artKey: 'color-swatch', colorHex: '#F97316' },
  { id: 'col-purple', category: 'colors', english: 'Purple', bengali: 'বেগুনি', phonetic: 'Beguni', artKey: 'color-swatch', colorHex: '#8B5CF6' },

  // Vehicles
  { id: 'veh-car', category: 'vehicles', english: 'Car', bengali: 'গাড়ি', phonetic: 'Gari', artKey: 'car' },
  { id: 'veh-bus', category: 'vehicles', english: 'Bus', bengali: 'বাস', phonetic: 'Bus', artKey: 'bus' },
  { id: 'veh-van', category: 'vehicles', english: 'Van', bengali: 'ভ্যান', phonetic: 'Van', artKey: 'van' },
  { id: 'veh-boat', category: 'vehicles', english: 'Boat', bengali: 'নৌকা', phonetic: 'Nouka', artKey: 'boat' },
  { id: 'veh-ship', category: 'vehicles', english: 'Ship', bengali: 'জাহাজ', phonetic: 'Jahaj', artKey: 'ship' },
  { id: 'veh-airplane', category: 'vehicles', english: 'Airplane', bengali: 'উড়োজাহাজ', phonetic: 'Urojahaj', artKey: 'airplane' },

  // Body Parts
  { id: 'body-eye', category: 'body', english: 'Eye', bengali: 'চোখ', phonetic: 'Chokh', artKey: 'eye' },
  { id: 'body-ear', category: 'body', english: 'Ear', bengali: 'কান', phonetic: 'Kan', artKey: 'ear' },
  { id: 'body-nose', category: 'body', english: 'Nose', bengali: 'নাক', phonetic: 'Nak', artKey: 'nose' },
  { id: 'body-hand', category: 'body', english: 'Hand', bengali: 'হাত', phonetic: 'Hat', artKey: 'hand' },
  { id: 'body-foot', category: 'body', english: 'Foot', bengali: 'পা', phonetic: 'Pa', artKey: 'foot' },
  { id: 'body-smile', category: 'body', english: 'Mouth', bengali: 'মুখ', phonetic: 'Mukh', artKey: 'mouth' },

  // Everyday Objects
  { id: 'obj-book', category: 'objects', english: 'Book', bengali: 'বই', phonetic: 'Boi', artKey: 'book' },
  { id: 'obj-pen', category: 'objects', english: 'Pen', bengali: 'কলম', phonetic: 'Kolom', artKey: 'pen' },
  { id: 'obj-ball', category: 'objects', english: 'Ball', bengali: 'বল', phonetic: 'Bol', artKey: 'ball' },
  { id: 'obj-watch', category: 'objects', english: 'Watch', bengali: 'ঘড়ি', phonetic: 'Ghori', artKey: 'watch' },
  { id: 'obj-umbrella', category: 'objects', english: 'Umbrella', bengali: 'ছাতা', phonetic: 'Chhata', artKey: 'umbrella' },
  { id: 'obj-jug', category: 'objects', english: 'Jug', bengali: 'জগ', phonetic: 'Jog', artKey: 'jug' },
];
