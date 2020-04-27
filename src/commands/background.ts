import { Context } from 'detritus-client/lib/command';
import { Paginator } from '../modules/paginator';
import { Embed } from 'detritus-client/lib/utils';

export const background = {
  name: 'background',
  run: async (ctx: Context) => {
    let bg: Array<any> = [];
    let i = 0;
    let data = await ctx.commandClient
      .query(`SELECT * FROM \`userB\` WHERE User_ID = '232614905533038593'`)
      .catch((r) => {
        if (r == 'Query returned nothing') {
          ctx.reply('You do not own any backgrounds.');
        }
      });

    data.forEach((element: any) => {
      if (element.name !== 'default') {
        bg.push(embed(element.name));
      }
    });

    try {
      let pg = new Paginator(ctx, bg);

      pg.start();
    } catch (error) {
      console.log(error);
    }
  },
};

function embed(bg: any) {
  return {
    title: bg,
    color: 9043849,
    image: {
      url: `https://penny.wiggy.dev/assets/backgrounds/${bg}.png`,
    },
  };
}
