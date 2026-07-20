export const DEFAULT_PREFIX = '+229'

export const PHONE_PREFIXES = [
  // Afrique de l'Ouest — CEDEAO
  { code: '+229', country: 'Bénin',          flag: '🇧🇯', iso2: 'BJ' },
  { code: '+226', country: 'Burkina Faso',   flag: '🇧🇫', iso2: 'BF' },
  { code: '+238', country: 'Cap-Vert',       flag: '🇨🇻', iso2: 'CV' },
  { code: '+220', country: 'Gambie',         flag: '🇬🇲', iso2: 'GM' },
  { code: '+233', country: 'Ghana',          flag: '🇬🇭', iso2: 'GH' },
  { code: '+224', country: 'Guinée',         flag: '🇬🇳', iso2: 'GN' },
  { code: '+245', country: 'Guinée-Bissau',  flag: '🇬🇼', iso2: 'GW' },
  { code: '+225', country: "Côte d'Ivoire",  flag: '🇨🇮', iso2: 'CI' },
  { code: '+231', country: 'Libéria',        flag: '🇱🇷', iso2: 'LR' },
  { code: '+223', country: 'Mali',           flag: '🇲🇱', iso2: 'ML' },
  { code: '+222', country: 'Mauritanie',     flag: '🇲🇷', iso2: 'MR' },
  { code: '+227', country: 'Niger',          flag: '🇳🇪', iso2: 'NE' },
  { code: '+234', country: 'Nigéria',        flag: '🇳🇬', iso2: 'NG' },
  { code: '+232', country: 'Sierra Leone',   flag: '🇸🇱', iso2: 'SL' },
  { code: '+221', country: 'Sénégal',        flag: '🇸🇳', iso2: 'SN' },
  { code: '+228', country: 'Togo',           flag: '🇹🇬', iso2: 'TG' },
  // Afrique centrale
  { code: '+237', country: 'Cameroun',       flag: '🇨🇲', iso2: 'CM' },
  { code: '+236', country: 'Centrafrique',   flag: '🇨🇫', iso2: 'CF' },
  { code: '+235', country: 'Tchad',          flag: '🇹🇩', iso2: 'TD' },
  { code: '+242', country: 'Congo',          flag: '🇨🇬', iso2: 'CG' },
  { code: '+243', country: 'Congo RD',       flag: '🇨🇩', iso2: 'CD' },
  { code: '+241', country: 'Gabon',          flag: '🇬🇦', iso2: 'GA' },
  { code: '+240', country: 'Guinée éq.',     flag: '🇬🇶', iso2: 'GQ' },
  { code: '+239', country: 'São Tomé',       flag: '🇸🇹', iso2: 'ST' },
  // Afrique du Nord
  { code: '+212', country: 'Maroc',          flag: '🇲🇦', iso2: 'MA' },
  { code: '+213', country: 'Algérie',        flag: '🇩🇿', iso2: 'DZ' },
  { code: '+216', country: 'Tunisie',        flag: '🇹🇳', iso2: 'TN' },
  { code: '+218', country: 'Libye',          flag: '🇱🇾', iso2: 'LY' },
  { code: '+20',  country: 'Égypte',         flag: '🇪🇬', iso2: 'EG' },
  { code: '+249', country: 'Soudan',         flag: '🇸🇩', iso2: 'SD' },
  // Afrique de l'Est
  { code: '+211', country: 'Soudan du Sud',  flag: '🇸🇸', iso2: 'SS' },
  { code: '+251', country: 'Éthiopie',       flag: '🇪🇹', iso2: 'ET' },
  { code: '+291', country: 'Érythrée',       flag: '🇪🇷', iso2: 'ER' },
  { code: '+253', country: 'Djibouti',       flag: '🇩🇯', iso2: 'DJ' },
  { code: '+252', country: 'Somalie',        flag: '🇸🇴', iso2: 'SO' },
  { code: '+254', country: 'Kenya',          flag: '🇰🇪', iso2: 'KE' },
  { code: '+256', country: 'Ouganda',        flag: '🇺🇬', iso2: 'UG' },
  { code: '+255', country: 'Tanzanie',       flag: '🇹🇿', iso2: 'TZ' },
  { code: '+250', country: 'Rwanda',         flag: '🇷🇼', iso2: 'RW' },
  { code: '+257', country: 'Burundi',        flag: '🇧🇮', iso2: 'BI' },
  { code: '+261', country: 'Madagascar',     flag: '🇲🇬', iso2: 'MG' },
  { code: '+230', country: 'Maurice',        flag: '🇲🇺', iso2: 'MU' },
  { code: '+248', country: 'Seychelles',     flag: '🇸🇨', iso2: 'SC' },
  { code: '+269', country: 'Comores',        flag: '🇰🇲', iso2: 'KM' },
  // Afrique australe
  { code: '+27',  country: 'Afrique du Sud', flag: '🇿🇦', iso2: 'ZA' },
  { code: '+260', country: 'Zambie',         flag: '🇿🇲', iso2: 'ZM' },
  { code: '+263', country: 'Zimbabwe',       flag: '🇿🇼', iso2: 'ZW' },
  { code: '+265', country: 'Malawi',         flag: '🇲🇼', iso2: 'MW' },
  { code: '+258', country: 'Mozambique',     flag: '🇲🇿', iso2: 'MZ' },
  { code: '+267', country: 'Botswana',       flag: '🇧🇼', iso2: 'BW' },
  { code: '+264', country: 'Namibie',        flag: '🇳🇦', iso2: 'NA' },
  { code: '+266', country: 'Lesotho',        flag: '🇱🇸', iso2: 'LS' },
  { code: '+268', country: 'Eswatini',       flag: '🇸🇿', iso2: 'SZ' },
  { code: '+244', country: 'Angola',         flag: '🇦🇴', iso2: 'AO' },
]

/** Extrait le préfixe et le numéro depuis une valeur combinée comme "+229 97000000" */
export function parsePhoneValue(value = '') {
  for (const p of PHONE_PREFIXES) {
    if (value.startsWith(p.code)) {
      return { prefix: p.code, number: value.slice(p.code.length).trimStart() }
    }
  }
  return { prefix: DEFAULT_PREFIX, number: value.startsWith('+') ? '' : value }
}
