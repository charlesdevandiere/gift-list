import { Injectable } from '@angular/core';
import { Translations } from './translations';

@Injectable()
export class AppTranslations implements Translations {

  public readonly language: string = navigator.language.startsWith('fr') ? 'fr' : 'en';

  private homeGiftListName = (user: string): string => this.home.giftList.name_user.replace('{{user}}', user);
  private deleteGift = (gift: string): string => this.home.giftList.deleteGift_gift.replace('{{gift}}', gift);
  private cartUnoffer = (gift: string): string => this.cart.unoffer_gift.replace('{{gift}}', gift);

  public $schema = '';

  public title = '';
  public menu = {
    editProfile: '',
    changeUser: '',
    addUser: '',
    import: '',
    export: '',
    signOut: '',
    cart: ''
  };
  public home = {
    giftLists: '',
    giftList: {
      addGift: '',
      name_user: '',
      name: this.homeGiftListName,
      noUser: '',
      getGiftsError: '',
      deleteGift_gift: '',
      deleteGift: this.deleteGift
    },
    getListsError: ''
  };
  public cart = {
    title: '',
    noContent: '',
    unoffer_gift: '',
    unoffer: this.cartUnoffer
  };
  public signIn = {
    title: '',
    group: '',
    signIn: '',
    password: '',
    wrongGroupOrPasswordMessage: '',
    selectUser: ''
  };
  public importExport = {
    title: '',
    downloadTemplateFile: '',
    csvFile: '',
    browse: '',
    import: '',
    export: '',
    details: '',
    errorMessage: '',
    successMessage: ''
  };
  public changeUser = {
    currentUser: '',
    users: ''
  };
  public user = {
    addTitle: '',
    updateTitle: '',
    name: '',
    picture: '',
    userAddedMessage: '',
    userUpdatedMessage: ''
  };
  public gift = {
    addTitle: '',
    updateTitle: '',
    name: '',
    link: '',
    giftAddedMessage: '',
    giftUpdatedMessage: ''
  };
  public share = {
    title: '',
    copyToClipboard: '',
    successMessage: ''
  };
  public misc = {
    cancel: '',
    close: '',
    delete: '',
    error: '',
    loading: '',
    no: '',
    ok: '',
    save: '',
    yes: '',
    anonymous: ''
  };

  public async load(): Promise<void> {
    try {
      const response = await fetch(`assets/${this.language}.json`);
      if (!response.ok) {
        throw new Error('Request failed.');
      }
      const translations = await response.json() as Translations;
      Object.assign(this, translations);
      this.home.giftList.name = this.homeGiftListName;
      this.home.giftList.deleteGift = this.deleteGift;
      this.cart.unoffer = this.cartUnoffer;
    } catch (error) {
      console.error('Failed to load resources.', error);
    }
  }
}
