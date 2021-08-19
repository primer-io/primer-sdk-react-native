import type { CountryCode } from './countryCode';

interface IAddress {
  line1: String;
  line2: String;
  postalCode: String;
  city: String;
  country: CountryCode;
}
