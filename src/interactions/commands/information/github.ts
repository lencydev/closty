import { Command } from 'Command';

import axios, { AxiosResponse } from 'axios';

import {
  Embed,
  parseEmoji,
} from 'Root';

export default class extends Command {

  constructor () {
    super({
      name: 'github',
      options: [
        {
          name: 'user',
          description: 'Shows the Github user\'s information.',
          type: 1,
          options: [
            {
              name: 'name',
              description: 'Github user name.',
              type: 3,
              required: true,
            },
            {
              name: 'ephemeral',
              description: 'Ephemeral response.',
              type: 5,
              required: false,
            },
          ],
        },
        {
          name: 'organization',
          description: 'Shows the Github organization\'s information.',
          type: 1,
          options: [
            {
              name: 'name',
              description: 'Github organization name.',
              type: 3,
              required: true,
            },
            {
              name: 'ephemeral',
              description: 'Ephemeral response.',
              type: 5,
              required: false,
            },
          ],
        },
        {
          name: 'repository',
          description: 'Shows the Github repository\'s information.',
          type: 1,
          options: [
            {
              name: 'name',
              description: 'Github repository name.',
              type: 3,
              required: true,
            },
            {
              name: 'ephemeral',
              description: 'Ephemeral response.',
              type: 5,
              required: false,
            },
          ],
        },
      ],

      cooldown: { time: '10s', global: true },

      category: 'information',

      developerOnly: false,
      ownerOnly: false,
      permissions: false,

      enabled: true,
    });
  };

