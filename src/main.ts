import '@angular/localize/init';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { loadTranslations } from '@angular/localize';
import {registerLocaleData} from '@angular/common';
import {LOCALE_ID} from '@angular/core';




// Read locale from local storage before app initialization
const appLang = localStorage.getItem('locale') || 'en';

// Init provided language
initLanguage(appLang)
  // Only load text after locale is initialized to translate static file
  .then(() =>
        bootstrapApplication(App, { ...appConfig ,
          providers: [{ provide: LOCALE_ID, useValue: appLang }]})
      .catch((err) => console.error(err)));


async function initLanguage(locale: string): Promise<void> {
  if (locale === 'en') {
    // Default behavior, no changes required
    return;
  }

  try {
    // Fetch pre-converted JSON translation file
    const response = await fetch('/i18n/messages.' + locale + '.json');

    if (!response.ok) {
      console.error(`Failed to load translation file for locale "${locale}". Status: ${response.status}`);
      console.warn('Falling back to English (default locale)');
      return;
    }

    const json = await response.json();

    // Initialize translation
    loadTranslations(json);
    $localize.locale = locale;

    // Load required locale module (needs to be adjusted for different locales)
    const localeModule = await import(`../node_modules/@angular/common/locales/de`);
    registerLocaleData(localeModule.default);
  } catch (error) {
    console.error(`Error loading translation for locale "${locale}":`, error);
    console.warn('Falling back to English (default locale)');
  }
}
