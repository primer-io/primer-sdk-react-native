import React, {useState} from 'react';
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import {hasLocale, translate} from '@primer-io/react-native';
import type {TranslationParams} from '@primer-io/react-native';

interface SampleEntry {
  key: string;
  params?: TranslationParams;
}

const ALL_LOCALES = [
  'en', 'ar', 'az', 'bg', 'bs', 'ca', 'cs', 'da', 'de', 'el',
  'es', 'es-AR', 'es-MX', 'et', 'fa', 'fi', 'fil', 'fr', 'he', 'hi',
  'hr', 'hu', 'hy', 'id', 'it', 'ja', 'ka', 'kk', 'ko', 'ku',
  'ky', 'lt', 'lv', 'mk', 'ms', 'nb', 'nl', 'nl-BE', 'pl', 'pt',
  'pt-BR', 'ro', 'ru', 'sk', 'sl', 'sq', 'sr', 'sv', 'th', 'tr',
  'uk', 'ur-PK', 'uz', 'vi', 'zh-CN', 'zh-HK', 'zh-TW',
];

const SAMPLE_ENTRIES: SampleEntry[] = [
  {key: 'primer_checkout_title'},
  {key: 'primer_checkout_success_title'},
  {key: 'primer_checkout_success_subtitle'},
  {key: 'primer_checkout_error_title'},
  {key: 'primer_checkout_error_subtitle'},
  {key: 'primer_checkout_error_button_other_methods'},
  {key: 'primer_checkout_processing_title'},
  {key: 'primer_checkout_processing_subtitle'},
  {key: 'primer_common_button_pay'},
  {key: 'primer_common_button_pay_amount', params: {amount: '$49.99'}},
  {key: 'primer_common_button_cancel'},
  {key: 'primer_common_button_retry'},
  {key: 'primer_common_error_generic'},
  {key: 'primer_card_form_title'},
  {key: 'primer_card_form_label_number'},
  {key: 'primer_card_form_label_name'},
  {key: 'primer_card_form_label_expiry'},
  {key: 'primer_card_form_label_cvv'},
  {key: 'primer_card_form_add_card'},
  {key: 'primer_payment_selection_header'},
  {key: 'primer_country_title'},
  {key: 'primer_country_placeholder_search'},
  {key: 'primer_vault_format_card_details', params: {cardNetwork: 'Visa', last4: '4242'}},
  {key: 'primer_vault_format_expires', params: {month: '12', year: '28'}},
  {key: 'primer_vault_format_masked', params: {last4: '4242'}},
  {key: 'primer_web_redirect_button_continue', params: {paymentMethodName: 'PayPal'}},
];

const LocalizationDebugScreen = () => {
  const [selectedLocale, setSelectedLocale] = useState('en');
  const [search, setSearch] = useState('');

  const filteredLocales = search
    ? ALL_LOCALES.filter(l => l.toLowerCase().includes(search.toLowerCase()))
    : ALL_LOCALES;

  return (
    <View style={s.container}>
      <TextInput
        style={s.search}
        placeholder="Filter locales..."
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        horizontal
        data={filteredLocales}
        keyExtractor={item => item}
        style={s.localeList}
        contentContainerStyle={s.localeListContent}
        renderItem={({item}) => (
          <TouchableOpacity
            style={[
              s.localeChip,
              item === selectedLocale && s.localeChipSelected,
              !hasLocale(item) && s.localeChipMissing,
            ]}
            onPress={() => setSelectedLocale(item)}>
            <Text
              style={[
                s.localeChipText,
                item === selectedLocale && s.localeChipTextSelected,
              ]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />
      <FlatList
        data={SAMPLE_ENTRIES}
        keyExtractor={item => item.key}
        contentContainerStyle={s.stringList}
        renderItem={({item: {key, params}}) => {
          const value = translate(key, selectedLocale, params);
          const enValue = translate(key, 'en', params);
          const isFallback = selectedLocale !== 'en' && value === enValue;
          return (
            <View style={s.row}>
              <Text style={s.key}>
                {key}
                {params ? `  ${JSON.stringify(params)}` : ''}
              </Text>
              <Text style={[s.value, isFallback && s.valueFallback]}>
                {value}
              </Text>
              {isFallback && <Text style={s.fallbackBadge}>EN fallback</Text>}
            </View>
          );
        }}
      />
    </View>
  );
};

const s = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  search: {
    margin: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 14,
  },
  localeList: {maxHeight: 48, flexGrow: 0},
  localeListContent: {paddingHorizontal: 12, gap: 6},
  localeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  localeChipSelected: {backgroundColor: '#007AFF'},
  localeChipMissing: {opacity: 0.4},
  localeChipText: {fontSize: 13, color: '#333'},
  localeChipTextSelected: {color: '#fff', fontWeight: '600'},
  stringList: {padding: 12},
  row: {marginBottom: 16},
  key: {fontSize: 11, color: '#999', fontFamily: 'Courier'},
  value: {fontSize: 15, color: '#000', marginTop: 2},
  valueFallback: {color: '#999', fontStyle: 'italic'},
  fallbackBadge: {
    fontSize: 10,
    color: '#FF9500',
    marginTop: 2,
    fontWeight: '600',
  },
});

export default LocalizationDebugScreen;