  async execute ({ interaction }: { interaction: CommandInteraction; }): Execute {

    let ephemeral: boolean = interaction.options.getBoolean('ephemeral');

    if (interaction.options.getSubcommand(false) === 'user') {

      let user: string = interaction.options.getString('name');

      if (!user.match(/^[A-Za-z0-9- ]+$/)) return await interaction.errorReply({ content: `The value does not fit the format.` });

      await axios.get(`https://api.github.com/users/${user.replaceAll(` `, `-`)}`).then(async (res: AxiosResponse) => {

        let repositories: any[] = [];

        await axios.get(res.data.repos_url).then(async (res: AxiosResponse) => repositories = res.data);

        await ctx.menu.paginate(interaction, {
          ephemeral,
          pageSize: 10,
          sorts: [
            {
              emoji: Emoji.SelectMenu.Date.NewToOld,
              label: `Date of Edited: New to Old`,
              sort: (first: any, last: any) => new Date(last.pushed_at).getTime() - new Date(first.pushed_at).getTime(),
            },
            {
              emoji: Emoji.SelectMenu.Date.OldToNew,
              label: `Date of Edited: Old to New`,
              sort: (first: any, last: any) => new Date(first.pushed_at).getTime() - new Date(last.pushed_at).getTime(),
            },
          ],
          menus: async (sort: (first: any, last: any) => number) => [
            {
              label: `Information`,
              value: [
                new Embed({
                  color: 0x161B22,
                  thumbnail: {
                    url: res.data.avatar_url,
                  },
                  author: {
                    name: `User Information`,
                    iconURL: client.emojis.cache.get(parseEmoji(Emoji.Github).id).url,
                    url: `https://github.com`,
                  },
                  title: `${res.data.name ? res.data.name : res.data.login}`,
                  url: res.data.html_url,
                  description: res.data.bio ? ctx.case.filter(res.data.bio) : undefined,
                  fields: [
                    { name: `Company`, value: `${res.data.company && res.data.company.startsWith(`@`) ? `[${res.data.company.slice(1)}](https://github.com/${res.data.company.slice(1).replaceAll(` `, `-`)})` : `None`}`, inline: false },
                    { name: `Repositories`, value: `${ctx.case.number(res.data.public_repos)}`, inline: true },
                    { name: `Followers`, value: `${ctx.case.number(res.data.followers)}`, inline: true },
                    { name: `Following`, value: `${ctx.case.number(res.data.following)}`, inline: true },
                    { name: `Registration Date`, value: `${new Date(res.data.created_at).toUnix('F')} (${new Date(res.data.created_at).toUnix('R')})`, inline: false },
                  ],
                }),
              ],
              links: [
                {
                  label: `User URL`,
                  url: res.data.html_url,
                },
              ],
            },
            {
              label: `Repositories (${ctx.case.number(repositories.length)})`,
              value: repositories.length ? repositories.sort(sort).map((repository: any, index: number) => `\`${index + 1}.\` [${repository.name}](${repository.html_url} '${repository.full_name}') (${new Date(repository.pushed_at).toUnix('R')})`) : [],
              links: [
                {
                  label: `Repositories URL`,
                  url: `https://github.com/${res.data.login}?tab=repositories`,
                },
              ],
            },
          ],
          embeds: async (data: Parameters<PaginateOptions['embeds']>[0]) => {
            return [
              new Embed({
                color: 0x161B22,
                thumbnail: {
                  url: res.data.avatar_url,
                },
                author: {
                  name: `User Repositories`,
                  iconURL: client.emojis.cache.get(parseEmoji(Emoji.Github).id).url,
                  url: `https://github.com`,
                },
                title: `${res.data.name ? res.data.name : res.data.login}`,
                url: res.data.html_url,
                description: data.value.slice(data.first, data.last).join(`\n`),
              }),
            ];
          },
        });

      }).catch(async () => {

        await interaction.errorReply({ content: `Couldn't find a user named \`${ctx.case.filter(user.replaceAll(` `, `-`))}\` on Github.` });
      });
    };

    if (interaction.options.getSubcommand(false) === 'organization') {

      let organization: string = interaction.options.getString('name');

      if (!organization.match(/^[A-Za-z0-9- ]+$/)) return await interaction.errorReply({ content: `The value does not fit the format.` });

      await axios.get(`https://api.github.com/orgs/${organization.replaceAll(` `, `-`)}`).then(async (res: AxiosResponse) => {

        await ctx.menu.paginate(interaction, {
          ephemeral,
          menus: async () => [
            {
              value: [
                new Embed({
                  color: 0x161B22,
                  thumbnail: {
                    url: res.data.avatar_url,
                  },
                  author: {
                    name: `Organization Information`,
                    iconURL: client.emojis.cache.get(parseEmoji(Emoji.Github).id).url,
                    url: `https://github.com`,
                  },
                  title: `${res.data.name ? res.data.name : res.data.login}`,
                  url: res.data.html_url,
                  description: res.data.description ? ctx.case.filter(res.data.description) : undefined,
                  fields: [
                    { name: `Repositories`, value: `${ctx.case.number(res.data.public_repos)}`, inline: true },
                    { name: `Followers`, value: `${ctx.case.number(res.data.followers)}`, inline: true },
                    { name: `Following`, value: `${ctx.case.number(res.data.following)}`, inline: true },
                    { name: `Creation Date`, value: `${new Date(res.data.created_at).toUnix('F')} (${new Date(res.data.created_at).toUnix('R')})`, inline: false },
                  ],
                }),
              ],
              links: [
                {
                  label: `Organization URL`,
                  url: res.data.html_url,
                },
              ],
            },
          ],
        });

      }).catch(async () => {

        await interaction.errorReply({ content: `Couldn't find a organization named \`${ctx.case.filter(organization.replaceAll(` `, `-`))}\` on Github.` });
      });
    };

    if (interaction.options.getSubcommand(false) === 'repository') {

      let repository: string = interaction.options.getString('name');

      if (!repository.match(/^[A-Za-z0-9-/._ ]+$/)) return await interaction.errorReply({ content: `The value does not fit the format.` });

      await axios.get(`https://api.github.com/repos/${repository.replaceAll(` `, `-`)}`).then(async (res: AxiosResponse) => {

        let languages: string[] = [];

        await axios.get(res.data.languages_url).then(async (res: AxiosResponse) => {

          await Promise.all(Object.keys(res.data).map((language: string) => languages.push(language)));
        });

        await ctx.menu.paginate(interaction, {
          ephemeral,
          menus: async () => [
            {
              value: [
                new Embed({
                  color: 0x161B22,
                  thumbnail: {
                    url: res.data.owner.avatar_url,
                  },
                  author: {
                    name: `Repository Information`,
                    iconURL: client.emojis.cache.get(parseEmoji(Emoji.Github).id).url,
                    url: `https://github.com`,
                  },
                  title: `${res.data.full_name} ${res.data.is_template ? `(Template)` : ``}`,
                  url: res.data.html_url,
                  description: res.data.description ? ctx.case.filter(res.data.description) : undefined,
                  fields: [
                    { name: `Fork`, value: `${ctx.case.number(res.data.forks_count)}`, inline: true },
                    { name: `Star`, value: `${ctx.case.number(res.data.stargazers_count)}`, inline: true },
                    { name: `License`, value: `${res.data.license ? `[${res.data.license.spdx_id}](http://choosealicense.com/licenses/${res.data.license.key})` : `None`}`, inline: true },
                    { name: `Owner`, value: `[${res.data.owner.login}](${res.data.owner.html_url})`, inline: true },
                    { name: `\u200B`, value: `\u200B`, inline: true },
                    { name: `Languages`, value: `${languages.length ? languages.map((language: string) => `[${language}](https://www.google.com/search?q=${language})`).join(`, `) : `None`}`, inline: true },
                    { name: `Update Date`, value: `${new Date(res.data.updated_at).toUnix('F')} (${new Date(res.data.updated_at).toUnix('R')})`, inline: false },
                    { name: `Creation Date`, value: `${new Date(res.data.created_at).toUnix('F')} (${new Date(res.data.created_at).toUnix('R')})`, inline: false },
                  ],
                  image: {
                    url: `https://opengraph.githubassets.com/dianabot/${res.data.full_name}`,
                  },
                }),
              ],
              links: [
                {
                  label: `Repository URL`,
                  url: res.data.html_url,
                },
              ],
            },
          ],
        });

      }).catch(async () => {

        await interaction.errorReply({ content: `Couldn't find a repository named \`${ctx.case.filter(repository.replaceAll(` `, `-`))}\` on Github.` });
      });
    };
  };
};