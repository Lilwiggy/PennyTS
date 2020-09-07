import { CommandClient } from 'detritus-client';
import {
  Message,
  ChannelGuildText,
  User,
  Member,
} from 'detritus-client/lib/structures';
import { Context } from 'detritus-client/lib/command';
import { Duration } from 'moment';
import { ItemInfo } from './shop';
import fetch from 'node-fetch';

export const chanReg = /<#(\d+)>/;
export const roleReg = /<@&(\d+)>/;
export const emojiReg = /^<a?:(\w+):(\d+)>$/;

export interface PageField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface Page {
  author?: {
    iconUrl?: string;
    name?: string;
    url?: string;
  };
  thumbnail?: {
    url: string;
  };
  description?: string;
  title?: string;
  color?: number;
  image?: {
    url: string;
  };
  fields?: PageField[];
  footer?: {
    text: string;
    iconUrl?: string;
  };
  url?: string;
  timestamp?: string;
}

export function shopEmbed(ctx: Context, currItem: ItemInfo): Page {
  return {
    author: {
      url: currItem.oc.url,
      name: `Shop info for ${currItem.name}`,
    },
    title: `Original art by ${currItem.oc.name}`,
    color: 9043849,
    fields: [
      {
        name: 'Price:',
        value: currItem.price,
      },
      {
        name: 'Purchase:',
        value: `${ctx.prefix}set ${currItem.type} ${currItem.name}`,
      },
    ],
    image: {
      url: currItem.image,
    },
  };
}

export function humanize(duration: Duration) {
  let ret = [];

  const days = duration.days();
  const hours = duration.hours();
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  if (days > 0) {
    ret.push(`${days} day${days > 1 ? 's' : ''}`);
  }
  if (hours > 0) {
    ret.push(`${hours} hour${hours > 1 ? 's' : ''}`);
  }
  if (minutes > 0) {
    ret.push(
      `${ret.length > 0 ? 'and ' : ''}${minutes} minute${
        minutes > 1 ? 's' : ''
      }`
    );
  }

  // We don't want to display seconds if we have days or hours.
  if (days == 0 && hours == 0 && seconds > 0) {
    ret.push(
      `${ret.length > 0 ? 'and ' : ''}${seconds} second${
        seconds > 1 ? 's' : ''
      }`
    );
  }

  return ret.join(', ');
}

export interface EventHandler {
  event: string;
  listener: (client: CommandClient, payload: any) => Promise<void>;
}

// So that linter doesn't complain
export interface FetchedStarData {
  original?: Message;
  starred?: Message;
  starboard?: ChannelGuildText;
  limit?: number;
}

const URL_REG = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/i;

export function convertEmbed(me: User | Member, message: Message, embed: Page) {
  if (message.author.id === me.id && message.embeds.size > 0) {
    let msgEmbed = message.embeds.get(0)!;
    embed.image = msgEmbed.image; // Can be Respective Object OR undefined
    embed.description = msgEmbed.description;
    embed.thumbnail = msgEmbed.thumbnail;
  } else {
    if (URL_REG.test(message.content)) {
      embed.image = {
        url: message.content.match(URL_REG)![0],
      };
    } else if (message.attachments.size > 0) {
      embed.image = {
        url: message.attachments.first()!.url!,
      };
    }
    if (message.content.length > 0) {
      embed.description = message.content;
    }
  }
  return embed;
}

const ESCAPE_MARKDOWN = /([_\\~|\*`]|>(?:>>)?\s)/g;

export function escapeMarkdown(text: string): string {
  return text.replace(ESCAPE_MARKDOWN, '\\$1');
}

export function stringExtractor(str: string, quotes: string[] = ['"', "'"]) {
  let startIndex = 0,
    nextIndex = 0;
  let finalStrings = [];
  str = str
    .replace('‘', "'")
    .replace('’', "'")
    .replace('”', '"')
    .replace('“', '"');
  for (const char of str) {
    if (quotes.includes(char)) {
      if (startIndex == 0) startIndex = nextIndex + 1;
      else {
        finalStrings.push(str.slice(startIndex, nextIndex));
        startIndex = 0;
      }
    }

    nextIndex += 1;
  }

  return finalStrings;
}

export async function fetchRandomNumber(
  length?: number
): Promise<number | number[]> {
  let l = length || 1;
  let res = await fetch(
    `https://qrng.anu.edu.au/API/jsonI.php?length=${l}&type=uint8`
  ).then((d) => d.json());
  if (!res.success) throw new Error('No number returned!');
  if (l === 1) return res.data[0] as number;
  else return res.data;
}

export function decimalToHex(number: number) {
  let hexyBoi = number.toString(16);
  return hexyBoi.length % 2 ? '0' + hexyBoi : hexyBoi;
}

export enum GuildFlags {
  UNSET = 0,
  LEVELS = 1 << 0,
  MOD_LOGS = 1 << 1,
  AUTO_QUOTE = 1 << 2,
  AUTO_ROLE = 1 << 3,
  PREMIUM = 1 << 4, // I have no clue if I will ever use this one but there just in case
  WELCOMES = 1 << 5,
  SELF_ROLE = 1 << 6,
  ROLE_EDITS = 1 << 7,
}

export const GuildFlagReactions: Record<string, GuildFlags> = {
  '0️⃣': GuildFlags.LEVELS,
  '1️⃣': GuildFlags.MOD_LOGS,
  '2️⃣': GuildFlags.AUTO_QUOTE,
  '3️⃣': GuildFlags.AUTO_ROLE,
  '4️⃣': GuildFlags.WELCOMES,
};
