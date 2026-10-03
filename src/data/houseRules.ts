import { Lang } from '../i18n/dictionaries';

export type RuleIcon = 'clock' | 'hourglass' | 'valuables' | 'damage' | 'smoking' | 'kettle' | 'cleaning' | 'payment';

export interface HouseRule {
  icon: RuleIcon;
  title: string;
  text: string;
  /** Short key figure shown as a chip (time / price / fine). */
  chips?: string[];
}

// Hotel house rules shown (and signed) at registration step 3. The Russian text is the
// hotel's original; English and Uzbek are translations of it.
export const HOUSE_RULES: Record<Lang, HouseRule[]> = {
  ru: [
    { icon: 'clock', title: 'Заезд и выезд', text: 'Заезд — с 14:00, выезд — до 12:00.', chips: ['Заезд 14:00', 'Выезд 12:00'] },
    {
      icon: 'hourglass',
      title: 'Поздний выезд',
      text: 'Если вы задерживаетесь после 12:00, это считается поздним выездом на 1 час.',
      chips: ['100 000 сум / час'],
    },
    {
      icon: 'valuables',
      title: 'Ценные вещи',
      text: 'Администрация отеля не несёт ответственности за ценные вещи, не переданные на хранение сотрудникам отеля, а также за вещи, оставленные без присмотра.',
    },
    {
      icon: 'damage',
      title: 'Сохранность имущества',
      text: 'В случае порчи имущества отеля, сотрудников отеля или других гостей проживающий возмещает причинённый им ущерб.',
    },
    {
      icon: 'smoking',
      title: 'Курение запрещено',
      text: 'За курение в номере или на территории отеля взимается дополнительная плата за специальную чистку номера (помещения) в местной валюте.',
      chips: ['10 $ за чистку'],
    },
    {
      icon: 'kettle',
      title: 'Электрический чайник',
      text: 'В трёхместных, четырёхместных и улучшенных двухместных номерах есть электрический чайник. Используйте его только для кипячения воды: если варить в нём яйца, другие продукты, настои или чай, взимается штраф.',
      chips: ['Штраф 200 000 сум'],
    },
    {
      icon: 'cleaning',
      title: 'Уборка номера',
      text: 'Уборка номера производится один раз в сутки. Постельное бельё меняется каждые два дня — с согласия гостя.',
    },
    {
      icon: 'payment',
      title: 'Оплата счёта',
      text: 'Я согласен с тем, что лично несу ответственность за оплату счёта. Если лицо, компания или ассоциация, указанные мной как ответственные за его оплату, не произведут оплату расходов, моя ответственность за оплату счёта будет солидарной с таким лицом, компанией или ассоциацией.',
    },
  ],
  en: [
    { icon: 'clock', title: 'Check-in and check-out', text: 'Check-in is from 14:00, check-out is until 12:00.', chips: ['Check-in 14:00', 'Check-out 12:00'] },
    {
      icon: 'hourglass',
      title: 'Late check-out',
      text: 'Staying past 12:00 counts as a 1-hour late check-out.',
      chips: ['100,000 UZS / hour'],
    },
    {
      icon: 'valuables',
      title: 'Valuables',
      text: 'The hotel administration is not responsible for valuables that were not handed over to hotel staff for safekeeping, or for belongings left unattended.',
    },
    {
      icon: 'damage',
      title: 'Property damage',
      text: 'If the property of the hotel, its staff or other guests is damaged, the guest compensates for the damage caused.',
    },
    {
      icon: 'smoking',
      title: 'No smoking',
      text: 'Smoking in the room or on the hotel premises incurs an additional fee for special cleaning of the room (premises), payable in local currency.',
      chips: ['$10 cleaning fee'],
    },
    {
      icon: 'kettle',
      title: 'Electric kettle',
      text: 'Triple, quadruple and superior double rooms have an electric kettle. Use it only to boil water: boiling eggs, other food, infusions or tea in it incurs a fine.',
      chips: ['Fine 200,000 UZS'],
    },
    {
      icon: 'cleaning',
      title: 'Housekeeping',
      text: 'Rooms are cleaned once a day. Bed linen is changed every two days, with the guest’s consent.',
    },
    {
      icon: 'payment',
      title: 'Payment of the bill',
      text: 'I agree that I am personally responsible for paying the bill, and if the person, company or association I have named as responsible for it does not pay the charges, my liability for the bill will be joint with that person, company or association.',
    },
  ],
  uz: [
    { icon: 'clock', title: 'Joylashish va chiqish', text: 'Joylashish — soat 14:00 dan, chiqish — soat 12:00 gacha.', chips: ['Joylashish 14:00', 'Chiqish 12:00'] },
    {
      icon: 'hourglass',
      title: 'Kech chiqish',
      text: 'Soat 12:00 dan keyin qolsangiz, bu 1 soatlik kech chiqish hisoblanadi.',
      chips: ["100 000 so'm / soat"],
    },
    {
      icon: 'valuables',
      title: 'Qimmatbaho buyumlar',
      text: "Mehmonxona ma'muriyati xodimlarga saqlash uchun topshirilmagan qimmatbaho buyumlar hamda qarovsiz qoldirilgan buyumlar uchun javobgar emas.",
    },
    {
      icon: 'damage',
      title: 'Mulkning saqlanishi',
      text: "Mehmonxona, uning xodimlari yoki boshqa mehmonlar mulkiga zarar yetkazilgan taqdirda, yashovchi yetkazilgan zararni qoplaydi.",
    },
    {
      icon: 'smoking',
      title: 'Chekish taqiqlangan',
      text: "Xonada yoki mehmonxona hududida chekilganda xonani (binoni) maxsus tozalash uchun milliy valyutada qo'shimcha to'lov olinadi.",
      chips: ['Tozalash uchun 10 $'],
    },
    {
      icon: 'kettle',
      title: 'Elektr choynak',
      text: "Uch va to'rt kishilik hamda yaxshilangan ikki kishilik xonalarda elektr choynak bor. Undan faqat suv qaynatish uchun foydalaning: unda tuxum, boshqa mahsulotlar, damlamalar yoki choy qaynatilsa, jarima olinadi.",
      chips: ["Jarima 200 000 so'm"],
    },
    {
      icon: 'cleaning',
      title: 'Xonani tozalash',
      text: "Xona sutkasiga bir marta tozalanadi. Choyshablar mehmon roziligi bilan har ikki kunda almashtiriladi.",
    },
    {
      icon: 'payment',
      title: "Hisobni to'lash",
      text: "Hisobni to'lash uchun shaxsan javobgar ekanligimga roziman. Agar men to'lov uchun javobgar deb ko'rsatgan shaxs, kompaniya yoki uyushma xarajatlarni to'lamasa, hisob bo'yicha javobgarligim ushbu shaxs, kompaniya yoki uyushma bilan solidar bo'ladi.",
    },
  ],
};
