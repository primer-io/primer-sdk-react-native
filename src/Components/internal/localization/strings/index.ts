import type { TranslationMap } from '../types';
import ar from './ar';
import az from './az';
import bg from './bg';
import bs from './bs';
import ca from './ca';
import cs from './cs';
import da from './da';
import de from './de';
import el from './el';
import en from './en';
import es_AR from './es-AR';
import es_MX from './es-MX';
import es from './es';
import et from './et';
import fa from './fa';
import fi from './fi';
import fil from './fil';
import fr from './fr';
import he from './he';
import hi from './hi';
import hr from './hr';
import hu from './hu';
import hy from './hy';
import id from './id';
import it from './it';
import ja from './ja';
import ka from './ka';
import kk from './kk';
import ko from './ko';
import ku from './ku';
import ky from './ky';
import lt from './lt';
import lv from './lv';
import mk from './mk';
import ms from './ms';
import nb from './nb';
import nl_BE from './nl-BE';
import nl from './nl';
import pl from './pl';
import pt_BR from './pt-BR';
import pt from './pt';
import ro from './ro';
import ru from './ru';
import sk from './sk';
import sl from './sl';
import sq from './sq';
import sr from './sr';
import sv from './sv';
import th from './th';
import tr from './tr';
import uk from './uk';
import ur_PK from './ur-PK';
import uz from './uz';
import vi from './vi';
import zh_CN from './zh-CN';
import zh_HK from './zh-HK';
import zh_TW from './zh-TW';

const stringRegistry: Record<string, TranslationMap> = {
  ar,
  az,
  bg,
  bs,
  ca,
  cs,
  da,
  de,
  el,
  en,
  'es-AR': es_AR,
  'es-MX': es_MX,
  es,
  et,
  fa,
  fi,
  fil,
  fr,
  he,
  hi,
  hr,
  hu,
  hy,
  id,
  it,
  ja,
  ka,
  kk,
  ko,
  ku,
  ky,
  lt,
  lv,
  mk,
  ms,
  nb,
  'nl-BE': nl_BE,
  nl,
  pl,
  'pt-BR': pt_BR,
  pt,
  ro,
  ru,
  sk,
  sl,
  sq,
  sr,
  sv,
  th,
  tr,
  uk,
  'ur-PK': ur_PK,
  uz,
  vi,
  'zh-CN': zh_CN,
  'zh-HK': zh_HK,
  'zh-TW': zh_TW,
};

export function getTranslationMap(locale: string): TranslationMap | undefined {
  return stringRegistry[locale];
}

export function hasLocale(locale: string): boolean {
  return locale in stringRegistry;
}
