export default {

  global: {
    page: 'Page',
    roles: 'Roles',
  },

  configure: {

    title: 'Configuration',
    description: 'All configuration of the server can be done through this menu.',
    placeholder: 'Select a category to edit.',

    autorole: {

      menu: {
        title: 'Autorole',
        description: 'Assigns role(s) to new users.',
      },

      placeholder: {
        1: 'Select a role to activate.',
        2: 'Select a role.',
        3: 'There are no selectable roles.',
      },

      selection_description: {
        1: 'Select to remove.',
        2: 'You do not have access to this role.',
      },

      title: 'Autorole Configuration',
      description: 'This setting configure whether or not the bot will automatically assign role to a user when they join the server.',
    },

    language: {

      menu: {
        title: 'Language',
        description: 'Changes the bot\'s language on the server.',
      },

      title: 'Language Configuration',
      description: 'This setting configures the language the bot will use when responding to commands.',
    },
  },
};