export default {

  global: {
    page: 'Sayfa',
    roles: 'Roller',
  },

  configure: {

    title: 'Yapılandırma',
    description: 'Sunucunun tüm konfigürasyonu bu menü üzerinden yapılabilir.',
    placeholder: 'Düzenlemek için bir kategori seçin.',

    autorole: {

      menu: {
        title: 'Otorol',
        description: 'Yeni kullanıcılara rol(ler) atar.',
      },

      placeholder: {
        1: 'Etkinleştirmek için bir rol seçin.',
        2: 'Bir rol seçin.',
        3: 'Seçilebilir rol yok.',
      },

      selection_description: {
        1: 'Kaldırmak için seçin.',
        2: 'Bu role erişiminiz yok.',
      },

      title: 'Otorol Yapılandırması',
      description: 'Bu ayar, bir kullanıcı sunucuya katıldığında botun otomatik olarak rol atayıp atamayacağını yapılandırır.',
    },

    language: {

      menu: {
        title: 'Dil',
        description: 'Botun sunucudaki dilini değiştirir.',
      },

      title: 'Dil Yapılandırması',
      description: 'Bu ayar, komutlara yanıt verirken botun kullanacağı dili yapılandırır.',
    },
  },
};