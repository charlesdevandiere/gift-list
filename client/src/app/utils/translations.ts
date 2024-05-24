export interface Translations {
  $schema: string;
  title: string;
  menu: MenuTranslations;
  home: HomeTranslations;
  signIn: SignInTranslations;
  importExport: ImportExportTranslations;
  gift: GiftTranslations;
  share: ShareTranslations;
  misc: MiscellaneousTranslations;
  cart: CartTranslations;
  changeUser: ChangeUserTranslations;
  user: UserTranslations;
}

export interface MenuTranslations {
  editProfile: string;
  changeUser: string;
  addUser: string;
  import: string;
  export: string;
  signOut: string;
  cart: string;
}

export interface HomeTranslations {
  giftLists: string;
  giftList: {
    name_user: string;
    noUser: string;
    addGift: string;
    getGiftsError: string;
    deleteGift_gift: string;
  };
  getListsError: string;
}

export interface CartTranslations {
  title: string;
  noContent: string;
  unoffer_gift: string;
}

export interface ChangeUserTranslations {
  currentUser: string;
  users: string;
}

export interface UserTranslations {
  addTitle: string;
  updateTitle: string;
  name: string;
  picture: string;
  userAddedMessage: string;
  userUpdatedMessage: string;
}

export interface SignInTranslations {
  title: string;
  group: string;
  password: string;
  signIn: string;
  wrongGroupOrPasswordMessage: string;
  selectUser: string;
}

export interface ImportExportTranslations {
  title: string;
  downloadTemplateFile: string;
  csvFile: string;
  browse: string;
  import: string;
  export: string;
  details: string;
  errorMessage: string;
  successMessage: string;
}

export interface GiftTranslations {
  addTitle: string;
  updateTitle: string;
  name: string;
  link: string;
  giftAddedMessage: string;
  giftUpdatedMessage: string;
}

export interface ShareTranslations {
  title: string;
  copyToClipboard: string;
  successMessage: string;
}

export interface MiscellaneousTranslations {
  anonymous: string;
  cancel: string;
  close: string;
  delete: string;
  error: string;
  loading: string;
  no: string;
  ok: string;
  save: string;
  yes: string;
}
