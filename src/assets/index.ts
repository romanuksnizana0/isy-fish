/**
 * The fixed Codex asset contract. Only these names ever exist — referencing
 * anything else fails the bundle, so every image in the app comes from here.
 */
export const bgGame = require('../../assets/bg_game.png');
export const logo = require('../../assets/logo.png');
export const iconHome = require('../../assets/icon_home.png');
export const iconPause = require('../../assets/icon_pause.png');
export const buttonRect = require('../../assets/button_rect.png');
export const buttonRound = require('../../assets/button_round.png');

const sprite1 = require('../../assets/sprite_1.png');
const sprite2 = require('../../assets/sprite_2.png');
const sprite3 = require('../../assets/sprite_3.png');
const sprite4 = require('../../assets/sprite_4.png');
const sprite5 = require('../../assets/sprite_5.png');

/** sprite_1 .. sprite_5 in order — the five species of the season. */
export const SPRITES = [sprite1, sprite2, sprite3, sprite4, sprite5];

export const assets = {
  bgGame,
  logo,
  iconHome,
  iconPause,
  buttonRect,
  buttonRound,
  sprites: SPRITES,
};
